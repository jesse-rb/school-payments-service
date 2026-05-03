from dotenv import load_dotenv

_ = load_dotenv()

import os
from fastapi import FastAPI

from config.service import app_config
from trips import router as trips
from payments import router as payments


app_config.is_local = os.environ["ENV"] == "local"

app = FastAPI()


@app.get("/health")
async def get_health():
    return {"status": "ok!"}


app.include_router(trips.router, prefix="/trips")
app.include_router(payments.router, prefix="/payments")
