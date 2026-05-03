from fastapi import FastAPI

from legacy_payments import router as legacy_payments

app = FastAPI()


@app.get("/health")
def get_health():
    return {"status": "ok!"}


app.include_router(legacy_payments.router, prefix="/legacy")
