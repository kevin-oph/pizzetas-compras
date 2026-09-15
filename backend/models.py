from sqlalchemy import Column, Integer, String, Float, ForeignKey, Enum, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from database import Base

class RoleEnum(enum.Enum):
    ADMIN = "ADMIN"
    EMPLOYEE = "EMPLOYEE"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(Enum(RoleEnum), default=RoleEnum.EMPLOYEE)

class Provider(Base):
    __tablename__ = "providers"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True)
    
    products = relationship("Product", back_populates="provider")

class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    unit_measure = Column(String)
    ideal_stock = Column(Float, default=0.0)
    current_stock = Column(Float, default=0.0)
    provider_id = Column(Integer, ForeignKey("providers.id"))
    price = Column(Float, default=0.0) # Costo unitario estimado
    
    provider = relationship("Provider", back_populates="products")

class Backorder(Base):
    __tablename__ = "backorders"
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    missing_amount = Column(Float)
    original_provider_id = Column(Integer, ForeignKey("providers.id"))
    status = Column(String, default="PENDING")
    created_at = Column(DateTime, default=datetime.utcnow)
    
    product = relationship("Product")