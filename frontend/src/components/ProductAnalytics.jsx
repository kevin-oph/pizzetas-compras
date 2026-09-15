import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Award, Package } from 'lucide-react';

const ProductAnalytics = () => {
  const [analytics, setAnalytics] = useState({ max_item: {}, min_item: {}, top_volume_chart: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8000/api/products-analytics')
      .then(res => res.json())
      .then(data => {
        setAnalytics(data);
        setLoading(false);
      })
      .catch(err => console.error("Error analizando productos", err));
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-500 font-bold">Analizando productos...</div>;

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Análisis Individual de Productos</h1>
        <p className="text-slate-500 mt-1">Métricas de consumo y volúmenes de compra</p>
      </div>

      {/* Tarjetas Destacadas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-4 bg-amber-100 text-amber-600 rounded-xl"><Award size={28} /></div>
          <div>
            <p className="text-sm font-medium text-slate-500">Producto con Mayor Volumen de Compra</p>
            <p className="text-xl font-bold text-slate-800">{analytics.max_item.name}</p>
            <p className="text-sm text-blue-600 font-semibold mt-1">Requiere: {analytics.max_item.amount} {analytics.max_item.unit}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-4 bg-purple-100 text-purple-600 rounded-xl"><Package size={28} /></div>
          <div>
            <p className="text-sm font-medium text-slate-500">Producto con Menor Volumen</p>
            <p className="text-xl font-bold text-slate-800">{analytics.min_item.name}</p>
            <p className="text-sm text-blue-600 font-semibold mt-1">Requiere: {analytics.min_item.amount} {analytics.min_item.unit}</p>
          </div>
        </div>
      </div>

      {/* Gráfica del Top de Productos */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-lg font-bold text-slate-700 mb-6">Top 5 Productos que más Volumen Exigen</h2>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics.top_volume_chart} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0"/>
              <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
              <YAxis dataKey="name" type="category" width={150} axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
              <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '12px', border: 'none'}} />
              <Bar dataKey="amount" fill="#6366f1" radius={[0, 6, 6, 0]} name="Cantidad" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ProductAnalytics;