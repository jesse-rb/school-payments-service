from fastapi import HTTPException


def raise_http_error(status_code: int, msg: str):
    raise HTTPException(status_code, detail={"message": msg})
