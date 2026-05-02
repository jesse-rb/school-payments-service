import decimal
from pydantic import BaseModel


class Trip(BaseModel):
    name: str
    price: decimal.Decimal
