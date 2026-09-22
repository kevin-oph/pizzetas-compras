import { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

export default function ProductInventory() {
  const [catalog, setCatalog] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  // Estado para registrar cuánto se gastó/consumió
  const [consumeInputs, setConsumeInputs] = useState({});

  const fetchCatalog = async () => {
    try {
      const response = await axios.get('/api/inventory-catalog');
      setCatalog(response.data || {});
      setLoading(false);
    } catch (err) {
      console.error("Error al cargar el inventario:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  const handleConsumeChange = (productId, value) => {
    // Evitamos números negativos desde la entrada
    if (value < 0) return;
    setConsumeInputs(prev => ({
      ...prev,
      [productId]: value
    }));
  };

  const handleRegisterConsumption = async (productId, productName, currentStock) => {
    const consumed = parseFloat(consumeInputs[productId]);
    
    if (isNaN(consumed) || consumed <= 0) {
      Swal.fire('Atención', 'Ingresa una cantidad válida mayor a 0 para descontar.', 'warning');
      return;
    }

    if (consumed > currentStock) {
      const confirmExceed = await Swal.fire({
        title: '¿Estás seguro?',
        text: `Vas a descontar ${consumed}, pero el stock actual es solo ${currentStock}. Esto dejará el inventario en 0.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#64748b',
        confirmButtonText: 'Sí, dejar en cero',
        cancelButtonText: 'Cancelar'
      });
      if (!confirmExceed.isConfirmed) return;
    }

    try {
      await axios.post('/api/consume-stock', {
        product_id: productId,
        consumed_amount: consumed
      });
      
      Swal.fire({
        icon: 'success',
        title: '¡Consumo Registrado!',
        text: `Se descontaron ${consumed} de "${productName}".`,
        timer: 1500,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });

      // Limpiamos el input y refrescamos
      setConsumeInputs(prev => ({ ...prev, [productId]: '' }));
      fetchCatalog();
    } catch (err) {
      console.error("Error al registrar consumo:", err);
      Swal.fire('Error', 'No se pudo registrar el consumo en el servidor', 'error');
    }
  };

  if (loading) return <div className="p-8 text-center text-orange-500 font-bold">Cargando control de inventario...</div>;

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6 pb-24 font-sans text-slate-800">
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">📉 Corte Diario y Control de Cocina</h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">Registra únicamente los insumos gastados en tu turno. El stock solo disminuye de forma automática.</p>
        </div>
        <div className="w-full md:w-72">
          <input 
            type="text" 
            placeholder="🔍 Buscar insumo..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:ring-2 focus:ring-orange-500 outline-none"
          />
        </div>
      </div>

      {Object.keys(catalog).length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center text-slate-500 shadow-sm border border-slate-100">
          No hay productos registrados en el inventario.
        </div>
      ) : (
        Object.entries(catalog).map(([providerName, items]) => {
          const filteredItems = items.filter(item => 
            item.name.toLowerCase().includes(searchTerm.toLowerCase())
          );

          if (filteredItems.length === 0) return null;

          return (
            <div key={providerName} className="bg-white rounded-2xl p-6 shadow-md border border-slate-100 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  🏪 {providerName}
                </h3>
                <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">
                  {filteredItems.length} insumos
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredItems.map((item) => {
                  let badgeColor = "bg-emerald-100 text-emerald-800 border-emerald-200";
                  let statusText = "Óptimo";
                  if (item.current_stock <= 0) {
                    badgeColor = "bg-red-100 text-red-800 border-red-200";
                    statusText = "Crítico (Agotado)";
                  } else if (item.current_stock < item.ideal_stock) {
                    badgeColor = "bg-amber-100 text-amber-800 border-amber-200";
                    statusText = "Bajo";
                  }

                  return (
                    <div key={item.product_id} className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between gap-3 shadow-sm hover:shadow transition">
                      <div>
                        <h4 className="font-bold text-slate-800 text-base">{item.name}</h4>
                        <div className="flex justify-between items-center mt-1">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${badgeColor}`}>
                            {statusText}
                          </span>
                          <span className="text-xs font-bold text-slate-600">
                            En Almacén: <span className="text-orange-600 font-black">{item.current_stock} {item.unit}</span>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60">
                        <div className="flex-1">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase">Cantidad a Restar (-)</label>
                          {/* Cambiamos el tipo a text con patrón numérico para evitar las flechitas de incremento */}
                          <input 
                            type="text"
                            inputMode="decimal"
                            placeholder="Ej. 1.5"
                            value={consumeInputs[item.product_id] || ''}
                            onChange={(e) => handleConsumeChange(item.product_id, e.target.value)}
                            className="w-full mt-1 px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-red-500 outline-none"
                          />
                        </div>
                        <button 
                          type="button"
                          onClick={() => handleRegisterConsumption(item.product_id, item.name, item.current_stock)}
                          className="mt-5 bg-red-600 hover:bg-red-700 text-white font-bold px-3.5 py-1.5 rounded-xl text-xs transition shadow cursor-pointer h-[38px] flex items-center justify-center"
                        >
                          Descontar
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}