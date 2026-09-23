import { useState, useEffect } from 'react';
import WasteAndIncidentManager from './components/WasteAndIncidentManager';
import ShoppingChecklist from './components/ShoppingChecklist';
import Dashboard from './components/Dashboard';
import PurchaseHistory from './components/PurchaseHistory';
import PosCutUploader from './components/PosCutUploader';
import RecipeManager from './components/RecipeManager';
import Login from './components/Login';
import AdminPanel from './components/AdminPanel';
import { 
  BarChart3, 
  ShoppingCart, 
  Flame, 
  Receipt, 
  FileSpreadsheet, 
  ChefHat, 
  Settings, 
  LogOut 
} from 'lucide-react';

export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const savedUser = localStorage.getItem('pizzetas_user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      if (parsedUser.role === 'operator') {
        setActiveTab('shopping');
      } else {
        setActiveTab('dashboard');
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('pizzetas_user');
    setUser(null);
  };

  if (!user) {
    return (
      <Login 
        onLoginSuccess={(u) => {
          setUser(u);
          if (u.role === 'operator') setActiveTab('shopping');
          else setActiveTab('dashboard');
        }} 
      />
    );
  }

  const navItems = [
    { id: 'dashboard', label: 'Métricas', icon: BarChart3, adminOnly: true },
    { id: 'pos', label: 'Corte POS', icon: FileSpreadsheet, adminOnly: true },
    { id: 'recipes', label: 'Recetas', icon: ChefHat, adminOnly: true },
    { id: 'shopping', label: 'Compras', icon: ShoppingCart, adminOnly: false },
    { id: 'mermas', label: 'Mermas y Limpieza', icon: Flame, adminOnly: false },
    { id: 'history', label: 'Historial', icon: Receipt, adminOnly: true },
    { id: 'admin', label: 'Ajustes', icon: Settings, adminOnly: true }
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans pb-16 md:pb-0">
      
      {/* HEADER SUPERIOR (TABLET / DESKTOP) */}
      <header className="bg-slate-800/90 backdrop-blur-md border-b border-slate-700 sticky top-0 z-50 px-4 sm:px-6 py-3 flex flex-row justify-between items-center gap-4 shadow-md">
        
        {/* LOGO Y PERFIL */}
        <div className="flex items-center gap-3">
          <div className="bg-orange-600 p-2 sm:p-2.5 rounded-2xl text-lg sm:text-xl shadow-lg shadow-orange-600/30">
            🍕
          </div>
          <div>
            <h1 className="font-black text-base sm:text-lg tracking-tight text-white flex items-center gap-2">
              Pizzetas Artesanales
              <span className="text-[10px] bg-orange-500/20 text-orange-400 border border-orange-500/30 font-black px-2 py-0.5 rounded-full uppercase hidden sm:inline-block">
                360° Pro
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">
              Usuario: <span className="text-orange-400 font-bold">{user.username}</span> • Rol: <span className="uppercase font-extrabold text-slate-200">{user.role}</span>
            </p>
          </div>
        </div>

        {/* NAVEGACIÓN PRINCIPAL (DESKTOP & TABLET) */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-700">
          {navItems.map(item => {
            if (item.adminOnly && user.role !== 'admin') return null;
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-black transition cursor-pointer flex items-center gap-1.5 ${
                  isActive 
                    ? 'bg-orange-600 text-white shadow-md' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon size={15} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* LOGOUT */}
        <button 
          type="button"
          onClick={handleLogout}
          className="bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold px-3 py-2 rounded-xl border border-red-500/20 transition cursor-pointer flex items-center gap-1.5"
          title="Cerrar Sesión"
        >
          <LogOut size={14} />
          <span className="hidden sm:inline">Cerrar Sesión</span>
        </button>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 w-full">
        {activeTab === 'dashboard' && user.role === 'admin' && <Dashboard />}
        {activeTab === 'pos' && user.role === 'admin' && <PosCutUploader />}
        {activeTab === 'recipes' && user.role === 'admin' && <RecipeManager />}
        {activeTab === 'shopping' && <ShoppingChecklist />}
        {activeTab === 'mermas' && <WasteAndIncidentManager user={user} />}
        {activeTab === 'history' && user.role === 'admin' && <PurchaseHistory />}
        {activeTab === 'admin' && user.role === 'admin' && <AdminPanel />}
      </main>

      {/* BARRA DE NAVEGACIÓN INFERIOR (MÓVIL / SMARTPHONES) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-lg border-t border-slate-700 px-2 py-1.5 flex justify-around items-center">
        {navItems.map(item => {
          if (item.adminOnly && user.role !== 'admin') return null;
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition cursor-pointer ${
                isActive 
                  ? 'text-orange-500 font-black' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className={`p-1 rounded-lg ${isActive ? 'bg-orange-500/15' : ''}`}>
                <Icon size={17} />
              </div>
              <span className="text-[9px] tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </nav>

    </div>
  );
}