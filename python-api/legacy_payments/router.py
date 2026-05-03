from http import HTTPStatus
from fastapi import APIRouter
from pydantic import BaseModel, Field

from legacy_payments.service import LegacyPaymentProcessor
from utils.http import raise_http_error

router = APIRouter()


class Payment(BaseModel):
    student_name: str
    parent_name: str
    amount: float
    card_number: str = Field(pattern=r"^\d{16}$")  # (must be 16 digits)
    expiry_date: str = Field(pattern=r"^\d{2}/\d{2}$")  # (format: MM/YY)
    cvv: str = Field(pattern=r"^\d{3}$")  # (must be 3 digits)
    school_id: str
    activity_id: str


@router.post("/")
async def create_payment(payment_request: Payment):
    resp = LegacyPaymentProcessor().process_payment(payment_request.model_dump())
    if resp.success:
        return payment_request
    else:
        raise raise_http_error(HTTPStatus.BAD_REQUEST, resp.error_message or "")
