import { useState, useEffect } from 'react';
import api from '../api/client';
import { 
  Receipt, 
  Store, 
  Calendar, 
  DollarSign, 
  ChevronDown, 
  ChevronUp, 
  Search, 
  RefreshCw,
  ShoppingBag,
  Clock
} from 'lucide-react';

const formatMXN = (val) => {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(val || 0);
};

export default function PurchaseHistory() {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [providerFilter, setProviderFilter] = useState('ALL');

  const fetchPurchases = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/purchases');
      setPurchases(res.data || []);
    } catch (err) {
      console.error("Error al cargar historial de compras:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, []);

  const toggleExpand = (id) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  // Filtrado
  const filteredPurchases = purchases.filter(p => {
    const matchesProvider = providerFilter === 'ALL' || p.provider_name === providerFilter;
    const matchesSearch = 
      p.ticket_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.provider_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.items || []).some(it => it.product_name?.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesProvider && matchesSearch;
  });

  const providers = Array.from(new Set(purchases.map(p => p.provider_name))).filter(Boolean);
  const totalSpent = filteredPurchases.reduce((sum, p) => sum + (p.total_cost || 0), 0);

  return (
    <div className="max-w-5xl mx-auto p-3 sm:p-6 space-y-6 pb-28 font-sans text-slate-800">
      
      {/* HEADER */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-5 sm:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-400">
            <Receipt size={16} />
            <span>Bitácora de Tickets & Facturas</span>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight mt-1">
            Historial de Compras
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5 max-w-lg">
            Consulta los tickets ejecutados, fechas de adquisición y el precio real unitario pagado en cada compra.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-800/90 border border-slate-700 rounded-2xl px-4 py-2 text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Inversión Filtrada</span>
            <span className="text-lg font-black text-emerald-400">{formatMXN(totalSpent)}</span>
          </div>

          <button
            onClick={fetchPurchases}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition cursor-pointer"
            title="Actualizar historial"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* FILTROS Y BÚSQUEDA */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por No. Ticket, tienda o insumo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div className="w-full sm:w-56">
          <select
            value={providerFilter}
            onChange={(e) => setProviderFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-bold text-slate-700 outline-none"
          >
            <option value="ALL">Todas las Tiendas</option>
            {providers.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>

      {/* LISTA DE TICKETS */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 font-bold text-sm">
          Cargando tickets de compra...
        </div>
      ) : filteredPurchases.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center text-slate-400 font-bold text-sm border border-slate-100">
          No se encontraron registros de compra con los filtros seleccionados.
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredPurchases.map(p => {
            const isExpanded = expandedId === p.id;
            return (
              <div 
                key={p.id}
                className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden transition"
              >
                {/* FILA DE RESUMEN DEL TICKET */}
                <div 
                  onClick={() => toggleExpand(p.id)}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-slate-50/80 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl flex-shrink-0">
                      <Receipt size={22} />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-900 text-sm sm:text-base">
                          {p.provider_name}
                        </span>
                        <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700">
                          {p.ticket_number}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Clock size={13} className="text-slate-400" />
                          {p.purchase_date}
                        </span>
                        <span>•</span>
                        <span className="font-semibold">{p.items_count} insumos</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                    <div className="text-left sm:text-right">
                      <span className="text-xs text-slate-400 font-semibold block">Total Ticket</span>
                      <span className="text-lg sm:text-xl font-black text-emerald-600">
                        {formatMXN(p.total_cost)}
                      </span>
                    </div>

                    <button 
                      type="button"
                      className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
                    >
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                  </div>
                </div>

                {/* DETALLE EXPANDIBLE CON INSUMOS ADQUIRIDOS */}
                {isExpanded && (
                  <div className="bg-slate-50/70 border-t border-slate-100 p-4 sm:p-5 space-y-3">
                    <h5 className="text-xs font-black text-slate-500 uppercase tracking-wider">
                      Detalle de Insumos Adquiridos:
                    </h5>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="text-slate-400 uppercase font-black border-b border-slate-200/60 pb-2">
                            <th className="pb-2">Insumo</th>
                            <th className="pb-2">Categoría</th>
                            <th className="pb-2 text-center">Cantidad</th>
                            <th className="pb-2 text-right">Precio Pagado</th>
                            <th className="pb-2 text-right">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200/50">
                          {(p.items || []).map((it, idx) => (
                            <tr key={idx} className="hover:bg-white/80 transition">
                              <td className="py-2.5 font-bold text-slate-800">{it.product_name}</td>
                              <td className="py-2.5">
                                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                                  {it.category || 'General'}
                                </span>
                              </td>
                              <td className="py-2.5 text-center font-extrabold text-slate-700">
                                {it.quantity} {it.unit}
                              </td>
                              <td className="py-2.5 text-right font-semibold text-slate-600">
                                {formatMXN(it.unit_price_paid)}
                              </td>
                              <td className="py-2.5 text-right font-black text-slate-900">
                                {formatMXN(it.subtotal)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {p.notes && (
                      <p className="text-xs text-slate-500 bg-white p-2.5 rounded-xl border border-slate-200/60">
                        <span className="font-bold text-slate-700">Notas:</span> {p.notes}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
