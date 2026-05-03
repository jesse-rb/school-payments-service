from collections.abc import Generator
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from config.service import app_config

engine = create_engine(
    f"postgresql+psycopg://{os.environ['DATABASE_USER']}:{os.environ['DATABASE_PASS']}@{os.environ['DATABASE_HOST']}:{os.environ['DATABASE_PORT']}/{os.environ['DATABASE_NAME']}{'sslmode=disable' if app_config.is_local else ''}"
)
SessionLocal = sessionmaker(bind=engine)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
