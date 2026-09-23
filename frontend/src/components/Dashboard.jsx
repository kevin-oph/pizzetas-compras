import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  DollarSign, 
  ShoppingCart, 
  TrendingDown, 
  AlertTriangle, 
  Package, 
  RefreshCw, 
  Calendar,
  Layers,
  ArrowUpRight,
  Store,
  Flame,
  Award,
  CreditCard,
  Target
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid, 
  PieChart, 
  Pie, 
  Cell, 
  Legend, 
  AreaChart, 
  Area 
} from 'recharts';

const CATEGORY_COLORS = {
  "Carnes": "#ef4444",          // Rojo
  "Quesos y Lácteos": "#f59e0b", // Ámbar / Dorado
  "Vinos y Licores": "#8b5cf6",  // Púrpura
  "Abarrotes y Harinas": "#f97316", // Naranja
  "Desechables y Empaque": "#06b6d4", // Cian
  "Limpieza": "#10b981"          // Esmeralda
};

const formatMXN = (val) => {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 2 }).format(val || 0);
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  const [selectedMetricView, setSelectedMetricView] = useState('inventory_value'); // 'inventory_value' | 'historical_spent' | 'restock_budget'

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/dashboard-metrics?days=${days}`);
      setData(res.data);
    } catch (err) {
      console.error("Error al cargar métricas:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [days]);

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-orange-400 gap-4">
        <RefreshCw className="animate-spin" size={40} />
        <p className="font-bold text-lg">Cargando Centro de Mando 360°...</p>
      </div>
    );
  }

  const kpis = data?.kpis || {};
  const payments = data?.payment_methods || { cash: 0, card: 0, transfer: 0, tips: 0 };
  const topDishes = data?.top_dishes || [];
  const categoryChart = data?.category_chart || [];
  const providerChart = data?.provider_chart || [];
  const timeline = data?.timeline || [];
  const topConsumed = data?.top_consumed || [];
  const criticalItems = data?.critical_items || [];

  const hasSalesData = (kpis.total_sales_period || 0) > 0;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 font-sans text-slate-800">
      
      {/* ENCABEZADO Y FILTRO TEMPORAL */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-2xl border border-slate-700/60 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-orange-400 uppercase tracking-widest mb-1">
            <span>🍕 Métricas Financieras & Operativas</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
            Centro de Mando Gerencial
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-xl">
            Monitoreo en tiempo real del capital en almacén, tickets de compras reales, costo de consumo en cocina y ventas del punto de venta.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center bg-slate-800/90 border border-slate-700 rounded-2xl p-1 shadow-inner">
            <Calendar size={16} className="text-slate-400 ml-2.5 mr-1" />
            {[
              { label: '7 Días', value: 7 },
              { label: '15 Días', value: 15 },
              { label: '30 Días', value: 30 },
              { label: '90 Días', value: 90 },
            ].map(tab => (
              <button
                key={tab.value}
                onClick={() => setDays(tab.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  days === tab.value 
                    ? 'bg-orange-600 text-white shadow-md' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={fetchMetrics}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-2xl border border-slate-700 transition cursor-pointer flex items-center gap-2 text-xs font-bold"
            title="Refrescar datos"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            <span className="hidden sm:inline">Actualizar</span>
          </button>
        </div>
      </div>

      {/* SECCIÓN POS: VENTAS Y MARGEN DE GANANCIA (SI HAY CORTES PROCESADOS) */}
      {hasSalesData && (
        <div className="bg-gradient-to-br from-emerald-950/80 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 text-white space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-emerald-500/20 pb-4">
            <div>
              <span className="text-[10px] font-black tracking-widest text-emerald-400 uppercase block">
                Cortes de Punto de Venta (POS)
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                Ventas & Margen de Ganancia Real
              </h3>
            </div>
            <span className="text-xs bg-emerald-500/20 text-emerald-300 font-bold px-3 py-1 rounded-full border border-emerald-500/30">
              {kpis.cuts_count || 1} Cortes en el Periodo ({days} días)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Ventas Totales */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5">
              <span className="text-xs font-bold text-slate-400 uppercase">Facturación POS</span>
              <p className="text-2xl sm:text-3xl font-black text-emerald-400 mt-2">
                {formatMXN(kpis.total_sales_period)}
              </p>
              <span className="text-[11px] text-slate-400 mt-1 block">Ventas de comidas y bebidas</span>
            </div>

            {/* Margen Bruto */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5">
              <span className="text-xs font-bold text-slate-400 uppercase">Margen Bruto de Ganancia</span>
              <p className="text-2xl sm:text-3xl font-black text-white mt-2">
                {formatMXN(kpis.gross_profit_period)}
              </p>
              <span className="text-[11px] text-emerald-400 mt-1 block">Ventas menos Costo de Insumos</span>
            </div>

            {/* % Food Cost */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5">
              <span className="text-xs font-bold text-slate-400 uppercase">% Food Cost (Costo Materia Prima)</span>
              <p className="text-2xl sm:text-3xl font-black text-amber-400 mt-2">
                {kpis.avg_food_cost_percentage}%
              </p>
              <span className="text-[11px] text-slate-400 mt-1 block">
                {kpis.avg_food_cost_percentage <= 32 ? '🟢 Rango Saludable (<32%)' : '🟡 Margen a Optimizar'}
              </span>
            </div>

            {/* Saldo y Auditoría Caja */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5">
              <span className="text-xs font-bold text-slate-400 uppercase">Efectivo en Caja</span>
              <p className="text-2xl sm:text-3xl font-black text-blue-400 mt-2">
                {formatMXN(payments.cash)}
              </p>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Tarjetas: {formatMXN(payments.card)} • Propinas: {formatMXN(payments.tips)}
              </span>
            </div>
          </div>

          {/* TOP PLATILLOS MÁS VENDIDOS */}
          {topDishes.length > 0 && (
            <div className="pt-2 border-t border-emerald-500/20">
              <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Award size={15} className="text-amber-400" />
                <span>Top Platillos con Mayor Facturación</span>
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {topDishes.map((dish, i) => (
                  <div key={dish.name} className="bg-slate-800/60 border border-slate-700 p-2.5 rounded-xl text-xs">
                    <span className="text-slate-400 font-bold block truncate">{dish.name}</span>
                    <span className="text-white font-black text-sm">{formatMXN(dish.total_sales)}</span>
                    <span className="text-[10px] text-emerald-400 font-semibold block">{dish.quantity} vendidos</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TARJETAS DE KPIS PRINCIPALES DE ALMACÉN Y COMPRAS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* KPI 1: Capital en Almacén */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition">
          <div className="flex justify-between items-start">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Valor en Almacén</span>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <DollarSign size={22} />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-3">{formatMXN(kpis.total_inventory_value)}</p>
          <div className="flex items-center gap-2 mt-2 text-xs font-semibold text-slate-500">
            <span className="text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-lg font-bold">Activo Fijo</span>
            <span>Capital inmovilizado en insumos</span>
          </div>
        </div>

        {/* KPI 2: Presupuesto para Resurtido */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition">
          <div className="flex justify-between items-start">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Presupuesto Sugerido</span>
            <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl">
              <ShoppingCart size={22} />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-orange-600 mt-3">{formatMXN(kpis.estimated_restock_budget)}</p>
          <div className="flex items-center gap-2 mt-2 text-xs font-semibold text-slate-500">
            <span className="text-orange-700 bg-orange-100/80 px-2 py-0.5 rounded-lg font-bold">Por Invertir</span>
            <span>Para llevar todo al 100% ideal</span>
          </div>
        </div>

        {/* KPI 3: Gasto Real Ejecutado */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition">
          <div className="flex justify-between items-start">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Compras del Periodo</span>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
              <ArrowUpRight size={22} />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-3">{formatMXN(kpis.total_purchases_period)}</p>
          <div className="flex items-center gap-2 mt-2 text-xs font-semibold text-slate-500">
            <span className="text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-lg font-bold">{days} días</span>
            <span>Tickets pagados en tiendas</span>
          </div>
        </div>

        {/* KPI 4: Costo de Consumo en Cocina */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition">
          <div className="flex justify-between items-start">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Costo Consumido</span>
            <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
              <TrendingDown size={22} />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-rose-600 mt-3">{formatMXN(kpis.total_consumption_period)}</p>
          <div className="flex flex-wrap items-center gap-1.5 mt-2 text-xs font-semibold text-slate-500">
            <span className="text-rose-700 bg-rose-100/70 px-2 py-0.5 rounded-lg font-bold">
              Mermas: {formatMXN(kpis.waste_cost_period || 0)}
            </span>
            <span className="text-sky-700 bg-sky-100/70 px-2 py-0.5 rounded-lg font-bold">
              Limpieza: {formatMXN(kpis.cleaning_cost_period || 0)}
            </span>
          </div>
        </div>

      </div>

      {/* SEMÁFORO DE SALUD DEL ALMACÉN */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-slate-900 text-white rounded-2xl">
            <Package size={22} />
          </div>
          <div>
            <h4 className="font-extrabold text-slate-900 text-base">Salud de Abastecimiento</h4>
            <p className="text-xs text-slate-500">Total de insumos catalogados: <span className="font-bold text-slate-800">{kpis.total_items_count}</span></p>
          </div>
        </div>

        <div className="flex items-center gap-4 sm:gap-8 w-full md:w-auto justify-around">
          <div className="text-center">
            <span className="text-xs font-extrabold text-red-600 block uppercase">Crítico (0 stock)</span>
            <span className="text-2xl font-black text-red-600">{kpis.critical_items_count}</span>
          </div>
          <div className="h-8 w-px bg-slate-200"></div>
          <div className="text-center">
            <span className="text-xs font-extrabold text-amber-600 block uppercase">Bajo (&lt; ideal)</span>
            <span className="text-2xl font-black text-amber-600">{kpis.low_stock_items_count}</span>
          </div>
          <div className="h-8 w-px bg-slate-200"></div>
          <div className="text-center">
            <span className="text-xs font-extrabold text-emerald-600 block uppercase">Óptimo (Lleno)</span>
            <span className="text-2xl font-black text-emerald-600">{kpis.optimal_items_count}</span>
          </div>
        </div>
      </div>

      {/* SECCIÓN DE GRÁFICAS: CATEGORÍAS Y PROVEEDORES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* GRÁFICA 1: DESGLOSE POR CATEGORÍA GASTRONÓMICA */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
                <Layers className="text-orange-600" size={20} />
                Desglose por Categoría
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Distribución del capital y compras por área gastronómica</p>
            </div>

            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => setSelectedMetricView('inventory_value')}
                className={`px-2.5 py-1 rounded-lg transition ${selectedMetricView === 'inventory_value' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}
              >
                En Almacén
              </button>
              <button
                onClick={() => setSelectedMetricView('historical_spent')}
                className={`px-2.5 py-1 rounded-lg transition ${selectedMetricView === 'historical_spent' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}
              >
                Gastado ({days}d)
              </button>
              <button
                onClick={() => setSelectedMetricView('restock_budget')}
                className={`px-2.5 py-1 rounded-lg transition ${selectedMetricView === 'restock_budget' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}
              >
                Por Comprar
              </button>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryChart}
                  dataKey={selectedMetricView}
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={95}
                  innerRadius={55}
                  paddingAngle={3}
                >
                  {categoryChart.map((entry) => (
                    <Cell key={`cell-${entry.category}`} fill={CATEGORY_COLORS[entry.category] || "#64748b"} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [formatMXN(value), "Monto"]}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  iconType="circle"
                  formatter={(val) => <span className="text-xs font-bold text-slate-700">{val}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
            {categoryChart.map((cat) => (
              <div key={cat.category} className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[cat.category] || "#64748b" }}></span>
                  <p className="text-[11px] font-bold text-slate-700 truncate">{cat.category}</p>
                </div>
                <p className="text-xs font-black text-slate-900 mt-1">
                  {formatMXN(cat[selectedMetricView])}
                </p>
                {cat.critical_count > 0 && (
                  <span className="text-[10px] text-red-600 font-bold block mt-0.5">⚠️ {cat.critical_count} agotados</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* GRÁFICA 2: GASTO Y PRESUPUESTO POR TIENDA / PROVEEDOR */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
              <Store className="text-blue-600" size={20} />
              Presupuesto vs Compras por Tienda
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Comparativa de inversión requerida vs compras ejecutadas</p>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={providerChart} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="provider" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  tickFormatter={(v) => `$${v}`}
                />
                <Tooltip 
                  formatter={(val, name) => [formatMXN(val), name === 'restock_budget' ? 'Presupuesto Requerido' : 'Gastado Histórico']}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Legend 
                  verticalAlign="top" 
                  align="right"
                  iconType="circle"
                  formatter={(val) => <span className="text-xs font-bold text-slate-700">{val === 'restock_budget' ? 'Por Comprar' : 'Comprado'}</span>}
                />
                <Bar dataKey="restock_budget" fill="#f97316" radius={[6, 6, 0, 0]} name="restock_budget" />
                <Bar dataKey="historical_spent" fill="#3b82f6" radius={[6, 6, 0, 0]} name="historical_spent" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 pt-2">
            <p className="text-xs font-bold text-slate-500 uppercase">Resumen de Tiendas:</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {providerChart.map(p => (
                <div key={p.provider} className="p-2 rounded-xl bg-slate-50 text-xs">
                  <span className="font-bold text-slate-800 block truncate">{p.provider}</span>
                  <span className="text-orange-600 font-extrabold">{p.deficit_items} por surtir</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* GRÁFICA 3: EVOLUCIÓN TEMPORAL (COMPRAS VS CONSUMO) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
              <Calendar className="text-emerald-600" size={20} />
              Flujo Financiero: Compras vs Consumo de Cocina
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Evolución en el tiempo: compras pagadas (verde) vs valor de insumos consumidos (rojo)</p>
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timeline} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCompras" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorConsumo" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 11 }}
                tickFormatter={(d) => d.slice(5)}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 11 }}
                tickFormatter={(v) => `$${v}`}
              />
              <Tooltip 
                formatter={(val, name) => [formatMXN(val), name === 'compras' ? 'Compras del Día' : 'Consumo del Día']}
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Legend 
                verticalAlign="top" 
                align="right"
                iconType="circle"
                formatter={(val) => <span className="text-xs font-bold text-slate-700">{val === 'compras' ? 'Compras (Ingreso a Almacén)' : 'Consumo (Salida de Cocina)'}</span>}
              />
              <Area type="monotone" dataKey="compras" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCompras)" />
              <Area type="monotone" dataKey="consumo" stroke="#ef4444" strokeWidth={2.5} fillOpacity={1} fill="url(#colorConsumo)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* TOP CONSUMOS Y ALERTAS CRÍTICAS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* TOP 5 INSUMOS CON MAYOR COSTO CONSUMIDO */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-base sm:text-lg text-slate-900 flex items-center gap-2">
              <Flame className="text-amber-500" size={20} />
              Insumos de Mayor Consumo Financiero
            </h3>
            <span className="text-xs bg-amber-50 text-amber-700 font-extrabold px-2.5 py-1 rounded-xl">
              Últimos {days} días
            </span>
          </div>

          {topConsumed.length === 0 ? (
            <div className="text-center py-8 text-slate-400 font-semibold text-sm">
              No hay consumos registrados en este periodo.
            </div>
          ) : (
            <div className="space-y-3">
              {topConsumed.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100/70 transition">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-black flex items-center justify-center">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{item.name}</p>
                      <p className="text-xs text-slate-500">
                        Total gastado en cocina: <span className="font-bold text-slate-700">{item.total_quantity} {item.unit}</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-rose-600 text-sm sm:text-base">{formatMXN(item.total_cost)}</p>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{item.category}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ALERTA DE INSUMOS CRÍTICOS / URGENCIA DE RESURTIDO */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-base sm:text-lg text-slate-900 flex items-center gap-2">
              <AlertTriangle className="text-red-500" size={20} />
              Prioridad de Resurtido Inmediato
            </h3>
            <span className="text-xs bg-red-50 text-red-700 font-extrabold px-2.5 py-1 rounded-xl">
              {criticalItems.length} En Riesgo
            </span>
          </div>

          {criticalItems.length === 0 ? (
            <div className="text-center py-8 text-emerald-600 font-bold text-sm">
              🎉 ¡Excelente! No hay insumos en nivel crítico de desabasto.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
              {criticalItems.map((item) => (
                <div key={item.product_id} className="p-3 rounded-2xl bg-red-50/60 border border-red-200/70 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{item.name}</p>
                    <p className="text-xs text-slate-600">
                      Stock: <span className="text-red-600 font-black">{item.current_stock}</span> / Ideal: {item.ideal_stock} {item.unit} • <span className="text-slate-500">{item.provider}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-red-700 block">Faltan {item.deficit} {item.unit}</span>
                    <span className="text-[11px] font-semibold text-slate-500">Costo: {formatMXN(item.estimated_cost)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}