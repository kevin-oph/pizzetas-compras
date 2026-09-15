from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

# Usamos SQLite para desarrollo local ágil. Esto creará un archivo pizzetas.db automáticamente.
SQLALCHEMY_DATABASE_URL = "sqlite:///./pizzetas.db"

# El argumento connect_args es específico para que SQLite funcione bien con FastAPI
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()