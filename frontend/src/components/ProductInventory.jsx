import { useState, useEffect } from 'react';
import api from '../api/client';
import Swal from 'sweetalert2';
import { Search, Flame, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

const CATEGORIES = [
  { name: 'ALL', label: 'Todas' },
  { name: 'Carnes', label: '🥩 Carnes' },
  { name: 'Quesos y Lácteos', label: '🧀 Lácteos' },
  { name: 'Vinos y Licores', label: '🍷 Licores' },
  { name: 'Abarrotes y Harinas', label: '🌾 Abarrotes' },
  { name: 'Desechables y Empaque', label: '📦 Empaque' },
  { name: 'Limpieza', label: '🧼 Limpieza' }
];

const formatMXN = (val) => {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(val || 0);
};

export default function ProductInventory() {
  const [catalog, setCatalog] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedProviderFilter, setSelectedProviderFilter] = useState('ALL');
  const [consumeInputs, setConsumeInputs] = useState({});
  const [shiftNote, setShiftNote] = useState('Corte Diario');

  const fetchCatalog = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/inventory-catalog');
      setCatalog(response.data || {});
    } catch (err) {
      console.error("Error al cargar inventario:", err);
      Swal.fire('Error', 'No se pudo cargar el inventario del servidor', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  const handleConsumeChange = (productId, value) => {
    if (value < 0) return;
    setConsumeInputs(prev => ({
      ...prev,
      [productId]: value
    }));
  };

  const handleRegisterConsumption = async (productId, productName, currentStock, unitPrice, unit) => {
    const consumed = parseFloat(consumeInputs[productId]);
    
    if (isNaN(consumed) || consumed <= 0) {
      Swal.fire('Atención', 'Ingresa una cantidad válida mayor a 0 para descontar.', 'warning');
      return;
    }

    const estimatedCost = consumed * (unitPrice || 0);

    if (consumed > currentStock) {
      const confirmExceed = await Swal.fire({
        title: '¿Confirmar Salida?',
        html: `
          <div class="text-left text-sm space-y-2">
            <p>Vas a descontar <b>${consumed} ${unit}</b> de <b>${productName}</b>.</p>
            <p>El stock actual es de solo <b>${currentStock} ${unit}</b>. El inventario quedará en <b>0</b>.</p>
            <p class="text-rose-600 font-bold">Costo del consumo: ${formatMXN(estimatedCost)}</p>
          </div>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#64748b',
        confirmButtonText: 'Sí, descontar',
        cancelButtonText: 'Cancelar'
      });
      if (!confirmExceed.isConfirmed) return;
    }

    try {
      const res = await api.post('/api/consume-stock', {
        product_id: productId,
        consumed_amount: consumed,
        shift_notes: shiftNote
      });
      
      Swal.fire({
        icon: 'success',
        title: '¡Consumo Registrado!',
        html: `Se descontaron <b>${consumed} ${unit}</b> de "${productName}".<br/><span class="text-xs text-slate-500 font-bold">Costo: ${formatMXN(res.data.cost_total)}</span>`,
        timer: 1800,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });

      setConsumeInputs(prev => ({ ...prev, [productId]: '' }));
      fetchCatalog();
    } catch (err) {
      console.error("Error al registrar consumo:", err);
      Swal.fire('Error', 'No se pudo registrar el consumo en el servidor', 'error');
    }
  };

  const providers = Object.keys(catalog);

  return (
    <div className="max-w-5xl mx-auto p-3 sm:p-6 space-y-6 pb-28 font-sans text-slate-800">
      
      {/* BANNER HEADER (MÓVIL FRIENDLY) */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-5 sm:p-7 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-rose-400">
            <Flame size={15} />
            <span>Control de Cocina & Mermas</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight mt-1">
            Corte Diario de Insumos
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5 max-w-lg">
            Registra los insumos utilizados en cocina por turno. El sistema actualiza el almacén y calcula el costo consumido.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <input
            type="text"
            value={shiftNote}
            onChange={(e) => setShiftNote(e.target.value)}
            placeholder="Turno (ej. Turno Noche)"
            className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-semibold outline-none flex-1 md:w-44"
          />
          <button
            onClick={fetchCatalog}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition cursor-pointer"
            title="Refrescar catálogo"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* BUSCADOR Y FILTROS TÁCTILES */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="🔍 Buscar insumo por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="w-full sm:w-56">
            <select
              value={selectedProviderFilter}
              onChange={(e) => setSelectedProviderFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-bold text-slate-700 outline-none"
            >
              <option value="ALL">🏪 Todas las Tiendas</option>
              {providers.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>

        {/* CHIPS DE CATEGORÍAS */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map(cat => (
            <button
              key={cat.name}
              onClick={() => setSelectedCategory(cat.name)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                selectedCategory === cat.name
                  ? 'bg-rose-50 text-rose-700 border border-rose-300 font-black'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-transparent'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* LISTADO DE INSUMOS POR TIENDA */}
      {providers.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center text-slate-400 font-bold text-sm">
          No hay insumos registrados en el inventario.
        </div>
      ) : (
        providers.map(provName => {
          if (selectedProviderFilter !== 'ALL' && selectedProviderFilter !== provName) return null;

          const items = catalog[provName] || [];
          const filteredItems = items.filter(item => {
            const matchesCat = selectedCategory === 'ALL' || item.category === selectedCategory;
            const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesCat && matchesSearch;
          });

          if (filteredItems.length === 0) return null;

          return (
            <div key={provName} className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-100 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                  <span>🏪 {provName}</span>
                </h3>
                <span className="text-xs bg-slate-100 text-slate-600 font-bold px-3 py-1 rounded-full">
                  {filteredItems.length} insumos
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {filteredItems.map(item => {
                  let badgeBg = "bg-emerald-50 text-emerald-700 border-emerald-200";
                  let statusText = "Óptimo";
                  if (item.current_stock <= 0) {
                    badgeBg = "bg-red-50 text-red-700 border-red-200 font-black";
                    statusText = "Agotado (0)";
                  } else if (item.current_stock < item.ideal_stock) {
                    badgeBg = "bg-amber-50 text-amber-700 border-amber-200 font-black";
                    statusText = "Stock Bajo";
                  }

                  return (
                    <div
                      key={item.product_id}
                      className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 flex flex-col justify-between gap-3 shadow-xs hover:shadow-sm transition"
                    >
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="font-bold text-slate-900 text-sm">{item.name}</h4>
                          <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-md border ${badgeBg} whitespace-nowrap`}>
                            {statusText}
                          </span>
                        </div>

                        <div className="flex justify-between items-center mt-1.5 text-xs">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">{item.category}</span>
                          <span className="text-slate-500 font-semibold">
                            Costo: <span className="text-slate-800 font-bold">${item.unit_price}/{item.unit}</span>
                          </span>
                        </div>

                        <div className="bg-white rounded-xl p-2 mt-2 border border-slate-200/60 flex justify-between items-center text-xs">
                          <span className="text-slate-500 font-bold">En Almacén:</span>
                          <span className="text-orange-600 font-black text-sm">
                            {item.current_stock} <span className="text-xs text-slate-400 font-semibold">/ {item.ideal_stock} {item.unit}</span>
                          </span>
                        </div>
                      </div>

                      {/* INPUT TÁCTIL Y ACCIÓN DE DESCUENTO */}
                      <div className="pt-2 border-t border-slate-200/60 flex items-center gap-2">
                        <div className="flex-1">
                          <label className="block text-[9px] font-black text-slate-400 uppercase mb-0.5">
                            Gasto (- {item.unit})
                          </label>
                          <input
                            type="text"
                            inputMode="decimal"
                            placeholder="ej. 1.5"
                            value={consumeInputs[item.product_id] || ''}
                            onChange={(e) => handleConsumeChange(item.product_id, e.target.value)}
                            className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-black text-slate-900 outline-none focus:ring-2 focus:ring-rose-500"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRegisterConsumption(item.product_id, item.name, item.current_stock, item.unit_price, item.unit)}
                          className="mt-3.5 bg-rose-600 hover:bg-rose-700 text-white font-black px-3.5 py-1.5 rounded-xl text-xs transition shadow-sm cursor-pointer h-[34px] flex items-center justify-center whitespace-nowrap"
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