import { useState, useEffect } from 'react';
import axios from 'axios';

export default function ShoppingChecklist() {
  const [shoppingList, setShoppingList] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checkedItems, setCheckedItems] = useState({});

  const fetchShoppingList = async () => {
    try {
      const response = await axios.get('/api/shopping-list');
      setShoppingList(response.data || {});
      setError(null);
    } catch (err) {
      console.error("Error al cargar lista de compras:", err);
      setError("No se pudo conectar con el servidor central.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShoppingList();
  }, []);

  const handleCheckboxChange = (productId) => {
    setCheckedItems(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };

  const handleFinishShopping = async () => {
    if (!window.confirm("¿Confirmas que los productos marcados fueron adquiridos? Se actualizará el inventario y se removerán de la lista automáticamente.")) return;
    
    try {
      setLoading(true);
      const providers = Object.keys(shoppingList);
      
      // Recorremos y enviamos la actualización al backend de cada producto marcado
      for (const provider of providers) {
        const items = shoppingList[provider]?.items || [];
        for (const item of items) {
          if (checkedItems[item.product_id]) {
            await axios.post('/api/update-stock', {
              product_id: item.product_id,
              new_stock: item.ideal_stock
            });
          }
        }
      }

      // Limpiamos los checks seleccionados y volvemos a pedir la lista actualizada al instante
      setCheckedItems({});
      await fetchShoppingList();
      alert("¡Compra confirmada y almacén actualizado con éxito!");
    } catch (err) {
      console.error("Error al actualizar stock:", err);
      alert("Hubo un error al sincronizar el stock.");
      setLoading(false);
    }
  };

  if (loading && Object.keys(shoppingList).length === 0) return (
    <div className="flex justify-center items-center h-64 text-orange-500 font-bold text-lg animate-pulse">
      🍕 Sincronizando checklist inteligente...
    </div>
  );

  if (error) return (
    <div className="p-4 bg-red-100 text-red-700 rounded-xl my-4 text-center font-medium">
      {error}
    </div>
  );

  const providers = Object.keys(shoppingList);

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6 pb-24">
      <div className="bg-gradient-to-r from-orange-600 to-amber-600 rounded-2xl p-6 text-white shadow-xl flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">🛒 Checklist de Compras Interactivo</h2>
          <p className="text-orange-100 text-xs sm:text-sm mt-1">Marca los productos adquiridos. Al confirmar, desaparecerán de la lista y llenarán el almacén.</p>
        </div>
        <button 
          type="button"
          onClick={fetchShoppingList}
          className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-bold backdrop-blur-md transition border border-white/30 cursor-pointer"
        >
          🔄 Refrescar Lista
        </button>
      </div>

      {providers.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-100 space-y-3">
          <div className="text-5xl">🎉</div>
          <h3 className="text-xl font-bold text-slate-800">¡Almacén completamente abastecido!</h3>
          <p className="text-slate-500 text-sm max-w-md mx-auto">No hay productos en niveles naranjas o rojos. Todo está listo para operar.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {providers.map((providerName) => {
            const data = shoppingList[providerName] || {};
            const items = data.items || [];
            
            if (items.length === 0) return null;

            return (
              <div key={providerName} className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-orange-500 animate-pulse"></span>
                    <h3 className="font-bold text-slate-800 text-base sm:text-lg">{providerName}</h3>
                  </div>
                  <div className="bg-orange-50 text-orange-700 px-3 py-1 rounded-full text-xs sm:text-sm font-extrabold border border-orange-200">
                    Est. Gasto: ${data.estimated_provider_cost?.toFixed(2) || '0.00'} MXN
                  </div>
                </div>

                <div className="divide-y divide-slate-100">
                  {items.map((item) => {
                    const isChecked = !!checkedItems[item.product_id];
                    return (
                      <label 
                        key={item.product_id} 
                        className={`px-6 py-4 flex items-center justify-between transition cursor-pointer select-none ${isChecked ? 'bg-emerald-50/80 border-l-4 border-emerald-500' : 'hover:bg-slate-50'}`}
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <input 
                            type="checkbox" 
                            checked={isChecked}
                            onChange={() => handleCheckboxChange(item.product_id)}
                            className="w-6 h-6 text-orange-600 rounded focus:ring-orange-500 cursor-pointer accent-orange-600"
                          />
                          <div className="flex-1">
                            <p className={`font-bold text-slate-800 text-sm sm:text-base ${isChecked ? 'line-through text-slate-400' : ''}`}>{item.name}</p>
                            <p className="text-xs text-slate-500">
                              Stock Actual: <span className="font-bold text-amber-600">{item.current_stock}</span> | Comprar: <span className="font-extrabold text-orange-600">{item.buy_amount} {item.unit}</span> (Ideal: {item.ideal_stock})
                            </p>
                          </div>
                        </div>
                        <div className="text-right font-black text-slate-700 text-sm sm:text-base">
                          ${item.total_estimated_price?.toFixed(2) || '0.00'}
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}

          <div className="pt-4 pb-12">
            <button
              type="button"
              onClick={handleFinishShopping}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-4 px-6 rounded-2xl shadow-xl flex items-center justify-center gap-3 transition transform active:scale-95 text-base sm:text-lg cursor-pointer shadow-emerald-600/20"
            >
              <span>✅ Confirmar Productos Marcados y Actualizar Stock</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}