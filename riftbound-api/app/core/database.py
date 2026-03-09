from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from app.core.config import settings

# Use psycopg2 driver for SQLAlchemy sync
engine = create_engine(
    settings.DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://") if settings.DATABASE_URL else "postgresql://postgres:postgres@localhost:5432/dummy",
    echo=False,
    pool_size=10,
    max_overflow=20,
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
