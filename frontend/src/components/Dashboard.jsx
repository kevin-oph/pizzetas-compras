import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { ShoppingCart, AlertTriangle, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({ total_items: 0, chart_data: [], top_provider: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/dashboard-stats');
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Error cargando estadísticas", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-500 font-bold animate-pulse">Cargando métricas...</div>;

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Centro de Mando</h1>
        <p className="text-slate-500 mt-1">Resumen de inventario en tiempo real</p>
      </div>

      {/* Tarjetas de KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-4 bg-blue-100 text-blue-600 rounded-xl"><ShoppingCart size={28} /></div>
          <div>
            <p className="text-sm font-medium text-slate-500">Productos Faltantes</p>
            <p className="text-3xl font-bold text-slate-800">{stats.total_items}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-4 bg-rose-100 text-rose-600 rounded-xl"><AlertTriangle size={28} /></div>
          <div>
            <p className="text-sm font-medium text-slate-500">Mayor Desabasto</p>
            <p className="text-2xl font-bold text-slate-800">{stats.top_provider}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-4 bg-emerald-100 text-emerald-600 rounded-xl"><TrendingUp size={28} /></div>
          <div>
            <p className="text-sm font-medium text-slate-500">Estado del Sistema</p>
            <p className="text-xl font-bold text-emerald-600">En Línea</p>
          </div>
        </div>
      </div>

      {/* Gráfica */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-lg font-bold text-slate-700 mb-6">Volumen de Compra por Proveedor</h2>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.chart_data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0"/>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
              <Tooltip 
                cursor={{fill: '#f1f5f9'}} 
                contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
              />
              <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Artículos" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;