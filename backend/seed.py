from database import SessionLocal, engine, Base
import models
from datetime import datetime, timedelta
import random

# Recrear tablas si es necesario
Base.metadata.create_all(bind=engine)

def seed_database():
    db = SessionLocal()

    # 1. Crear Proveedores / Tiendas
    providers_data = ["Sam's Club", "Walmart", "Carne Mart", "Central", "Valenciana"]
    providers = {}
    
    for p_name in providers_data:
        prov = db.query(models.Provider).filter_by(name=p_name).first()
        if not prov:
            prov = models.Provider(name=p_name)
            db.add(prov)
            db.commit()
            db.refresh(prov)
        providers[p_name] = prov

    # 2. Catálogo con Categorías Oficiales
    # Categorías: "Carnes", "Quesos y Lácteos", "Vinos y Licores", "Abarrotes y Harinas", "Desechables y Empaque", "Limpieza"
    initial_products = [
        # --- CARNE MART ---
        {"name": "Aros de cebolla", "category": "Abarrotes y Harinas", "current_stock": 3.0, "ideal_stock": 7.0, "unit": "bolsa", "price": 85.00, "provider": providers["Carne Mart"]},
        {"name": "Dedos de queso", "category": "Quesos y Lácteos", "current_stock": 2.0, "ideal_stock": 8.0, "unit": "bolsa", "price": 230.00, "provider": providers["Carne Mart"]},
        {"name": "Boneless", "category": "Carnes", "current_stock": 3.5, "ideal_stock": 7.0, "unit": "kg", "price": 125.00, "provider": providers["Carne Mart"]},
        {"name": "Papas gajo", "category": "Abarrotes y Harinas", "current_stock": 4.0, "ideal_stock": 7.0, "unit": "bolsa", "price": 90.00, "provider": providers["Carne Mart"]},
        {"name": "Papas francesas", "category": "Abarrotes y Harinas", "current_stock": 1.0, "ideal_stock": 4.0, "unit": "bolsa", "price": 85.00, "provider": providers["Carne Mart"]},
        {"name": "Costillas y órdenes", "category": "Carnes", "current_stock": 4.0, "ideal_stock": 10.0, "unit": "pzas", "price": 350.00, "provider": providers["Carne Mart"]},
        {"name": "Parmesano", "category": "Quesos y Lácteos", "current_stock": 0.5, "ideal_stock": 1.0, "unit": "bote", "price": 180.00, "provider": providers["Carne Mart"]},
        {"name": "Papa raquet", "category": "Abarrotes y Harinas", "current_stock": 2.0, "ideal_stock": 4.0, "unit": "bolsa", "price": 95.00, "provider": providers["Carne Mart"]},
        {"name": "Nuggets", "category": "Carnes", "current_stock": 1.0, "ideal_stock": 2.0, "unit": "bolsa", "price": 110.00, "provider": providers["Carne Mart"]},
        {"name": "Nuggets kids", "category": "Carnes", "current_stock": 0.0, "ideal_stock": 2.0, "unit": "bolsa", "price": 110.00, "provider": providers["Carne Mart"]},
        {"name": "Mozzarella barras", "category": "Quesos y Lácteos", "current_stock": 3.0, "ideal_stock": 8.0, "unit": "barras", "price": 140.00, "provider": providers["Carne Mart"]},
        {"name": "Peperoni", "category": "Carnes", "current_stock": 0.8, "ideal_stock": 2.0, "unit": "kg", "price": 160.00, "provider": providers["Carne Mart"]},
        {"name": "Bote para rellenar catsup", "category": "Desechables y Empaque", "current_stock": 1.0, "ideal_stock": 1.0, "unit": "pza", "price": 50.00, "provider": providers["Carne Mart"]},
        {"name": "Sangría", "category": "Vinos y Licores", "current_stock": 2.0, "ideal_stock": 5.0, "unit": "pzas", "price": 35.00, "provider": providers["Carne Mart"]},

        # --- SAM'S CLUB ---
        {"name": "Condimento italiano", "category": "Abarrotes y Harinas", "current_stock": 1.0, "ideal_stock": 2.0, "unit": "pzas", "price": 65.00, "provider": providers["Sam's Club"]},
        {"name": "Albahaca deshidratada", "category": "Abarrotes y Harinas", "current_stock": 1.0, "ideal_stock": 2.0, "unit": "pzas", "price": 55.00, "provider": providers["Sam's Club"]},
        {"name": "Perejil", "category": "Abarrotes y Harinas", "current_stock": 2.0, "ideal_stock": 3.0, "unit": "pzas", "price": 40.00, "provider": providers["Sam's Club"]},
        {"name": "Limón pimienta", "category": "Abarrotes y Harinas", "current_stock": 1.0, "ideal_stock": 2.0, "unit": "pzas", "price": 60.00, "provider": providers["Sam's Club"]},
        {"name": "Valentina", "category": "Abarrotes y Harinas", "current_stock": 6.0, "ideal_stock": 12.0, "unit": "pzas", "price": 18.00, "provider": providers["Sam's Club"]},
        {"name": "Maggi", "category": "Abarrotes y Harinas", "current_stock": 8.0, "ideal_stock": 16.0, "unit": "pzas", "price": 25.00, "provider": providers["Sam's Club"]},
        {"name": "Salsa inglesa", "category": "Abarrotes y Harinas", "current_stock": 10.0, "ideal_stock": 24.0, "unit": "pzas", "price": 25.00, "provider": providers["Sam's Club"]},
        {"name": "BBQ", "category": "Abarrotes y Harinas", "current_stock": 0.5, "ideal_stock": 1.0, "unit": "galón", "price": 260.00, "provider": providers["Sam's Club"]},
        {"name": "Ranch", "category": "Abarrotes y Harinas", "current_stock": 1.0, "ideal_stock": 2.0, "unit": "galón", "price": 280.00, "provider": providers["Sam's Club"]},
        {"name": "Buffalo", "category": "Abarrotes y Harinas", "current_stock": 1.5, "ideal_stock": 3.0, "unit": "galón", "price": 270.00, "provider": providers["Sam's Club"]},
        {"name": "Fusilli", "category": "Abarrotes y Harinas", "current_stock": 3.0, "ideal_stock": 6.0, "unit": "pzas", "price": 30.00, "provider": providers["Sam's Club"]},
        {"name": "Fettuchini", "category": "Abarrotes y Harinas", "current_stock": 2.0, "ideal_stock": 5.0, "unit": "pzas", "price": 32.00, "provider": providers["Sam's Club"]},
        {"name": "Spaghetti Paq grd", "category": "Abarrotes y Harinas", "current_stock": 0.0, "ideal_stock": 1.0, "unit": "paq", "price": 45.00, "provider": providers["Sam's Club"]},
        {"name": "Sanitas", "category": "Desechables y Empaque", "current_stock": 5.0, "ideal_stock": 16.0, "unit": "pzas", "price": 35.00, "provider": providers["Sam's Club"]},
        {"name": "Aderezo miel mostaza", "category": "Abarrotes y Harinas", "current_stock": 0.5, "ideal_stock": 1.0, "unit": "galón", "price": 290.00, "provider": providers["Sam's Club"]},
        {"name": "Vinagreta", "category": "Abarrotes y Harinas", "current_stock": 1.0, "ideal_stock": 2.0, "unit": "pzas", "price": 45.00, "provider": providers["Sam's Club"]},
        {"name": "Crema lincott", "category": "Quesos y Lácteos", "current_stock": 2.0, "ideal_stock": 4.0, "unit": "pzas", "price": 85.00, "provider": providers["Sam's Club"]},
        {"name": "Mantequilla barra", "category": "Quesos y Lácteos", "current_stock": 2.0, "ideal_stock": 4.0, "unit": "barras", "price": 28.00, "provider": providers["Sam's Club"]},
        {"name": "Jabón p/trastes", "category": "Limpieza", "current_stock": 0.5, "ideal_stock": 1.0, "unit": "galón", "price": 150.00, "provider": providers["Sam's Club"]},
        {"name": "Frijol", "category": "Abarrotes y Harinas", "current_stock": 2.0, "ideal_stock": 6.0, "unit": "kilos", "price": 38.00, "provider": providers["Sam's Club"]},
        {"name": "Aceituna negra", "category": "Abarrotes y Harinas", "current_stock": 0.0, "ideal_stock": 1.0, "unit": "bote", "price": 95.00, "provider": providers["Sam's Club"]},
        {"name": "Puré bolognese", "category": "Abarrotes y Harinas", "current_stock": 1.0, "ideal_stock": 3.0, "unit": "latas", "price": 42.00, "provider": providers["Sam's Club"]},
        {"name": "Albahaca fresca", "category": "Abarrotes y Harinas", "current_stock": 1.0, "ideal_stock": 2.0, "unit": "pzas", "price": 20.00, "provider": providers["Sam's Club"]},
        {"name": "Arroz", "category": "Abarrotes y Harinas", "current_stock": 0.0, "ideal_stock": 1.0, "unit": "kilo", "price": 32.00, "provider": providers["Sam's Club"]},
        {"name": "Encendedoras", "category": "Abarrotes y Harinas", "current_stock": 2.0, "ideal_stock": 4.0, "unit": "pzas", "price": 15.00, "provider": providers["Sam's Club"]},
        {"name": "Jamón serrano", "category": "Carnes", "current_stock": 0.3, "ideal_stock": 1.0, "unit": "kilo", "price": 450.00, "provider": providers["Sam's Club"]},
        {"name": "Queso de cabra", "category": "Quesos y Lácteos", "current_stock": 1.0, "ideal_stock": 2.0, "unit": "barra", "price": 85.00, "provider": providers["Sam's Club"]},
        {"name": "Panko", "category": "Abarrotes y Harinas", "current_stock": 0.5, "ideal_stock": 1.0, "unit": "caja", "price": 65.00, "provider": providers["Sam's Club"]},
        {"name": "Pepinillos", "category": "Abarrotes y Harinas", "current_stock": 0.0, "ideal_stock": 1.0, "unit": "bote", "price": 55.00, "provider": providers["Sam's Club"]},
        {"name": "Mayonesa", "category": "Abarrotes y Harinas", "current_stock": 0.5, "ideal_stock": 1.0, "unit": "bote", "price": 75.00, "provider": providers["Sam's Club"]},
        {"name": "Empanadas paquetitos", "category": "Abarrotes y Harinas", "current_stock": 1.0, "ideal_stock": 2.0, "unit": "paq", "price": 90.00, "provider": providers["Sam's Club"]},
        {"name": "Tabla de carne", "category": "Abarrotes y Harinas", "current_stock": 1.0, "ideal_stock": 2.0, "unit": "pzas", "price": 120.00, "provider": providers["Sam's Club"]},
        {"name": "Jitomate deshidratado", "category": "Abarrotes y Harinas", "current_stock": 0.0, "ideal_stock": 1.0, "unit": "frasco", "price": 110.00, "provider": providers["Sam's Club"]},
        {"name": "Pan de elote", "category": "Abarrotes y Harinas", "current_stock": 2.0, "ideal_stock": 5.0, "unit": "pzas", "price": 35.00, "provider": providers["Sam's Club"]},
        {"name": "Tequila José Cuervo", "category": "Vinos y Licores", "current_stock": 1.0, "ideal_stock": 2.0, "unit": "botellas", "price": 320.00, "provider": providers["Sam's Club"]},
        {"name": "Bacardi", "category": "Vinos y Licores", "current_stock": 0.0, "ideal_stock": 1.0, "unit": "botella", "price": 280.00, "provider": providers["Sam's Club"]},
        {"name": "Buchanan's", "category": "Vinos y Licores", "current_stock": 1.0, "ideal_stock": 2.0, "unit": "botellas", "price": 850.00, "provider": providers["Sam's Club"]},
        {"name": "Vodka Sam's", "category": "Vinos y Licores", "current_stock": 1.0, "ideal_stock": 2.0, "unit": "botellas", "price": 220.00, "provider": providers["Sam's Club"]},
        {"name": "Don Simón", "category": "Vinos y Licores", "current_stock": 4.0, "ideal_stock": 9.0, "unit": "botellas", "price": 45.00, "provider": providers["Sam's Club"]},
        {"name": "Boost", "category": "Vinos y Licores", "current_stock": 2.0, "ideal_stock": 5.0, "unit": "pzas", "price": 30.00, "provider": providers["Sam's Club"]},
        {"name": "Agua tónica", "category": "Vinos y Licores", "current_stock": 4.0, "ideal_stock": 9.0, "unit": "pzas", "price": 22.00, "provider": providers["Sam's Club"]},
        {"name": "Clamato", "category": "Vinos y Licores", "current_stock": 1.0, "ideal_stock": 3.0, "unit": "pzas", "price": 28.00, "provider": providers["Sam's Club"]},
        {"name": "Granadina", "category": "Vinos y Licores", "current_stock": 1.0, "ideal_stock": 2.0, "unit": "botella", "price": 65.00, "provider": providers["Sam's Club"]},
        {"name": "Cerezas", "category": "Abarrotes y Harinas", "current_stock": 0.0, "ideal_stock": 1.0, "unit": "bote", "price": 75.00, "provider": providers["Sam's Club"]},
        {"name": "Duraznos", "category": "Abarrotes y Harinas", "current_stock": 0.5, "ideal_stock": 1.0, "unit": "lata", "price": 50.00, "provider": providers["Sam's Club"]},
        {"name": "Hershey's", "category": "Abarrotes y Harinas", "current_stock": 0.5, "ideal_stock": 1.0, "unit": "galón", "price": 140.00, "provider": providers["Sam's Club"]},
        {"name": "Galletas Ore", "category": "Abarrotes y Harinas", "current_stock": 0.0, "ideal_stock": 1.0, "unit": "caja", "price": 35.00, "provider": providers["Sam's Club"]},
        {"name": "Clavel", "category": "Quesos y Lácteos", "current_stock": 1.0, "ideal_stock": 2.0, "unit": "pzas", "price": 24.00, "provider": providers["Sam's Club"]},
        {"name": "Philadelphia", "category": "Quesos y Lácteos", "current_stock": 1.0, "ideal_stock": 2.0, "unit": "pzas", "price": 45.00, "provider": providers["Sam's Club"]},
        {"name": "Mermelada de fresa", "category": "Abarrotes y Harinas", "current_stock": 0.5, "ideal_stock": 1.0, "unit": "frasco", "price": 40.00, "provider": providers["Sam's Club"]},
        {"name": "Cajeta", "category": "Abarrotes y Harinas", "current_stock": 0.5, "ideal_stock": 1.0, "unit": "frasco", "price": 50.00, "provider": providers["Sam's Club"]},
        {"name": "Nesquik", "category": "Abarrotes y Harinas", "current_stock": 0.5, "ideal_stock": 1.0, "unit": "bote", "price": 60.00, "provider": providers["Sam's Club"]},
        {"name": "Nescafé", "category": "Abarrotes y Harinas", "current_stock": 0.5, "ideal_stock": 1.0, "unit": "frascos", "price": 110.00, "provider": providers["Sam's Club"]},
        {"name": "Helado vainilla/chocolate", "category": "Abarrotes y Harinas", "current_stock": 2.0, "ideal_stock": 4.0, "unit": "pzas", "price": 95.00, "provider": providers["Sam's Club"]},
        {"name": "Mordisko", "category": "Abarrotes y Harinas", "current_stock": 3.0, "ideal_stock": 10.0, "unit": "caja", "price": 120.00, "provider": providers["Sam's Club"]},
        {"name": "Paleta Kit Kat / Magnum", "category": "Abarrotes y Harinas", "current_stock": 4.0, "ideal_stock": 11.0, "unit": "paletas", "price": 32.00, "provider": providers["Sam's Club"]},

        # --- WALMART ---
        {"name": "Baguette", "category": "Abarrotes y Harinas", "current_stock": 1.0, "ideal_stock": 3.0, "unit": "pzas", "price": 32.00, "provider": providers["Walmart"]},
        {"name": "Servitoallas", "category": "Desechables y Empaque", "current_stock": 2.0, "ideal_stock": 4.0, "unit": "pzas", "price": 28.00, "provider": providers["Walmart"]},
        {"name": "Latas de jitomate", "category": "Abarrotes y Harinas", "current_stock": 1.0, "ideal_stock": 2.0, "unit": "pzas", "price": 26.00, "provider": providers["Walmart"]},
        {"name": "Cajitas para pasteles", "category": "Desechables y Empaque", "current_stock": 3.0, "ideal_stock": 10.0, "unit": "pzas", "price": 15.00, "provider": providers["Walmart"]},
        {"name": "Chocolate / Vainilla", "category": "Abarrotes y Harinas", "current_stock": 1.0, "ideal_stock": 2.0, "unit": "pzas", "price": 45.00, "provider": providers["Walmart"]},
        {"name": "Red Velvet / Pan de vino", "category": "Abarrotes y Harinas", "current_stock": 1.0, "ideal_stock": 2.0, "unit": "pzas", "price": 120.00, "provider": providers["Walmart"]},
        {"name": "Betún de pasteles", "category": "Abarrotes y Harinas", "current_stock": 1.0, "ideal_stock": 2.0, "unit": "pzas", "price": 55.00, "provider": providers["Walmart"]},
        {"name": "Finca las moras / Casillero", "category": "Vinos y Licores", "current_stock": 2.0, "ideal_stock": 4.0, "unit": "botellas", "price": 160.00, "provider": providers["Walmart"]},
        {"name": "Lambrusco tinto / rosado", "category": "Vinos y Licores", "current_stock": 1.0, "ideal_stock": 3.0, "unit": "botellas", "price": 140.00, "provider": providers["Walmart"]},
        {"name": "Antillano", "category": "Vinos y Licores", "current_stock": 3.0, "ideal_stock": 8.0, "unit": "botellas", "price": 110.00, "provider": providers["Walmart"]},
        {"name": "Leche santa clara", "category": "Quesos y Lácteos", "current_stock": 3.0, "ideal_stock": 6.0, "unit": "pzas", "price": 28.00, "provider": providers["Walmart"]},
        {"name": "Harina integral", "category": "Abarrotes y Harinas", "current_stock": 1.0, "ideal_stock": 3.0, "unit": "kg", "price": 35.00, "provider": providers["Walmart"]},

        # --- CENTRAL ---
        {"name": "Servilletas", "category": "Desechables y Empaque", "current_stock": 1.0, "ideal_stock": 2.0, "unit": "piezas", "price": 45.00, "provider": providers["Central"]},
        {"name": "Costal de harina", "category": "Abarrotes y Harinas", "current_stock": 0.5, "ideal_stock": 1.0, "unit": "costal", "price": 450.00, "provider": providers["Central"]},
        {"name": "Bolsa negra jumbo", "category": "Desechables y Empaque", "current_stock": 1.0, "ideal_stock": 2.0, "unit": "kilos", "price": 85.00, "provider": providers["Central"]},
        {"name": "Charola unicell", "category": "Desechables y Empaque", "current_stock": 4.0, "ideal_stock": 10.0, "unit": "paq", "price": 60.00, "provider": providers["Central"]},
        {"name": "Papel de aluminio", "category": "Desechables y Empaque", "current_stock": 0.5, "ideal_stock": 1.0, "unit": "rollo", "price": 180.00, "provider": providers["Central"]},
        {"name": "Pulpa de tamarindo", "category": "Abarrotes y Harinas", "current_stock": 2.0, "ideal_stock": 5.0, "unit": "pz", "price": 40.00, "provider": providers["Central"]},
        {"name": "Levadura", "category": "Abarrotes y Harinas", "current_stock": 1.0, "ideal_stock": 2.0, "unit": "pzas", "price": 35.00, "provider": providers["Central"]},
        {"name": "Orégano", "category": "Abarrotes y Harinas", "current_stock": 0.4, "ideal_stock": 1.0, "unit": "kilo", "price": 120.00, "provider": providers["Central"]},
        {"name": "Leche nutri", "category": "Quesos y Lácteos", "current_stock": 5.0, "ideal_stock": 13.0, "unit": "pz", "price": 24.00, "provider": providers["Central"]},
        {"name": "Huevo", "category": "Quesos y Lácteos", "current_stock": 0.5, "ideal_stock": 1.0, "unit": "tapa", "price": 85.00, "provider": providers["Central"]},
        {"name": "Mantequilla Iberia", "category": "Quesos y Lácteos", "current_stock": 0.5, "ideal_stock": 1.0, "unit": "barras", "price": 45.00, "provider": providers["Central"]},
        {"name": "Costal de azúcar", "category": "Abarrotes y Harinas", "current_stock": 0.5, "ideal_stock": 1.0, "unit": "costal", "price": 750.00, "provider": providers["Central"]},
        {"name": "Coco rallado", "category": "Abarrotes y Harinas", "current_stock": 0.0, "ideal_stock": 1.0, "unit": "bolsa", "price": 50.00, "provider": providers["Central"]},
        {"name": "Popotes", "category": "Desechables y Empaque", "current_stock": 0.5, "ideal_stock": 1.0, "unit": "caja", "price": 70.00, "provider": providers["Central"]},
        {"name": "Vaso litro", "category": "Desechables y Empaque", "current_stock": 3.0, "ideal_stock": 10.0, "unit": "paq", "price": 55.00, "provider": providers["Central"]},

        # --- VALENCIANA ---
        {"name": "Absolut", "category": "Vinos y Licores", "current_stock": 1.0, "ideal_stock": 2.0, "unit": "patona", "price": 380.00, "provider": providers["Valenciana"]},
        {"name": "Aperol", "category": "Vinos y Licores", "current_stock": 1.0, "ideal_stock": 2.0, "unit": "botellas", "price": 350.00, "provider": providers["Valenciana"]},
        {"name": "Baileys", "category": "Vinos y Licores", "current_stock": 1.0, "ideal_stock": 2.0, "unit": "botellas", "price": 420.00, "provider": providers["Valenciana"]},
        {"name": "Controy", "category": "Vinos y Licores", "current_stock": 0.5, "ideal_stock": 1.0, "unit": "botella", "price": 260.00, "provider": providers["Valenciana"]},
        {"name": "Curazao azul", "category": "Vinos y Licores", "current_stock": 0.5, "ideal_stock": 1.0, "unit": "botella", "price": 250.00, "provider": providers["Valenciana"]},
        {"name": "Don Julio 70", "category": "Vinos y Licores", "current_stock": 1.0, "ideal_stock": 2.0, "unit": "botellas", "price": 950.00, "provider": providers["Valenciana"]},
        {"name": "Etiqueta Negra", "category": "Vinos y Licores", "current_stock": 1.0, "ideal_stock": 2.0, "unit": "botellas", "price": 890.00, "provider": providers["Valenciana"]},
        {"name": "Ginebra", "category": "Vinos y Licores", "current_stock": 1.0, "ideal_stock": 2.0, "unit": "botella", "price": 310.00, "provider": providers["Valenciana"]},
        {"name": "Jägermeister", "category": "Vinos y Licores", "current_stock": 1.0, "ideal_stock": 2.0, "unit": "botella", "price": 450.00, "provider": providers["Valenciana"]},
        {"name": "Jack Daniel's", "category": "Vinos y Licores", "current_stock": 1.0, "ideal_stock": 2.0, "unit": "botellas", "price": 520.00, "provider": providers["Valenciana"]},
        {"name": "Kahlúa", "category": "Vinos y Licores", "current_stock": 0.5, "ideal_stock": 1.0, "unit": "botella", "price": 280.00, "provider": providers["Valenciana"]},
        {"name": "Licor 43", "category": "Vinos y Licores", "current_stock": 0.5, "ideal_stock": 1.0, "unit": "botella", "price": 580.00, "provider": providers["Valenciana"]},
        {"name": "Mezcal 400 conejos", "category": "Vinos y Licores", "current_stock": 1.0, "ideal_stock": 2.0, "unit": "botellas", "price": 480.00, "provider": providers["Valenciana"]},
        {"name": "Tequila 1800", "category": "Vinos y Licores", "current_stock": 1.0, "ideal_stock": 2.0, "unit": "botellas", "price": 620.00, "provider": providers["Valenciana"]},
        {"name": "Tequila Maestro Dobel", "category": "Vinos y Licores", "current_stock": 1.0, "ideal_stock": 2.0, "unit": "botellas", "price": 750.00, "provider": providers["Valenciana"]},
        {"name": "Torres 10", "category": "Vinos y Licores", "current_stock": 1.0, "ideal_stock": 2.0, "unit": "botellas", "price": 340.00, "provider": providers["Valenciana"]},
    ]

    saved_products = {}
    for p_data in initial_products:
        prod = db.query(models.Product).filter_by(name=p_data["name"]).first()
        if not prod:
            prod = models.Product(
                name=p_data["name"],
                category=p_data["category"],
                current_stock=p_data["current_stock"],
                ideal_stock=p_data["ideal_stock"],
                unit_measure=p_data["unit"],
                unit_price=p_data["price"],
                last_purchased_price=p_data["price"],
                last_purchased_date=datetime.utcnow() - timedelta(days=random.randint(1, 15)),
                provider=p_data["provider"]
            )
            db.add(prod)
        else:
            prod.category = p_data["category"]
            prod.unit_price = p_data["price"]
            prod.ideal_stock = p_data["ideal_stock"]
            if prod.last_purchased_price is None or prod.last_purchased_price == 0:
                prod.last_purchased_price = p_data["price"]
        saved_products[p_data["name"]] = prod

    db.commit()

    # 3. Usuarios de Prueba
    admin_user = db.query(models.User).filter_by(username="admin").first()
    if not admin_user:
        admin_user = models.User(username="admin", hashed_password="123", role="admin")
        db.add(admin_user)

    operator_user = db.query(models.User).filter_by(username="operario").first()
    if not operator_user:
        operator_user = models.User(username="operario", hashed_password="123", role="operator")
        db.add(operator_user)

    db.commit()
    db.refresh(admin_user)
    db.refresh(operator_user)

    # 4. Datos Históricos de Compras y Consumos de Prueba (últimos 20 días)
    # Solo agregamos si la tabla purchases está vacía
    existing_purchases_count = db.query(models.Purchase).count()
    if existing_purchases_count == 0:
        print("Generando historial de compras y tickets de muestra...")
        now = datetime.utcnow()
        sample_tickets = [
            {"provider": "Carne Mart", "days_ago": 16, "ticket": "CM-4921", "items": [("Boneless", 4.0, 125.00), ("Mozzarella barras", 5.0, 140.00), ("Peperoni", 2.0, 165.00)]},
            {"provider": "Sam's Club", "days_ago": 12, "ticket": "SC-8812", "items": [("Sanitas", 10.0, 35.00), ("Crema lincott", 4.0, 85.00), ("BBQ", 1.0, 260.00), ("Buchanan's", 1.0, 850.00)]},
            {"provider": "Central", "days_ago": 8, "ticket": "CEN-1029", "items": [("Costal de harina", 1.0, 450.00), ("Costal de azúcar", 1.0, 750.00), ("Charola unicell", 6.0, 60.00)]},
            {"provider": "Valenciana", "days_ago": 5, "ticket": "VAL-7721", "items": [("Don Julio 70", 1.0, 950.00), ("Mezcal 400 conejos", 2.0, 480.00), ("Torres 10", 2.0, 340.00)]},
            {"provider": "Carne Mart", "days_ago": 2, "ticket": "CM-5104", "items": [("Boneless", 3.0, 128.00), ("Dedos de queso", 6.0, 230.00), ("Costillas y órdenes", 5.0, 350.00)]},
        ]

        for st in sample_tickets:
            p_date = now - timedelta(days=st["days_ago"])
            prov = providers[st["provider"]]
            total_ticket = sum(qty * price for _, qty, price in st["items"])
            purchase = models.Purchase(
                provider_id=prov.id,
                purchase_date=p_date,
                ticket_number=st["ticket"],
                total_cost=total_ticket,
                notes=f"Compra regular en {st['provider']}",
                user_id=admin_user.id
            )
            db.add(purchase)
            db.commit()
            db.refresh(purchase)

            for prod_name, qty, price in st["items"]:
                p_obj = saved_products.get(prod_name)
                if p_obj:
                    p_item = models.PurchaseItem(
                        purchase_id=purchase.id,
                        product_id=p_obj.id,
                        quantity=qty,
                        unit_price_paid=price,
                        subtotal=qty * price
                    )
                    db.add(p_item)
            db.commit()

    # 5. Generar bitácora de consumos de los últimos 14 días
    existing_consumptions_count = db.query(models.ConsumptionLog).count()
    if existing_consumptions_count == 0:
        print("Generando historial de consumo (cortes de cocina) de muestra...")
        now = datetime.utcnow()
        sample_consumptions = [
            ("Boneless", 1.5, 14),
            ("Mozzarella barras", 2.0, 13),
            ("Peperoni", 0.5, 12),
            ("Costal de harina", 0.2, 11),
            ("Sanitas", 3.0, 10),
            ("Don Julio 70", 0.5, 9),
            ("Boneless", 2.0, 7),
            ("Dedos de queso", 3.0, 6),
            ("Mozzarella barras", 2.0, 4),
            ("BBQ", 0.3, 3),
            ("Peperoni", 0.6, 2),
            ("Costillas y órdenes", 2.0, 1),
        ]

        for prod_name, qty, days_ago in sample_consumptions:
            p_obj = saved_products.get(prod_name)
            if p_obj:
                cost = qty * (p_obj.unit_price or 0.0)
                clog = models.ConsumptionLog(
                    product_id=p_obj.id,
                    quantity=qty,
                    unit_price_at_moment=p_obj.unit_price,
                    total_cost=cost,
                    timestamp=now - timedelta(days=days_ago, hours=random.randint(1, 10)),
                    shift_notes="Corte Diario de Turno",
                    user_id=operator_user.id
                )
                db.add(clog)
        db.commit()

    db.close()
    print("¡Base de datos inicializada y enriquecida con éxito!")

if __name__ == "__main__":
    seed_database()