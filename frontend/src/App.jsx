import { useState } from 'react';
import ShoppingChecklist from './components/ShoppingChecklist';
import Dashboard from './components/Dashboard';
import ProductAnalytics from './components/ProductAnalytics';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-slate-900 text-white p-4 shadow-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="font-bold text-xl tracking-wide">🍕 Pizzetas Artesanales</h1>
          <div className="flex gap-2 bg-slate-800 p-1 rounded-lg">
            <button 
              onClick={() => setCurrentView('dashboard')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${currentView === 'dashboard' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-700'}`}
            >
              📊 Panel de control
            </button>
            <button 
              onClick={() => setCurrentView('analytics')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${currentView === 'analytics' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-700'}`}
            >
              📈 Análisis de Productos
            </button>
            <button 
              onClick={() => setCurrentView('checklist')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${currentView === 'checklist' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-700'}`}
            >
              📋 Lista de Compras
            </button>
          </div>
        </div>
      </nav>
      
      {/* Enrutamiento dinámico */}
      <main>
        {currentView === 'dashboard' && <Dashboard />}
        {currentView === 'analytics' && <ProductAnalytics />}
        {currentView === 'checklist' && <ShoppingChecklist />}
      </main>
    </div>
  );
}

export default App;