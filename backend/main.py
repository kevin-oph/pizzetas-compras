from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict
from pydantic import BaseModel

# Importaciones locales
import models
from database import engine, get_db

# Crea las tablas en la BD si no existen
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Pizzetas Artesanales API")

# Configuración de CORS para que React pueda conectarse sin bloqueos
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Esquemas de Pydantic para peticiones POST
class StockUpdateItem(BaseModel):
    product_id: int
    quantity_to_add: float


@app.get("/")
def read_root():
    return {"message": "API de Inventario Activa"}


@app.get("/api/shopping-list", response_model=Dict[str, List[dict]])
def generate_shopping_list(db: Session = Depends(get_db)):
    products_to_buy = db.query(models.Product).filter(models.Product.current_stock < models.Product.ideal_stock).all()
    shopping_list = {}
    
    for product in products_to_buy:
        provider_name = product.provider.name if product.provider else "Sin Proveedor Asignado"
        if provider_name not in shopping_list:
            shopping_list[provider_name] = []
            
        shopping_list[provider_name].append({
            "product_id": product.id,
            "name": product.name,
            "buy_amount": product.ideal_stock - product.current_stock,
            "unit": product.unit_measure
        })
        
    return shopping_list


@app.get("/api/dashboard-stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    products_to_buy = db.query(models.Product).filter(models.Product.current_stock < models.Product.ideal_stock).all()
    
    total_items = len(products_to_buy)
    
    provider_counts = {}
    for p in products_to_buy:
        p_name = p.provider.name if p.provider else "Otros"
        provider_counts[p_name] = provider_counts.get(p_name, 0) + 1
        
    chart_data = [{"name": k, "value": v} for k, v in provider_counts.items()]
    top_provider = max(provider_counts, key=provider_counts.get) if provider_counts else "Ninguno"
    
    return {
        "total_items": total_items,
        "chart_data": chart_data,
        "top_provider": top_provider
    }


@app.get("/api/products-analytics")
def get_products_analytics(db: Session = Depends(get_db)):
    products = db.query(models.Product).all()
    
    if not products:
        return {
            "max_item": {},
            "min_item": {},
            "top_volume_chart": []
        }

    max_quantity = max(products, key=lambda p: p.ideal_stock)
    min_quantity = min(products, key=lambda p: p.ideal_stock)
    top_volume = sorted(products, key=lambda p: p.ideal_stock, reverse=True)[:5]
    
    return {
        "max_item": {
            "name": max_quantity.name, 
            "amount": max_quantity.ideal_stock, 
            "unit": max_quantity.unit_measure
        },
        "min_item": {
            "name": min_quantity.name, 
            "amount": min_quantity.ideal_stock, 
            "unit": min_quantity.unit_measure
        },
        "top_volume_chart": [
            {"name": p.name, "amount": p.ideal_stock} for p in top_volume
        ]
    }


@app.post("/api/update-stock")
def update_stock(items: List[StockUpdateItem], db: Session = Depends(get_db)):
    for update in items:
        product = db.query(models.Product).filter(models.Product.id == update.product_id).first()
        if product:
            product.current_stock += update.quantity_to_add
    db.commit()
    return {"message": "¡Stock actualizado exitosamente en tiempo real!"}



@app.get("/api/inventory-catalog")
def get_inventory_catalog(db: Session = Depends(get_db)):
    products = db.query(models.Product).all()
    catalog = {}
    
    for product in products:
        provider_name = product.provider.name if product.provider else "Sin Proveedor Asignado"
        if provider_name not in catalog:
            catalog[provider_name] = []
            
        catalog[provider_name].append({
            "product_id": product.id,
            "name": product.name,
            "current_stock": product.current_stock,
            "ideal_stock": product.ideal_stock,
            "unit": product.unit_measure
        })
        
    return catalog