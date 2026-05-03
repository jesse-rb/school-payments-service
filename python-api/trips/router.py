import datetime
from decimal import Decimal
from typing import ClassVar
from uuid import UUID
from pydantic import BaseModel, ConfigDict
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload
from fastapi import APIRouter, Depends
from db.postgres import get_db

# from trips.service import get_all
from models.service import Trip

router = APIRouter()


class SchoolResponse(BaseModel):
    model_config: ClassVar[ConfigDict] = ConfigDict(from_attributes=True)
    id: UUID
    name: str
    created_at: datetime.datetime
    updated_at: datetime.datetime


class TripResponse(BaseModel):
    model_config: ClassVar[ConfigDict] = ConfigDict(from_attributes=True)
    id: UUID
    name: str
    cost: float
    start_datetime: datetime.datetime
    end_datetime: datetime.datetime
    school_id: UUID
    school: SchoolResponse
    created_at: datetime.datetime
    updated_at: datetime.datetime


class ListResponse(BaseModel):
    data: list[TripResponse]


class GetResponse(BaseModel):
    data: TripResponse


@router.get("")
async def get_all_trips(db: Session = Depends(get_db)) -> ListResponse:
    stmt = select(Trip).options(selectinload(Trip.school))
    trips = db.execute(stmt).scalars().all()
    return ListResponse(data=[TripResponse.model_validate(trip) for trip in trips])


@router.get("/{id}")
async def get_trip(id: UUID, db: Session = Depends(get_db)) -> GetResponse:
    stmt = select(Trip).where(Trip.id.__eq__(id)).options(selectinload(Trip.school))
    trip = db.execute(stmt).scalar_one_or_none()
    return GetResponse(data=TripResponse.model_validate(trip))
