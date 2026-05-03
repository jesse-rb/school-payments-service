from dotenv import load_dotenv

_ = load_dotenv()

import os
from fastapi import FastAPI

from config.service import app_config
from legacy_payments import router as legacy_payments
from trips import router as trips


app_config.is_local = os.environ["ENV"] == "local"

app = FastAPI()


@app.get("/health")
async def get_health():
    return {"status": "ok!"}


app.include_router(legacy_payments.router, prefix="/legacy/payments")
app.include_router(trips.router, prefix="/trips")
