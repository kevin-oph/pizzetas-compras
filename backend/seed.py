from database import SessionLocal, engine
import models

# Crear tablas
models.Base.metadata.create_all(bind=engine)

def seed_database():
    db = SessionLocal()

    # 1. Crear Proveedores / Tiendas Reales
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

    # 2. Catálogo Masivo con Stock Inicial en 0.0 (Arrancando desde cero)
    initial_products = [
        # --- CARNE MART ---
        {"name": "Aros de cebolla", "current_stock": 0.0, "ideal_stock": 7.0, "unit": "bolsa", "price": 85.00, "provider": providers["Carne Mart"]},
        {"name": "Dedos de queso", "current_stock": 0.0, "ideal_stock": 8.0, "unit": "bolsa", "price": 230.00, "provider": providers["Carne Mart"]},
        {"name": "Boneless", "current_stock": 0.0, "ideal_stock": 7.0, "unit": "kg", "price": 125.00, "provider": providers["Carne Mart"]},
        {"name": "Papas gajo", "current_stock": 0.0, "ideal_stock": 7.0, "unit": "bolsa", "price": 90.00, "provider": providers["Carne Mart"]},
        {"name": "Papas francesas", "current_stock": 0.0, "ideal_stock": 4.0, "unit": "bolsa", "price": 85.00, "provider": providers["Carne Mart"]},
        {"name": "Costillas y órdenes", "current_stock": 0.0, "ideal_stock": 10.0, "unit": "pzas", "price": 350.00, "provider": providers["Carne Mart"]},
        {"name": "Parmesano", "current_stock": 0.0, "ideal_stock": 1.0, "unit": "bote", "price": 180.00, "provider": providers["Carne Mart"]},
        {"name": "Papa raquet", "current_stock": 0.0, "ideal_stock": 4.0, "unit": "bolsa", "price": 95.00, "provider": providers["Carne Mart"]},
        {"name": "Nuggets", "current_stock": 0.0, "ideal_stock": 2.0, "unit": "bolsa", "price": 110.00, "provider": providers["Carne Mart"]},
        {"name": "Nuggets kids", "current_stock": 0.0, "ideal_stock": 2.0, "unit": "bolsa", "price": 110.00, "provider": providers["Carne Mart"]},
        {"name": "Mozzarella barras", "current_stock": 0.0, "ideal_stock": 8.0, "unit": "barras", "price": 140.00, "provider": providers["Carne Mart"]},
        {"name": "Peperoni", "current_stock": 0.0, "ideal_stock": 2.0, "unit": "kg", "price": 160.00, "provider": providers["Carne Mart"]},
        {"name": "Bote para rellenar catsup", "current_stock": 0.0, "ideal_stock": 1.0, "unit": "pza", "price": 50.00, "provider": providers["Carne Mart"]},
        {"name": "Sangría", "current_stock": 0.0, "ideal_stock": 5.0, "unit": "pzas", "price": 35.00, "provider": providers["Carne Mart"]},

        # --- SAM'S ---
        {"name": "Condimento italiano", "current_stock": 0.0, "ideal_stock": 2.0, "unit": "pzas", "price": 65.00, "provider": providers["Sam's Club"]},
        {"name": "Albahaca deshidratada", "current_stock": 0.0, "ideal_stock": 2.0, "unit": "pzas", "price": 55.00, "provider": providers["Sam's Club"]},
        {"name": "Perejil", "current_stock": 0.0, "ideal_stock": 3.0, "unit": "pzas", "price": 40.00, "provider": providers["Sam's Club"]},
        {"name": "Limón pimienta", "current_stock": 0.0, "ideal_stock": 2.0, "unit": "pzas", "price": 60.00, "provider": providers["Sam's Club"]},
        {"name": "Valentina", "current_stock": 0.0, "ideal_stock": 12.0, "unit": "pzas", "price": 18.00, "provider": providers["Sam's Club"]},
        {"name": "Maggi", "current_stock": 0.0, "ideal_stock": 16.0, "unit": "pzas", "price": 25.00, "provider": providers["Sam's Club"]},
        {"name": "Salsa inglesa", "current_stock": 0.0, "ideal_stock": 24.0, "unit": "pzas", "price": 25.00, "provider": providers["Sam's Club"]},
        {"name": "BBQ", "current_stock": 0.0, "ideal_stock": 1.0, "unit": "galón", "price": 260.00, "provider": providers["Sam's Club"]},
        {"name": "Ranch", "current_stock": 0.0, "ideal_stock": 2.0, "unit": "galón", "price": 280.00, "provider": providers["Sam's Club"]},
        {"name": "Buffalo", "current_stock": 0.0, "ideal_stock": 3.0, "unit": "galón", "price": 270.00, "provider": providers["Sam's Club"]},
        {"name": "Fusilli", "current_stock": 0.0, "ideal_stock": 6.0, "unit": "pzas", "price": 30.00, "provider": providers["Sam's Club"]},
        {"name": "Fettuchini", "current_stock": 0.0, "ideal_stock": 5.0, "unit": "pzas", "price": 32.00, "provider": providers["Sam's Club"]},
        {"name": "Spaghetti Paq grd", "current_stock": 0.0, "ideal_stock": 1.0, "unit": "paq", "price": 45.00, "provider": providers["Sam's Club"]},
        {"name": "Sanitas", "current_stock": 0.0, "ideal_stock": 16.0, "unit": "pzas", "price": 35.00, "provider": providers["Sam's Club"]},
        {"name": "Aderezo miel mostaza", "current_stock": 0.0, "ideal_stock": 1.0, "unit": "galón", "price": 290.00, "provider": providers["Sam's Club"]},
        {"name": "Vinagreta", "current_stock": 0.0, "ideal_stock": 2.0, "unit": "pzas", "price": 45.00, "provider": providers["Sam's Club"]},
        {"name": "Crema lincott", "current_stock": 0.0, "ideal_stock": 4.0, "unit": "pzas", "price": 85.00, "provider": providers["Sam's Club"]},
        {"name": "Mantequilla barra", "current_stock": 0.0, "ideal_stock": 4.0, "unit": "barras", "price": 28.00, "provider": providers["Sam's Club"]},
        {"name": "Jabón p/trastes", "current_stock": 0.0, "ideal_stock": 1.0, "unit": "galón", "price": 150.00, "provider": providers["Sam's Club"]},
        {"name": "Frijol", "current_stock": 0.0, "ideal_stock": 6.0, "unit": "kilos", "price": 38.00, "provider": providers["Sam's Club"]},
        {"name": "Aceituna negra", "current_stock": 0.0, "ideal_stock": 1.0, "unit": "bote", "price": 95.00, "provider": providers["Sam's Club"]},
        {"name": "Puré bolognese", "current_stock": 0.0, "ideal_stock": 3.0, "unit": "latas", "price": 42.00, "provider": providers["Sam's Club"]},
        {"name": "Albahaca fresca", "current_stock": 0.0, "ideal_stock": 2.0, "unit": "pzas", "price": 20.00, "provider": providers["Sam's Club"]},
        {"name": "Arroz", "current_stock": 0.0, "ideal_stock": 1.0, "unit": "kilo", "price": 32.00, "provider": providers["Sam's Club"]},
        {"name": "Encendedoras", "current_stock": 0.0, "ideal_stock": 4.0, "unit": "pzas", "price": 15.00, "provider": providers["Sam's Club"]},
        {"name": "Jamón serrano", "current_stock": 0.0, "ideal_stock": 1.0, "unit": "kilo", "price": 450.00, "provider": providers["Sam's Club"]},
        {"name": "Queso de cabra", "current_stock": 0.0, "ideal_stock": 2.0, "unit": "barra", "price": 85.00, "provider": providers["Sam's Club"]},
        {"name": "Panko", "current_stock": 0.0, "ideal_stock": 1.0, "unit": "caja", "price": 65.00, "provider": providers["Sam's Club"]},
        {"name": "Pepinillos", "current_stock": 0.0, "ideal_stock": 1.0, "unit": "bote", "price": 55.00, "provider": providers["Sam's Club"]},
        {"name": "Mayonesa", "current_stock": 0.0, "ideal_stock": 1.0, "unit": "bote", "price": 75.00, "provider": providers["Sam's Club"]},
        {"name": "Empanadas paquetitos", "current_stock": 0.0, "ideal_stock": 2.0, "unit": "paq", "price": 90.00, "provider": providers["Sam's Club"]},
        {"name": "Tabla de carne", "current_stock": 0.0, "ideal_stock": 2.0, "unit": "pzas", "price": 120.00, "provider": providers["Sam's Club"]},
        {"name": "Jitomate deshidratado", "current_stock": 0.0, "ideal_stock": 1.0, "unit": "frasco", "price": 110.00, "provider": providers["Sam's Club"]},
        {"name": "Pan de elote", "current_stock": 0.0, "ideal_stock": 5.0, "unit": "pzas", "price": 35.00, "provider": providers["Sam's Club"]},
        {"name": "Tequila José Cuervo", "current_stock": 0.0, "ideal_stock": 2.0, "unit": "botellas", "price": 320.00, "provider": providers["Sam's Club"]},
        {"name": "Bacardi", "current_stock": 0.0, "ideal_stock": 1.0, "unit": "botella", "price": 280.00, "provider": providers["Sam's Club"]},
        {"name": "Buchanan's", "current_stock": 0.0, "ideal_stock": 2.0, "unit": "botellas", "price": 850.00, "provider": providers["Sam's Club"]},
        {"name": "Vodka Sam's", "current_stock": 0.0, "ideal_stock": 2.0, "unit": "botellas", "price": 220.00, "provider": providers["Sam's Club"]},
        {"name": "Don Simón", "current_stock": 0.0, "ideal_stock": 9.0, "unit": "botellas", "price": 45.00, "provider": providers["Sam's Club"]},
        {"name": "Boost", "current_stock": 0.0, "ideal_stock": 5.0, "unit": "pzas", "price": 30.00, "provider": providers["Sam's Club"]},
        {"name": "Agua tónica", "current_stock": 0.0, "ideal_stock": 9.0, "unit": "pzas", "price": 22.00, "provider": providers["Sam's Club"]},
        {"name": "Clamato", "current_stock": 0.0, "ideal_stock": 3.0, "unit": "pzas", "price": 28.00, "provider": providers["Sam's Club"]},
        {"name": "Granadina", "current_stock": 0.0, "ideal_stock": 2.0, "unit": "botella", "price": 65.00, "provider": providers["Sam's Club"]},
        {"name": "Cerezas", "current_stock": 0.0, "ideal_stock": 1.0, "unit": "bote", "price": 75.00, "provider": providers["Sam's Club"]},
        {"name": "Duraznos", "current_stock": 0.0, "ideal_stock": 1.0, "unit": "lata", "price": 50.00, "provider": providers["Sam's Club"]},
        {"name": "Hershey's", "current_stock": 0.0, "ideal_stock": 1.0, "unit": "galón", "price": 140.00, "provider": providers["Sam's Club"]},
        {"name": "Galletas Ore", "current_stock": 0.0, "ideal_stock": 1.0, "unit": "caja", "price": 35.00, "provider": providers["Sam's Club"]},
        {"name": "Clavel", "current_stock": 0.0, "ideal_stock": 2.0, "unit": "pzas", "price": 24.00, "provider": providers["Sam's Club"]},
        {"name": "Philadelphia", "current_stock": 0.0, "ideal_stock": 2.0, "unit": "pzas", "price": 45.00, "provider": providers["Sam's Club"]},
        {"name": "Mermelada de fresa", "current_stock": 0.0, "ideal_stock": 1.0, "unit": "frasco", "price": 40.00, "provider": providers["Sam's Club"]},
        {"name": "Cajeta", "current_stock": 0.0, "ideal_stock": 1.0, "unit": "frasco", "price": 50.00, "provider": providers["Sam's Club"]},
        {"name": "Nesquik", "current_stock": 0.0, "ideal_stock": 1.0, "unit": "bote", "price": 60.00, "provider": providers["Sam's Club"]},
        {"name": "Nescafé", "current_stock": 0.0, "ideal_stock": 1.0, "unit": "frascos", "price": 110.00, "provider": providers["Sam's Club"]},
        {"name": "Helado vainilla/chocolate", "current_stock": 0.0, "ideal_stock": 4.0, "unit": "pzas", "price": 95.00, "provider": providers["Sam's Club"]},
        {"name": "Mordisko", "current_stock": 0.0, "ideal_stock": 10.0, "unit": "caja", "price": 120.00, "provider": providers["Sam's Club"]},
        {"name": "Paleta Kit Kat / Magnum", "current_stock": 0.0, "ideal_stock": 11.0, "unit": "paletas", "price": 32.00, "provider": providers["Sam's Club"]},

        # --- WALMART ---
        {"name": "Baguette", "current_stock": 0.0, "ideal_stock": 3.0, "unit": "pzas", "price": 32.00, "provider": providers["Walmart"]},
        {"name": "Servitoallas", "current_stock": 0.0, "ideal_stock": 4.0, "unit": "pzas", "price": 28.00, "provider": providers["Walmart"]},
        {"name": "Latas de jitomate", "current_stock": 0.0, "ideal_stock": 2.0, "unit": "pzas", "price": 26.00, "provider": providers["Walmart"]},
        {"name": "Cajitas para pasteles", "current_stock": 0.0, "ideal_stock": 10.0, "unit": "pzas", "price": 15.00, "provider": providers["Walmart"]},
        {"name": "Chocolate / Vainilla", "current_stock": 0.0, "ideal_stock": 2.0, "unit": "pzas", "price": 45.00, "provider": providers["Walmart"]},
        {"name": "Red Velvet / Pan de vino", "current_stock": 0.0, "ideal_stock": 2.0, "unit": "pzas", "price": 120.00, "provider": providers["Walmart"]},
        {"name": "Betún de pasteles", "current_stock": 0.0, "ideal_stock": 2.0, "unit": "pzas", "price": 55.00, "provider": providers["Walmart"]},
        {"name": "Finca las moras / Casillero", "current_stock": 0.0, "ideal_stock": 4.0, "unit": "botellas", "price": 160.00, "provider": providers["Walmart"]},
        {"name": "Lambrusco tinto / rosado", "current_stock": 0.0, "ideal_stock": 3.0, "unit": "botellas", "price": 140.00, "provider": providers["Walmart"]},
        {"name": "Antillano", "current_stock": 0.0, "ideal_stock": 8.0, "unit": "botellas", "price": 110.00, "provider": providers["Walmart"]},
        {"name": "Leche santa clara", "current_stock": 0.0, "ideal_stock": 6.0, "unit": "pzas", "price": 28.00, "provider": providers["Walmart"]},
        {"name": "Harina integral", "current_stock": 0.0, "ideal_stock": 3.0, "unit": "kg", "price": 35.00, "provider": providers["Walmart"]},

        # --- CENTRAL ---
        {"name": "Servilletas", "current_stock": 0.0, "ideal_stock": 2.0, "unit": "piezas", "price": 45.00, "provider": providers["Central"]},
        {"name": "Costal de harina", "current_stock": 0.0, "ideal_stock": 1.0, "unit": "costal", "price": 450.00, "provider": providers["Central"]},
        {"name": "Bolsa negra jumbo", "current_stock": 0.0, "ideal_stock": 2.0, "unit": "kilos", "price": 85.00, "provider": providers["Central"]},
        {"name": "Charola unicell", "current_stock": 0.0, "ideal_stock": 10.0, "unit": "paq", "price": 60.00, "provider": providers["Central"]},
        {"name": "Papel de aluminio", "current_stock": 0.0, "ideal_stock": 1.0, "unit": "rollo", "price": 180.00, "provider": providers["Central"]},
        {"name": "Pulpa de tamarindo", "current_stock": 0.0, "ideal_stock": 5.0, "unit": "pz", "price": 40.00, "provider": providers["Central"]},
        {"name": "Levadura", "current_stock": 0.0, "ideal_stock": 2.0, "unit": "pzas", "price": 35.00, "provider": providers["Central"]},
        {"name": "Orégano", "current_stock": 0.0, "ideal_stock": 1.0, "unit": "kilo", "price": 120.00, "provider": providers["Central"]},
        {"name": "Leche nutri", "current_stock": 0.0, "ideal_stock": 13.0, "unit": "pz", "price": 24.00, "provider": providers["Central"]},
        {"name": "Huevo", "current_stock": 0.0, "ideal_stock": 1.0, "unit": "tapa", "price": 85.00, "provider": providers["Central"]},
        {"name": "Mantequilla Iberia", "current_stock": 0.0, "ideal_stock": 1.0, "unit": "barras", "price": 45.00, "provider": providers["Central"]},
        {"name": "Costal de azúcar", "current_stock": 0.0, "ideal_stock": 1.0, "unit": "costal", "price": 750.00, "provider": providers["Central"]},
        {"name": "Coco rallado", "current_stock": 0.0, "ideal_stock": 1.0, "unit": "bolsa", "price": 50.00, "provider": providers["Central"]},
        {"name": "Popotes", "current_stock": 0.0, "ideal_stock": 1.0, "unit": "caja", "price": 70.00, "provider": providers["Central"]},
        {"name": "Vaso litro", "current_stock": 0.0, "ideal_stock": 10.0, "unit": "paq", "price": 55.00, "provider": providers["Central"]},

        # --- VALENCIANA ---
        {"name": "Absolut", "current_stock": 0.0, "ideal_stock": 2.0, "unit": "patona", "price": 380.00, "provider": providers["Valenciana"]},
        {"name": "Aperol", "current_stock": 0.0, "ideal_stock": 2.0, "unit": "botellas", "price": 350.00, "provider": providers["Valenciana"]},
        {"name": "Baileys", "current_stock": 0.0, "ideal_stock": 2.0, "unit": "botellas", "price": 420.00, "provider": providers["Valenciana"]},
        {"name": "Controy", "current_stock": 0.0, "ideal_stock": 1.0, "unit": "botella", "price": 260.00, "provider": providers["Valenciana"]},
        {"name": "Curazao azul", "current_stock": 0.0, "ideal_stock": 1.0, "unit": "botella", "price": 250.00, "provider": providers["Valenciana"]},
        {"name": "Don Julio 70", "current_stock": 0.0, "ideal_stock": 2.0, "unit": "botellas", "price": 950.00, "provider": providers["Valenciana"]},
        {"name": "Etiqueta Negra", "current_stock": 0.0, "ideal_stock": 2.0, "unit": "botellas", "price": 890.00, "provider": providers["Valenciana"]},
        {"name": "Ginebra", "current_stock": 0.0, "ideal_stock": 2.0, "unit": "botella", "price": 310.00, "provider": providers["Valenciana"]},
        {"name": "Jägermeister", "current_stock": 0.0, "ideal_stock": 2.0, "unit": "botella", "price": 450.00, "provider": providers["Valenciana"]},
        {"name": "Jack Daniel's", "current_stock": 0.0, "ideal_stock": 2.0, "unit": "botellas", "price": 520.00, "provider": providers["Valenciana"]},
        {"name": "Kahlúa", "current_stock": 0.0, "ideal_stock": 1.0, "unit": "botella", "price": 280.00, "provider": providers["Valenciana"]},
        {"name": "Licor 43", "current_stock": 0.0, "ideal_stock": 1.0, "unit": "botella", "price": 580.00, "provider": providers["Valenciana"]},
        {"name": "Mezcal 400 conejos", "current_stock": 0.0, "ideal_stock": 2.0, "unit": "botellas", "price": 480.00, "provider": providers["Valenciana"]},
        {"name": "Tequila 1800", "current_stock": 0.0, "ideal_stock": 2.0, "unit": "botellas", "price": 620.00, "provider": providers["Valenciana"]},
        {"name": "Tequila Maestro Dobel", "current_stock": 0.0, "ideal_stock": 2.0, "unit": "botellas", "price": 750.00, "provider": providers["Valenciana"]},
        {"name": "Torres 10", "current_stock": 0.0, "ideal_stock": 2.0, "unit": "botellas", "price": 340.00, "provider": providers["Valenciana"]},
    ]

    for p_data in initial_products:
        exists = db.query(models.Product).filter_by(name=p_data["name"]).first()
        if not exists:
            product = models.Product(
                name=p_data["name"],
                current_stock=p_data["current_stock"],
                ideal_stock=p_data["ideal_stock"],
                unit_measure=p_data["unit"],
                unit_price=p_data["price"],
                provider=p_data["provider"]
            )
            db.add(product)

    # 3. Usuarios de Prueba
    admin_user = db.query(models.User).filter_by(username="admin").first()
    if not admin_user:
        db.add(models.User(username="admin", hashed_password="123", role="admin"))

    operator_user = db.query(models.User).filter_by(username="operario").first()
    if not operator_user:
        db.add(models.User(username="operario", hashed_password="123", role="operator"))

    db.commit()
    db.close()
    print("¡Inventario reiniciado a 0 con éxito para comenzar desde cero!")

if __name__ == "__main__":
    seed_database()