import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Check, X, ShoppingBag } from 'lucide-react';

export default function ShoppingChecklist() {
  const [checklist, setChecklist] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openSections, setOpenSections] = useState({});
  
  // Estado para llevar el registro visual de qué productos se marcaron ('bought' o 'missing')
  const [itemStatuses, setItemStatuses] = useState({});

  const fetchChecklist = () => {
    setLoading(true);
    fetch('/api/shopping-list')
      .then((res) => {
        if (!res.ok) throw new Error("Error al conectar con el backend");
        return res.json();
      })
      .then((data) => {
        setChecklist(data);
        const initialSections = {};
        Object.keys(data).forEach(provider => {
          initialSections[provider] = true;
        });
        setOpenSections(initialSections);
        setItemStatuses({}); // Limpiar estados al recargar
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchChecklist();
  }, []);

  const toggleSection = (provider) => {
    setOpenSections(prev => ({
      ...prev,
      [provider]: !prev[provider]
    }));
  };

  // Función para alternar el estado visual de cada producto
  const handleStatusClick = (productId, status) => {
    setItemStatuses(prev => ({
      ...prev,
      [productId]: prev[productId] === status ? null : status // Si vuelve a hacer click, se desmarca
    }));
  };

  // Lógica para enviar al backend solo los comprados y actualizar stock
  const handleFinalizeStock = () => {
    const itemsToUpdate = [];
    
    Object.values(checklist).forEach(providerItems => {
      providerItems.forEach(item => {
        // Si el usuario marcó este producto como 'bought', lo incluimos para sumar stock
        if (itemStatuses[item.product_id] === 'bought') {
          itemsToUpdate.push({
            product_id: item.product_id,
            quantity_to_add: item.buy_amount
          });
        }
      });
    });

    if (itemsToUpdate.length === 0) {
      alert("Por favor marca al menos un producto como 'Comprado' antes de actualizar el stock.");
      return;
    }

    fetch('/api/update-stock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(itemsToUpdate)
    })
    .then(res => {
      if (!res.ok) throw new Error("Error al actualizar el stock en la base de datos");
      return res.json();
    })
    .then(() => {
      alert("¡Inventario actualizado correctamente! El stock se ha incrementado.");
      fetchChecklist(); // Recarga la lista para limpiar los surtidos
    })
    .catch(err => alert(err.message));
  };

  if (loading) return <div className="p-8 text-center text-slate-500 font-bold">Cargando lista de compras...</div>;
  if (error) return (
    <div className="p-4 m-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
      <p className="font-bold">Error de conexión</p>
      <p className="text-sm">{error}. ¿Está encendido el backend?</p>
    </div>
  );

  return (
    <div className="p-3 md:p-8 max-w-4xl mx-auto bg-gray-50 min-h-screen pb-24">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Lista de Compras</h1>
          <p className="text-xs md:text-sm text-slate-500">Optimizado para operación móvil</p>
        </div>
      </div>

      <div className="space-y-4">
        {Object.keys(checklist).length === 0 ? (
          <p className="text-center text-slate-500 py-10">¡Todo el inventario está completo! No hay compras pendientes.</p>
        ) : (
          Object.entries(checklist).map(([provider, items]) => {
            const isOpen = openSections[provider];
            return (
              <div key={provider} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden transition-all">
                {/* Cabecera del Proveedor (Acordeón) */}
                <button
                  onClick={() => toggleSection(provider)}
                  className="w-full flex justify-between items-center p-4 bg-slate-900 text-white font-semibold text-left hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <ShoppingBag size={18} className="text-blue-400" />
                    <span className="text-base md:text-lg">{provider}</span>
                    <span className="text-xs bg-slate-800 text-blue-300 px-2 py-0.5 rounded-full border border-slate-700">
                      {items.length} {items.length === 1 ? 'item' : 'items'}
                    </span>
                  </div>
                  {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>

                {/* Contenido / Items del Proveedor */}
                {isOpen && (
                  <div className="p-3 md:p-4 divide-y divide-slate-100">
                    {items.map((item) => {
                      const status = itemStatuses[item.product_id]; // 'bought', 'missing', o undefined

                      return (
                        <div key={item.product_id} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <h3 className="font-medium text-slate-800 text-sm md:text-base">{item.name}</h3>
                            <p className="text-xs text-blue-600 font-semibold">
                              Comprar: {item.buy_amount} {item.unit}
                            </p>
                          </div>
                          
                          {/* Botones visuales con cambio de color al seleccionarse */}
                          <div className="flex items-center gap-2 self-end sm:self-center">
                            <button 
                              onClick={() => handleStatusClick(item.product_id, 'bought')}
                              className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                                status === 'bought'
                                  ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm scale-105'
                                  : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200'
                              }`}
                            >
                              <Check size={14} /> Comprado
                            </button>
                            
                            <button 
                              onClick={() => handleStatusClick(item.product_id, 'missing')}
                              className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                                status === 'missing'
                                  ? 'bg-rose-600 text-white border-rose-700 shadow-sm scale-105'
                                  : 'text-rose-700 bg-rose-50 hover:bg-rose-100 border-rose-200'
                              }`}
                            >
                              <X size={14} /> No hubo
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Botón flotante inferior para actualizar stock */}
      <div className="fixed bottom-4 left-0 right-0 px-4 max-w-4xl mx-auto pointer-events-none">
        <button 
          onClick={handleFinalizeStock}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl shadow-lg transition-transform active:scale-95 pointer-events-auto text-sm md:text-base flex items-center justify-center gap-2"
        >
          Finalizar y Actualizar Stock
        </button>
      </div>
    </div>
  );
}