from decimal import Decimal
from email import message
from uuid import UUID
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload
from fastapi import APIRouter, Depends, HTTPException
from db.postgres import get_db

# from trips.service import get_all
from legacy_payments.service import LegacyPaymentProcessor
from models.service import Payment, PaymentItem, Trip, User
from payments.deps import get_legacy_payment_processor

router = APIRouter()


class CreatePaymentRequestUser(BaseModel):
    id: UUID | None = None
    email: str
    firstname: str
    lastname: str


class CreatePaymentRequestStudent(BaseModel):
    id: UUID | None = None
    firstname: str
    lastname: str


class CreatePaymentRequestTrip(BaseModel):
    id: UUID | None = None
    students: list[CreatePaymentRequestStudent]


class CreatePaymentRequest(BaseModel):
    user: CreatePaymentRequestUser
    trips: list[CreatePaymentRequestTrip]
    amount: Decimal
    card_number: str = Field(pattern=r"^\d{16}$")  # (must be 16 digits)
    expiry_date: str = Field(pattern=r"^\d{2}/\d{2}$")  # (format: MM/YY)
    cvv: str = Field(pattern=r"^\d{3}$")  # (must be 3 digits)


@router.post("")
async def create_payment(
    data: CreatePaymentRequest,
    db: Session = Depends(get_db),
    legacy_payment_processor: LegacyPaymentProcessor = Depends(
        get_legacy_payment_processor
    ),
):
    # 1. Upsert primary guardian (user)
    if data.user.id:
        user = db.get(User, data.user.id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        user.email = data.user.email
        user.first_name = data.user.firstname
        user.last_name = data.user.lastname
    else:
        user = User(
            email=data.user.email,
            first_name=data.user.firstname,
            last_name=data.user.lastname,
        )
        db.add(user)
        db.flush()  # get user.id before we need it below

    # 2. Collect all trip IDs from request and validate they exist
    trip_ids = [trip.id for trip in data.trips if trip.id]
    db_trips: dict[UUID, Trip] = {}

    if trip_ids:
        fetched_trips = (
            db.execute(select(Trip).where(Trip.id.in_(trip_ids))).scalars().all()
        )
        db_trips = {trip.id: trip for trip in fetched_trips}

        missing = set(trip_ids) - set(db_trips.keys())
        if missing:
            raise HTTPException(status_code=404, detail=f"Trips not found: {missing}")

    # 3. Upsert dependants (students), linking them to the primary guardian
    # Build a map of student -> trip for PaymentItem creation later
    # Validate payment amount against all registrations
    student_trip_pairs: list[tuple[User, Trip]] = []
    sum_cost_all_registrations: Decimal = Decimal(0)

    for trip_data in data.trips:
        if not trip_data.id:
            raise HTTPException(status_code=400, detail="Each trip must have an id")

        db_trip = db_trips[trip_data.id]

        for student_data in trip_data.students:
            if student_data.id:
                student = db.get(User, student_data.id)
                if not student:
                    raise HTTPException(
                        status_code=404,
                        detail=f"Student {student_data.id} not found",
                    )
                student.first_name = student_data.firstname
                student.last_name = student_data.lastname
            else:
                # Try to match an existing dependant of this guardian by name
                student = db.execute(
                    select(User).where(
                        User.primary_guardian_id == user.id,
                        User.first_name == student_data.firstname,
                        User.last_name == student_data.lastname,
                    )
                ).scalar_one_or_none()

                if not student:
                    student = User(
                        first_name=student_data.firstname,
                        last_name=student_data.lastname,
                        primary_guardian_id=user.id,
                    )
                    db.add(student)
                    db.flush()

            sum_cost_all_registrations += db_trip.cost

            student_trip_pairs.append((student, db_trip))

    if data.amount != sum_cost_all_registrations:
        raise HTTPException(
            status_code=422,
            detail=f"amount: {data.amount} is incorrect, require: {sum_cost_all_registrations}",
        )

    # 4. Create the Payment record
    payment = Payment(
        amount=data.amount,
        receipt_sent=False,
        user_id=user.id,
    )
    db.add(payment)
    db.flush()

    # 5. Create PaymentItems - one per student/trip pair
    for student, trip in student_trip_pairs:
        # Integrate with legacy payment processor
        resp = legacy_payment_processor.process_payment(
            {
                "student_name": f"{student.first_name} {student.last_name}",
                "parent_name": f"{user.first_name} {user.last_name}",
                "amount": float(trip.cost),
                "card_number": data.card_number,
                "expiry_date": data.expiry_date,
                "cvv": data.cvv,
                "school_id": trip.school_id,
                "activity_id": trip.id,
            }
        )
        if not resp.success:
            raise HTTPException(
                422, detail=(resp.error_message or "somethign went wrong")
            )

        item = PaymentItem(
            type="trip",
            payment_id=payment.id,
            for_user_id=student.id,
            for_item_id=trip.id,
        )
        db.add(item)

    db.commit()
    db.refresh(payment)

    return {
        "payment_id": payment.id,
        "user_id": user.id,
        "amount": payment.amount,
        "students": [
            {
                "student_id": student.id,
                "trip_id": trip.id,
            }
            for student, trip in student_trip_pairs
        ],
    }
