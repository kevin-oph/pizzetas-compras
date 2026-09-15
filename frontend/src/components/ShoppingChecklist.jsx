import { useState, useEffect } from 'react';

const ShoppingChecklist = () => {
  const [shoppingList, setShoppingList] = useState({});
  const [processedItems, setProcessedItems] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // ¡AQUÍ ESTÁ LA MAGIA! Conectando con tu backend real
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        // Llamamos a tu API de FastAPI que está corriendo en el puerto 8000
        const response = await fetch('http://localhost:8000/api/shopping-list');
        if (!response.ok) {
          throw new Error('No se pudo conectar con el servidor');
        }
        const data = await response.json();
        setShoppingList(data);
      } catch (err) {
        console.error(err);
        setError("Error al cargar los datos. ¿Está encendido el backend?");
      }
    };

    fetchInventory();
  }, []);

  const handleStatusChange = (productId, status) => {
    setProcessedItems(prev => ({
      ...prev,
      [productId]: status
    }));
  };

  const submitPurchases = async () => {
    setIsLoading(true);
    const payload = { items: processedItems };
    console.log("Enviando a FastAPI para actualizar BD:", payload);
    
    // Aquí, en el futuro, haremos un fetch(POST) para guardar en base de datos
    setTimeout(() => { 
      setIsLoading(false); 
      alert("¡Simulación: Inventario actualizado y faltantes registrados en Backorder!");
    }, 1000);
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Lista de Compras</h1>
        <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
          Admin View
        </span>
      </div>
      
      {/* Muestra un mensaje de error si el backend está apagado */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p className="font-bold">Error de conexión</p>
          <p>{error}</p>
        </div>
      )}
      
      {Object.entries(shoppingList).map(([provider, items]) => (
        <div key={provider} className="mb-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-bold text-slate-700 mb-4 pb-3 border-b border-slate-100">
            📍 {provider}
          </h2>
          <div className="space-y-3">
            {items.map(item => (
              <div key={item.product_id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors">
                <div className="mb-3 sm:mb-0">
                  <p className="font-semibold text-slate-800 text-lg">{item.name}</p>
                  <p className="text-sm text-slate-500 mt-1">
                    Comprar: <span className="font-bold text-blue-600">{item.amount_needed} {item.unit}</span>
                  </p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button 
                    onClick={() => handleStatusChange(item.product_id, 'COMPRADO')}
                    className={`flex-1 sm:flex-none px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                      processedItems[item.product_id] === 'COMPRADO' 
                      ? 'bg-emerald-500 text-white shadow-md' 
                      : 'bg-white text-slate-600 border border-slate-300 hover:border-emerald-500 hover:text-emerald-600'
                    }`}
                  >
                    ✓ Comprado
                  </button>
                  <button 
                    onClick={() => handleStatusChange(item.product_id, 'NO_ENCONTRADO')}
                    className={`flex-1 sm:flex-none px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                      processedItems[item.product_id] === 'NO_ENCONTRADO' 
                      ? 'bg-rose-500 text-white shadow-md' 
                      : 'bg-white text-slate-600 border border-slate-300 hover:border-rose-500 hover:text-rose-600'
                    }`}
                  >
                    ✕ No Hubo
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] md:relative md:bg-transparent md:border-none md:shadow-none md:p-0 md:mt-8 flex justify-end">
        <button 
          onClick={submitPurchases}
          disabled={isLoading}
          className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-transform transform active:scale-95"
        >
          {isLoading ? 'Procesando...' : 'Finalizar y Actualizar Stock'}
        </button>
      </div>
    </div>
  );
};

export default ShoppingChecklist;