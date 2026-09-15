import { useState } from 'react';
import Dashboard from './components/Dashboard';
import ProductAnalytics from './components/ProductAnalytics';
import ShoppingChecklist from './components/ShoppingChecklist';
import ProductInventory from './components/ProductInventory';
import { LayoutDashboard, TrendingUp, ShoppingBag, Package } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');

  return (
    <div className="min-h-screen bg-gray-50 text-slate-800">
      {/* Barra de Navegación Superior Estilizada */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col sm:flex-row justify-between items-center gap-4">
          
          {/* Logo y Título */}
          <div className="flex items-center gap-3">
            <span className="text-2xl p-1.5 bg-slate-800 rounded-xl shadow-inner">🍕</span>
            <div>
              <h1 className="text-lg font-bold text-white tracking-wide">Pizzetas Artesanales</h1>
              <p className="text-xs text-slate-400">Sistema de Control e Inventario</p>
            </div>
          </div>

          {/* Menú de Pestañas Móvil / Desktop */}
          <nav className="flex items-center gap-1.5 bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700/60 overflow-x-auto max-w-full">
            <button
              onClick={() => setCurrentTab('dashboard')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs md:text-sm font-medium transition-all whitespace-nowrap ${
                currentTab === 'dashboard'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <LayoutDashboard size={16} /> Panel de Control
            </button>

            <button
              onClick={() => setCurrentTab('inventory')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs md:text-sm font-medium transition-all whitespace-nowrap ${
                currentTab === 'inventory'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Package size={16} /> Inventario
            </button>

            <button
              onClick={() => setCurrentTab('analytics')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs md:text-sm font-medium transition-all whitespace-nowrap ${
                currentTab === 'analytics'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <TrendingUp size={16} /> Análisis
            </button>

            <button
              onClick={() => setCurrentTab('shopping')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs md:text-sm font-medium transition-all whitespace-nowrap ${
                currentTab === 'shopping'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <ShoppingBag size={16} /> Lista de Compras
            </button>
          </nav>

        </div>
      </header>

      {/* Renderizado Dinámico de Vistas */}
      <main>
        {currentTab === 'dashboard' && <Dashboard />}
        {currentTab === 'inventory' && <ProductInventory />}
        {currentTab === 'analytics' && <ProductAnalytics />}
        {currentTab === 'shopping' && <ShoppingChecklist />}
      </main>
    </div>
  );
}