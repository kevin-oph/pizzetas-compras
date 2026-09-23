import { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Settings, PlusCircle, Store, Edit2, Trash2, Search, Filter } from 'lucide-react';

const CATEGORIES = [
  "Carnes",
  "Quesos y Lácteos",
  "Vinos y Licores",
  "Abarrotes y Harinas",
  "Desechables y Empaque",
  "Limpieza"
];

export default function AdminPanel() {
  const [providers, setProviders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados para nuevo producto
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('Abarrotes y Harinas');
  const [newProviderId, setNewProviderId] = useState('');
  const [newIdeal, setNewIdeal] = useState('');
  const [newUnit, setNewUnit] = useState('pzas');
  const [newPrice, setNewPrice] = useState('');

  // Estado para nuevo proveedor
  const [newProviderName, setNewProviderName] = useState('');

  // Estado para edición
  const [editingProduct, setEditingProduct] = useState(null);

  // Estados para Paginación y Filtros
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProviderFilter, setSelectedProviderFilter] = useState('ALL');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 10;

  const fetchData = async () => {
    setLoading(true);
    try {
      const provRes = await axios.get('/api/providers');
      setProviders(provRes.data || []);
      
      const invRes = await axios.get('/api/inventory-catalog');
      let allProducts = [];
      Object.entries(invRes.data || {}).forEach(([providerName, items]) => {
        items.forEach(item => {
          allProducts.push({ 
            product_id: item.product_id,
            name: item.name,
            category: item.category || 'Abarrotes y Harinas',
            ideal_stock: item.ideal_stock,
            current_stock: item.current_stock,
            unit_measure: item.unit || item.unit_measure,
            unit_price: item.unit_price || 0.0,
            last_purchased_price: item.last_purchased_price || item.unit_price || 0.0,
            providerName 
          });
        });
      });
      setProducts(allProducts);
    } catch (err) {
      console.error("Error al cargar datos de administración:", err);
      Swal.fire('Error', 'No se pudieron cargar los datos', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!newProviderId) {
      Swal.fire('Atención', 'Selecciona un proveedor', 'warning');
      return;
    }

    try {
      await axios.post('/api/products', {
        name: newName,
        category: newCategory,
        provider_id: parseInt(newProviderId),
        ideal_stock: parseFloat(newIdeal),
        current_stock: 0.0,
        unit_measure: newUnit,
        unit_price: parseFloat(newPrice)
      });
      Swal.fire({ icon: 'success', title: '¡Insumo Creado con Éxito!', confirmButtonColor: '#ea580c' });
      setNewName('');
      setNewIdeal('');
      setNewPrice('');
      fetchData();
    } catch {
      Swal.fire('Error', 'No se pudo crear el insumo', 'error');
    }
  };

  const handleCreateProvider = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/providers', { name: newProviderName });
      Swal.fire({ icon: 'success', title: '¡Tienda Registrada!', confirmButtonColor: '#ea580c' });
      setNewProviderName('');
      fetchData();
    } catch {
      Swal.fire('Error', 'No se pudo registrar la tienda', 'error');
    }
  };

  const handleDeleteProduct = async (id) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "Esta acción eliminará el producto del sistema permanentemente.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`/api/products/${id}`);
        Swal.fire('¡Eliminado!', 'El insumo ha sido dado de baja.', 'success');
        fetchData();
      } catch {
        Swal.fire('Error', 'No se pudo eliminar el producto', 'error');
      }
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/products/${editingProduct.product_id}`, {
        name: editingProduct.name,
        category: editingProduct.category,
        ideal_stock: parseFloat(editingProduct.ideal_stock),
        unit_measure: editingProduct.unit_measure,
        unit_price: parseFloat(editingProduct.unit_price)
      });
      Swal.fire({ icon: 'success', title: '¡Actualizado con éxito!', confirmButtonColor: '#ea580c' });
      setEditingProduct(null);
      fetchData();
    } catch {
      Swal.fire('Error', 'No se pudo actualizar el producto', 'error');
    }
  };

  // Filtrado múltiple (Búsqueda + Tienda + Categoría)
  const filteredProducts = products.filter(p => {
    const matchesProvider = selectedProviderFilter === 'ALL' || p.providerName === selectedProviderFilter;
    const matchesCategory = selectedCategoryFilter === 'ALL' || p.category === selectedCategoryFilter;
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesProvider && matchesCategory && matchesSearch;
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentTableData = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  if (loading && products.length === 0) {
    return <div className="p-8 text-center text-orange-500 font-bold">Cargando panel de administración...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-8 pb-28 font-sans text-slate-800">
      
      {/* HEADER */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-orange-400 mb-1">
            <Settings size={15} />
            <span>Configuración & Catálogo Maestro</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">Panel Administrativo</h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">Control integral de insumos, clasificación por categorías y costos unitarios.</p>
        </div>
      </div>

      {/* FORMULARIOS DE ALTA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Registrar Tienda */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
          <h3 className="text-base font-black flex items-center gap-2 text-slate-900">
            <Store className="text-orange-600" size={18} />
            <span>Nueva Tienda / Proveedor</span>
          </h3>
          <form onSubmit={handleCreateProvider} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nombre de la Tienda</label>
              <input 
                type="text" 
                placeholder="Ej. Costco, Chedraui..." 
                value={newProviderName}
                onChange={(e) => setNewProviderName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-orange-500 outline-none font-semibold"
                required
              />
            </div>
            <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-2.5 rounded-xl text-xs sm:text-sm transition cursor-pointer">
              Agregar Tienda
            </button>
          </form>
        </div>

        {/* Dar de Alta Insumo */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
          <h3 className="text-base font-black flex items-center gap-2 text-slate-900">
            <PlusCircle className="text-orange-600" size={18} />
            <span>Dar de Alta Nuevo Insumo</span>
          </h3>
          <form onSubmit={handleCreateProduct} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nombre del Insumo</label>
                <input 
                  type="text" 
                  placeholder="Ej. Queso Gouda en bloque..." 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-orange-500 outline-none font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Categoría Gastronómica</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white font-semibold outline-none"
                  required
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tienda Habitual</label>
                <select 
                  value={newProviderId}
                  onChange={(e) => setNewProviderId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white font-semibold outline-none"
                  required
                >
                  <option value="">Seleccionar...</option>
                  {providers.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Unidad de Medida</label>
                <input 
                  type="text" 
                  placeholder="ej. kg, bolsa, pzas" 
                  value={newUnit}
                  onChange={(e) => setNewUnit(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Stock Ideal (Máx)</label>
                <input 
                  type="number" 
                  step="0.1"
                  placeholder="Ej. 10" 
                  value={newIdeal}
                  onChange={(e) => setNewIdeal(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Costo Unitario ($)</label>
                <input 
                  type="number" 
                  step="0.01"
                  placeholder="Ej. 140.00" 
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold outline-none"
                  required
                />
              </div>
            </div>

            <button type="submit" className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 text-white font-black py-2.5 rounded-xl text-xs sm:text-sm transition shadow-md cursor-pointer">
              Guardar Nuevo Insumo
            </button>
          </form>
        </div>
      </div>

      {/* SECCIÓN DE EDICIÓN RÁPIDA */}
      {editingProduct && (
        <div className="bg-amber-50 border border-amber-300 rounded-3xl p-6 shadow-md space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-black text-amber-950 flex items-center gap-2">
              <Edit2 size={16} />
              <span>Modificando: <span className="underline">{editingProduct.name}</span></span>
            </h3>
            <button type="button" onClick={() => setEditingProduct(null)} className="text-xs font-bold text-slate-500 hover:text-red-600 cursor-pointer">
              ✕ Cancelar
            </button>
          </div>

          <form onSubmit={handleUpdateProduct} className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            <div>
              <label className="block text-xs font-extrabold text-amber-900 uppercase mb-1">Nombre</label>
              <input 
                type="text" 
                value={editingProduct.name}
                onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs sm:text-sm font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-amber-900 uppercase mb-1">Categoría</label>
              <select
                value={editingProduct.category}
                onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value})}
                className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs sm:text-sm font-bold"
                required
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-amber-900 uppercase mb-1">Stock Ideal</label>
              <input 
                type="number" 
                step="0.1"
                value={editingProduct.ideal_stock}
                onChange={(e) => setEditingProduct({...editingProduct, ideal_stock: e.target.value})}
                className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs sm:text-sm font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-amber-900 uppercase mb-1">Unidad</label>
              <input 
                type="text" 
                value={editingProduct.unit_measure}
                onChange={(e) => setEditingProduct({...editingProduct, unit_measure: e.target.value})}
                className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs sm:text-sm font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-amber-900 uppercase mb-1">Costo ($)</label>
              <input 
                type="number" 
                step="0.01"
                value={editingProduct.unit_price}
                onChange={(e) => setEditingProduct({...editingProduct, unit_price: e.target.value})}
                className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs sm:text-sm font-bold"
                required
              />
            </div>

            <div className="sm:col-span-5 flex justify-end pt-2">
              <button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white font-black px-6 py-2.5 rounded-xl text-xs sm:text-sm transition shadow cursor-pointer">
                Guardar Cambios
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TABLA DE INSUMOS CON DOBLE FILTRO Y PAGINACIÓN */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden space-y-4">
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900">
              📋 Listado Maestro de Insumos ({filteredProducts.length})
            </h3>
            <p className="text-xs text-slate-400">Total catalogado para compras y almacén</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Buscador */}
            <input 
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-slate-50 outline-none font-semibold flex-1 md:w-36"
            />

            {/* Filtro Tienda */}
            <select 
              value={selectedProviderFilter}
              onChange={(e) => { setSelectedProviderFilter(e.target.value); setCurrentPage(1); }}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-slate-50 outline-none font-bold text-slate-700"
            >
              <option value="ALL">Todas las Tiendas</option>
              {providers.map(p => (
                <option key={p.id} value={p.name}>{p.name}</option>
              ))}
            </select>

            {/* Filtro Categoría */}
            <select 
              value={selectedCategoryFilter}
              onChange={(e) => { setSelectedCategoryFilter(e.target.value); setCurrentPage(1); }}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-slate-50 outline-none font-bold text-slate-700"
            >
              <option value="ALL">Todas las Categorías</option>
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-400 uppercase font-black border-b border-slate-100">
                <th className="p-3.5">Insumo</th>
                <th className="p-3.5">Categoría</th>
                <th className="p-3.5">Tienda</th>
                <th className="p-3.5 text-center">Stock Actual / Ideal</th>
                <th className="p-3.5 text-right">Costo Unitario</th>
                <th className="p-3.5 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentTableData.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400 font-semibold">
                    No se encontraron insumos con los filtros actuales.
                  </td>
                </tr>
              ) : (
                currentTableData.map(item => (
                  <tr key={item.product_id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3.5 font-bold text-slate-900">{item.name}</td>
                    <td className="p-3.5">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                        {item.category}
                      </span>
                    </td>
                    <td className="p-3.5 font-semibold text-slate-600">{item.providerName}</td>
                    <td className="p-3.5 text-center font-bold">
                      <span className="text-orange-600 font-black">{item.current_stock}</span> / {item.ideal_stock} {item.unit_measure}
                    </td>
                    <td className="p-3.5 text-right font-black text-slate-900">
                      ${Number(item.unit_price || 0).toFixed(2)}
                    </td>
                    <td className="p-3.5 text-center space-x-1.5">
                      <button 
                        type="button"
                        onClick={() => { setEditingProduct(item); window.scrollTo({ top: 150, behavior: 'smooth' }); }}
                        className="bg-amber-50 hover:bg-amber-100 text-amber-700 px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer"
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button 
                        type="button"
                        onClick={() => handleDeleteProduct(item.product_id)}
                        className="bg-red-50 hover:bg-red-100 text-red-600 px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer"
                        title="Eliminar"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* CONTROLES DE PAGINACIÓN */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex justify-between items-center bg-slate-50/50 text-xs">
            <span className="font-bold text-slate-500">
              Página {currentPage} de {totalPages} ({filteredProducts.length} productos)
            </span>
            <div className="flex gap-1.5">
              <button 
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 font-bold text-slate-700 disabled:opacity-40 hover:bg-slate-100 transition cursor-pointer"
              >
                Anterior
              </button>
              <button 
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 font-bold text-slate-700 disabled:opacity-40 hover:bg-slate-100 transition cursor-pointer"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}