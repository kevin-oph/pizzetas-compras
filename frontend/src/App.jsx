import { useState, useEffect } from 'react';
import ProductInventory from './components/ProductInventory';
import ShoppingChecklist from './components/ShoppingChecklist';
import Login from './components/Login';
import AdminPanel from './components/AdminPanel';

export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('inventory');

  useEffect(() => {
    const savedUser = localStorage.getItem('pizzetas_user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      if (parsedUser.role === 'operator') {
        setActiveTab('shopping');
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('pizzetas_user');
    setUser(null);
  };

  if (!user) {
    return <Login onLoginSuccess={(u) => {
      setUser(u);
      if (u.role === 'operator') setActiveTab('shopping');
      else setActiveTab('inventory');
    }} />;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      <header className="bg-slate-800/80 backdrop-blur-md border-b border-slate-700 sticky top-0 z-50 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-md">
        <div className="flex items-center gap-3">
          <div className="bg-orange-600 p-2.5 rounded-2xl text-xl shadow-lg shadow-orange-600/30">🍕</div>
          <div>
            <h1 className="font-black text-lg tracking-tight text-white">Pizzetas Artesanales</h1>
            <p className="text-xs text-orange-400 font-medium">Control en Tiempo Real • Perfil: <span className="uppercase font-bold">{user.role}</span> ({user.username})</p>
          </div>
        </div>

        {/* Navegación adaptada por roles */}
        <nav className="flex items-center gap-2 bg-slate-900/60 p-1.5 rounded-2xl border border-slate-700">
          <button 
            type="button"
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer ${activeTab === 'inventory' ? 'bg-orange-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            📦 Inventario
          </button>
          
          <button 
            type="button"
            onClick={() => setActiveTab('shopping')}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer ${activeTab === 'shopping' ? 'bg-orange-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            🛒 Lista de Compras
          </button>

          {/* Pestaña de administración visible únicamente para el rol admin */}
          {user.role === 'admin' && (
            <button 
              type="button"
              onClick={() => setActiveTab('admin')}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer ${activeTab === 'admin' ? 'bg-orange-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              ⚙️ Administración
            </button>
          )}
        </nav>

        <button 
          type="button"
          onClick={handleLogout}
          className="bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold px-3.5 py-2 rounded-xl border border-red-500/20 transition cursor-pointer"
        >
          Cerrar Sesión
        </button>
      </header>

      <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full">
        {activeTab === 'inventory' && <ProductInventory />}
        {activeTab === 'shopping' && <ShoppingChecklist />}
        {activeTab === 'admin' && user.role === 'admin' && <AdminPanel />}
      </main>
    </div>
  );
}