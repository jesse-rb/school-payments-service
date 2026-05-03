from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload
from fastapi import APIRouter, Depends
from db.postgres import get_db

# from trips.service import get_all
from models.service import Trip

router = APIRouter()


@router.get("/")
async def get_all_trips(db: Session = Depends(get_db)):
    stmt = select(Trip).options(selectinload(Trip.school))
    trips = db.execute(stmt).scalars().all()
    return {"data": trips}
