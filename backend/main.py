from fastapi import FastAPI, Depends, HTTPException, status
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


@app.get("/api/shopping-list")
def generate_shopping_list(db: Session = Depends(get_db)):
    # Traemos todos los productos donde el stock actual sea menor o igual al ideal, 
    # o donde el stock sea menor o igual a 3 (capturando los niveles naranjas y rojos)
    products = db.query(models.Product).all()
    
    shopping_data = {}
    for product in products:
        stock = product.current_stock or 0.0
        ideal = product.ideal_stock or 0.0
        
        # Un producto entra a la lista de compras si su stock es menor al ideal, 
        # o si está en nivel bajo/crítico (ej. stock <= 3 o menor que el ideal)
        if stock < ideal or (stock <= 3 and stock < ideal):
            provider_name = product.provider.name if product.provider else "Sin Proveedor"
            if provider_name not in shopping_data:
                shopping_data[provider_name] = {
                    "items": [],
                    "estimated_provider_cost": 0.0
                }
            
            # Si el stock es igual o mayor al ideal pero menor a 3, compramos la diferencia al ideal o al menos 1 unidad
            buy_amount = ideal - stock if ideal > stock else 1.0
            unit_price = product.unit_price or 0.0
            total_estimated_price = buy_amount * unit_price
            
            shopping_data[provider_name]["items"].append({
                "product_id": product.id,
                "name": product.name,
                "current_stock": stock,
                "ideal_stock": ideal,
                "buy_amount": buy_amount,
                "unit": product.unit_measure,
                "unit_price": unit_price,
                "total_estimated_price": total_estimated_price
            })
            
            shopping_data[provider_name]["estimated_provider_cost"] += total_estimated_price
        
    # Filtrar solo proveedores que tengan ítems pendientes
    final_shopping_data = {prov: data for prov, data in shopping_data.items() if len(data["items"]) > 0}
    
    return final_shopping_data


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


from pydantic import BaseModel

class StockUpdate(BaseModel):
    product_id: int
    new_stock: float

@app.post("/api/update-stock")
def update_stock(data: StockUpdate, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == data.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    
    product.current_stock = data.new_stock
    db.commit()
    return {"message": "Stock actualizado correctamente"}



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


from pydantic import BaseModel

class ProviderCreate(BaseModel):
    name: str

class ProductCreate(BaseModel):
    name: str
    provider_id: int
    ideal_stock: float
    current_stock: float
    unit_measure: str
    unit_price: float

@app.get("/api/providers")
def get_providers(db: Session = Depends(get_db)):
    return db.query(models.Provider).all()

@app.post("/api/providers")
def create_provider(data: ProviderCreate, db: Session = Depends(get_db)):
    new_prov = models.Provider(name=data.name)
    db.add(new_prov)
    db.commit()
    db.refresh(new_prov)
    return new_prov

@app.post("/api/products")
def create_product(data: ProductCreate, db: Session = Depends(get_db)):
    new_prod = models.Product(
        name=data.name,
        provider_id=data.provider_id,
        ideal_stock=data.ideal_stock,
        current_stock=data.current_stock,
        unit_measure=data.unit_measure,
        unit_price=data.unit_price
    )
    db.add(new_prod)
    db.commit()
    db.refresh(new_prod)
    return new_prod


class ProductUpdate(BaseModel):
    name: str
    ideal_stock: float
    unit_measure: str
    unit_price: float

@app.put("/api/products/{product_id}")
def update_product(product_id: int, data: ProductUpdate, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    
    product.name = data.name
    product.ideal_stock = data.ideal_stock
    product.unit_measure = data.unit_measure
    product.unit_price = data.unit_price
    db.commit()
    return {"message": "Producto actualizado con éxito"}

@app.delete("/api/products/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    
    db.delete(product)
    db.commit()
    return {"message": "Producto eliminado con éxito"}