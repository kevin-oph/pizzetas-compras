import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Package, Search } from 'lucide-react';

export default function ProductInventory() {
  const [catalog, setCatalog] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openSections, setOpenSections] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch('/api/inventory-catalog')
      .then((res) => {
        if (!res.ok) throw new Error("Error al conectar con el backend");
        return res.json();
      })
      .then((data) => {
        setCatalog(data);
        const initialSections = {};
        Object.keys(data).forEach(provider => {
          initialSections[provider] = true;
        });
        setOpenSections(initialSections);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const toggleSection = (provider) => {
    setOpenSections(prev => ({
      ...prev,
      [provider]: !prev[provider]
    }));
  };

  if (loading) return <div className="p-8 text-center text-slate-500 font-bold">Cargando inventario general...</div>;
  if (error) return <div className="p-4 m-4 bg-red-50 text-red-700 rounded-xl">Error: {error}</div>;

  return (
    <div className="p-3 md:p-8 max-w-4xl mx-auto bg-gray-50 min-h-screen pb-24">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Inventario General</h1>
        <p className="text-xs md:text-sm text-slate-500">Stock actual y niveles estándar por proveedor (Semáforo de control)</p>
      </div>

      {/* Barra de búsqueda rápida */}
      <div className="relative mb-6">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
          <Search size={18} />
        </span>
        <input
          type="text"
          placeholder="Buscar producto en el inventario..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm"
        />
      </div>

      <div className="space-y-4">
        {Object.entries(catalog).map(([provider, items]) => {
          const filteredItems = items.filter(item => 
            item.name.toLowerCase().includes(searchTerm.toLowerCase())
          );

          if (filteredItems.length === 0 && searchTerm) return null;

          const isOpen = openSections[provider];

          return (
            <div key={provider} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection(provider)}
                className="w-full flex justify-between items-center p-4 bg-slate-900 text-white font-semibold text-left hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Package size={18} className="text-orange-400" />
                  <span className="text-base md:text-lg">{provider}</span>
                  <span className="text-xs bg-slate-800 text-orange-300 px-2 py-0.5 rounded-full border border-slate-700">
                    {filteredItems.length} productos
                  </span>
                </div>
                {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>

              {isOpen && (
                <div className="p-3 md:p-4 divide-y divide-slate-100">
                  {filteredItems.map((item) => {
                    // Lógica del semáforo estándar (Ej. Ideal 10, Bajo <= 3, Crítico <= 1)
                    const stock = item.current_stock;
                    let badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                    let badgeText = '✅ Óptimo (Verde)';
                    
                    if (stock <= 1) {
                      badgeColor = 'bg-red-50 text-red-700 border-red-200';
                      badgeText = '🚨 Stock Crítico (Rojo)';
                    } else if (stock <= 3) {
                      badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
                      badgeText = '⚠️ Stock Bajo (Naranja)';
                    }

                    return (
                      <div key={item.product_id} className="py-2.5 flex items-center justify-between gap-2">
                        <div>
                          <h3 className="font-medium text-slate-800 text-sm md:text-base">{item.name}</h3>
                          <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-md mt-0.5 border ${badgeColor}`}>
                            {badgeText}
                          </span>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-sm font-bold text-slate-800">
                            {item.current_stock} <span className="text-xs font-normal text-slate-500">{item.unit}</span>
                          </p>
                          <p className="text-xs text-slate-400">Ideal: {item.ideal_stock} {item.unit}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}