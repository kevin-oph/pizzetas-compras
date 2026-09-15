from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict

# Importaciones locales
import models
from database import engine, get_db

# Crea las tablas en la BD si no existen (ideal para empezar rápido)
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Pizzetas Artesanales API")

# Configuración de CORS para que React pueda conectarse sin bloqueos
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # En producción cambiar por la URL de tu frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
            "amount_needed": product.ideal_stock - product.current_stock,
            "unit": product.unit_measure
        })
        
    return shopping_list


@app.get("/api/dashboard-stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    # Buscamos todos los productos que faltan por comprar
    products_to_buy = db.query(models.Product).filter(models.Product.current_stock < models.Product.ideal_stock).all()
    
    total_items = len(products_to_buy)
    
    # Contamos cuántos productos faltan por cada proveedor
    provider_counts = {}
    for p in products_to_buy:
        p_name = p.provider.name if p.provider else "Otros"
        provider_counts[p_name] = provider_counts.get(p_name, 0) + 1
        
    # Formateamos los datos exactamente como Recharts los necesita
    chart_data = [{"name": k, "value": v} for k, v in provider_counts.items()]
    
    # Calculamos el proveedor con mayor desabasto
    top_provider = max(provider_counts, key=provider_counts.get) if provider_counts else "Ninguno"
    
    return {
        "total_items": total_items,
        "chart_data": chart_data,
        "top_provider": top_provider
    }
    
    
@app.get("/api/products-analytics")
def get_products_analytics(db: Session = Depends(get_db)):
    products = db.query(models.Product).all()
    
    # 1. Producto que se compra en mayor cantidad (mayor stock ideal)
    max_quantity = max(products, key=lambda p: p.ideal_stock) if products else None
    
    # 2. Producto que se compra en menor cantidad
    min_quantity = min(products, key=lambda p: p.ideal_stock) if products else None
    
    # 3. Top 5 productos con mayor volumen de compra (para una gráfica de barras detallada)
    top_volume = sorted(products, key=lambda p: p.ideal_stock, reverse=True)[:5]
    
    return {
        "max_item": {"name": max_quantity.name, "amount": max_quantity.ideal_stock, "unit": max_quantity.unit_measure} if max_quantity else {},
        "min_item": {"name": min_quantity.name, "amount": min_quantity.ideal_stock, "unit": min_quantity.unit_measure} if min_quantity else {},
        "top_volume_chart": [{"name": p.name, "amount": p.ideal_stock} for p in top_volume]
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

    # Producto con mayor volumen de compra
    max_quantity = max(products, key=lambda p: p.ideal_stock)
    # Producto con menor volumen de compra
    min_quantity = min(products, key=lambda p: p.ideal_stock)
    
    # Top 5 productos con mayor volumen
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