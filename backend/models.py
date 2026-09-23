from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from database import Base

class Provider(Base):
    __tablename__ = "providers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    
    products = relationship("Product", back_populates="provider")
    purchases = relationship("Purchase", back_populates="provider")

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    category = Column(String, default="Abarrotes y Harinas", index=True)
    current_stock = Column(Float, default=0.0)
    ideal_stock = Column(Float, default=0.0)
    unit_measure = Column(String)
    unit_price = Column(Float, default=0.0)
    last_purchased_price = Column(Float, default=0.0)
    last_purchased_date = Column(DateTime, nullable=True)
    
    provider_id = Column(Integer, ForeignKey("providers.id"), nullable=True)
    provider = relationship("Provider", back_populates="products")
    
    purchase_items = relationship("PurchaseItem", back_populates="product")
    consumption_logs = relationship("ConsumptionLog", back_populates="product")
    recipe_items = relationship("RecipeItem", back_populates="product")

class Purchase(Base):
    __tablename__ = "purchases"

    id = Column(Integer, primary_key=True, index=True)
    provider_id = Column(Integer, ForeignKey("providers.id"), nullable=False)
    purchase_date = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    ticket_number = Column(String, nullable=True)
    total_cost = Column(Float, default=0.0)
    notes = Column(String, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    provider = relationship("Provider", back_populates="purchases")
    items = relationship("PurchaseItem", back_populates="purchase", cascade="all, delete-orphan")

class PurchaseItem(Base):
    __tablename__ = "purchase_items"

    id = Column(Integer, primary_key=True, index=True)
    purchase_id = Column(Integer, ForeignKey("purchases.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Float, default=0.0)
    unit_price_paid = Column(Float, default=0.0)
    subtotal = Column(Float, default=0.0)

    purchase = relationship("Purchase", back_populates="items")
    product = relationship("Product", back_populates="purchase_items")

class ConsumptionLog(Base):
    __tablename__ = "consumption_logs"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Float, default=0.0)
    unit_price_at_moment = Column(Float, default=0.0)
    total_cost = Column(Float, default=0.0)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    shift_notes = Column(String, nullable=True)
    reason_type = Column(String, default="MERMA", index=True) # MERMA, LIMPIEZA, COMIDA_PERSONAL, OTRO, VENTA_POS
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    product = relationship("Product", back_populates="consumption_logs")
    user = relationship("User")

# --- NUEVOS MODELOS PARA PUNTO DE VENTA (POS), RECETAS Y CORTES DIARIOS ---

class MenuItem(Base):
    """Platillo o producto que se vende en el menú del punto de venta (POS)."""
    __tablename__ = "menu_items"

    id = Column(Integer, primary_key=True, index=True)
    pos_name = Column(String, unique=True, index=True) # Nombre tal como sale en el Excel del POS
    category = Column(String, default="COMIDA", index=True) # PIZZETAS, COMIDA, BEBIDAS, COCKTAIL, POSTRES, etc.
    sale_price = Column(Float, default=0.0)
    
    recipes = relationship("RecipeItem", back_populates="menu_item", cascade="all, delete-orphan")

class RecipeItem(Base):
    """Escandallo: Ingrediente de almacén necesario para elaborar 1 unidad de MenuItem."""
    __tablename__ = "recipe_items"

    id = Column(Integer, primary_key=True, index=True)
    menu_item_id = Column(Integer, ForeignKey("menu_items.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False) # Insumo en tabla products
    quantity_needed = Column(Float, default=0.0) # Cantidad a descontar por cada platillo vendido

    menu_item = relationship("MenuItem", back_populates="recipes")
    product = relationship("Product", back_populates="recipe_items")

class SalesCut(Base):
    """Corte de caja y ventas diario importado desde el Excel/CSV del POS."""
    __tablename__ = "sales_cuts"

    id = Column(Integer, primary_key=True, index=True)
    cut_date_str = Column(String) # Ej: "domingo, 13 septiembre 09:52 p. m."
    cut_date = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    total_sales = Column(Float, default=0.0)
    cash_sales = Column(Float, default=0.0)
    card_sales = Column(Float, default=0.0)
    transfer_sales = Column(Float, default=0.0)
    tips_cash = Column(Float, default=0.0)
    tips_card = Column(Float, default=0.0)
    tips_total = Column(Float, default=0.0)
    cash_balance = Column(Float, default=0.0)
    total_items_sold = Column(Integer, default=0)
    total_cogs = Column(Float, default=0.0) # Cost of Goods Sold (Costo de materia prima)
    gross_profit = Column(Float, default=0.0) # total_sales - total_cogs
    food_cost_percentage = Column(Float, default=0.0) # (total_cogs / total_sales) * 100
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    items = relationship("SalesCutItem", back_populates="sales_cut", cascade="all, delete-orphan")

class SalesCutItem(Base):
    """Cada renglón de platillo vendido dentro de un corte."""
    __tablename__ = "sales_cut_items"

    id = Column(Integer, primary_key=True, index=True)
    sales_cut_id = Column(Integer, ForeignKey("sales_cuts.id"), nullable=False)
    product_name = Column(String, index=True)
    category = Column(String, nullable=True)
    quantity = Column(Float, default=0.0)
    unit_price = Column(Float, default=0.0)
    total_amount = Column(Float, default=0.0)
    cogs_cost = Column(Float, default=0.0) # Costo de los insumos que consumió este platillo

    sales_cut = relationship("SalesCut", back_populates="items")

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String, default="operator") # "admin" o "operator"
    
    logs = relationship("AuditLog", back_populates="user")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String) # Ej: "UPDATE_STOCK", "MARK_BOUGHT", "REGISTER_PURCHASE", "APPLY_POS_CUT"
    details = Column(String)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="logs")