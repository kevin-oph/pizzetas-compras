import { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

export default function AdminPanel() {
  const [providers, setProviders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados para nuevo producto
  const [newName, setNewName] = useState('');
  const [newProviderId, setNewProviderId] = useState('');
  const [newIdeal, setNewIdeal] = useState('');
  const [newUnit, setNewUnit] = useState('pzas');
  const [newPrice, setNewPrice] = useState('');

  // Estado para nuevo proveedor
  const [newProviderName, setNewProviderName] = useState('');

  // Estado para edición
  const [editingProduct, setEditingProduct] = useState(null);

  // Estados para Paginación y Filtros de la Tabla
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProviderFilter, setSelectedProviderFilter] = useState('ALL');
  const itemsPerPage = 10;

  const fetchData = async () => {
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
            ideal_stock: item.ideal_stock,
            unit_measure: item.unit || item.unit_measure,
            unit_price: item.unit_price || 0.0,
            providerName 
          });
        });
      });
      setProducts(allProducts);
      setLoading(false);
    } catch (err) {
      console.error("Error al cargar datos de administración:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/products', {
        name: newName,
        provider_id: parseInt(newProviderId),
        ideal_stock: parseFloat(newIdeal),
        current_stock: 0.0,
        unit_measure: newUnit,
        unit_price: parseFloat(newPrice)
      });
      Swal.fire({ icon: 'success', title: '¡Insumo Creado!', confirmButtonColor: '#ea580c' });
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

  // Filtrado y Paginación
  const filteredProducts = products.filter(p => {
    if (selectedProviderFilter === 'ALL') return true;
    return p.providerName === selectedProviderFilter;
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentTableData = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  if (loading) return <div className="p-8 text-center text-orange-500 font-bold">Cargando panel de control...</div>;

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-8 pb-24 font-sans text-slate-800">
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight">⚙️ Panel CRUD del Administrador</h2>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">Control absoluto de proveedores, métricas ideales y costos unitarios de operación.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Registrar Tienda */}
        <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-100 space-y-4">
          <h3 className="text-lg font-bold flex items-center gap-2">🏪 Registrar Nueva Tienda / Proveedor</h3>
          <form onSubmit={handleCreateProvider} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nombre del Proveedor</label>
              <input 
                type="text" 
                placeholder="Ej. Costco..." 
                value={newProviderName}
                onChange={(e) => setNewProviderName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                required
              />
            </div>
            <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-sm transition cursor-pointer">
              Agregar Proveedor
            </button>
          </form>
        </div>

        {/* Dar de Alta Insumo */}
        <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-100 space-y-4">
          <h3 className="text-lg font-bold flex items-center gap-2">📦 Dar de Alta Nuevo Insumo</h3>
          <form onSubmit={handleCreateProduct} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nombre del Producto</label>
              <input 
                type="text" 
                placeholder="Ej. Queso Mozzarella..." 
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tienda / Proveedor</label>
                <select 
                  value={newProviderId}
                  onChange={(e) => setNewProviderId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white outline-none"
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
                  placeholder="ej. bolsa, kg, pzas" 
                  value={newUnit}
                  onChange={(e) => setNewUnit(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Stock Ideal (Máx)</label>
                <input 
                  type="number" 
                  step="0.1"
                  placeholder="Ej. 10" 
                  value={newIdeal}
                  onChange={(e) => setNewIdeal(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Costo Unitario ($)</label>
                <input 
                  type="number" 
                  step="0.01"
                  placeholder="Ej. 150.00" 
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none"
                  required
                />
              </div>
            </div>
            <button type="submit" className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 text-white font-bold py-2.5 rounded-xl text-sm transition shadow-lg cursor-pointer">
              Guardar Nuevo Insumo
            </button>
          </form>
        </div>
      </div>

      {/* Sección de Edición con Etiquetas Claras */}
      {editingProduct && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-6 shadow-md space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-amber-900">✏️ Actualizando Insumo: <span className="underline">{editingProduct.name}</span></h3>
            <button type="button" onClick={() => setEditingProduct(null)} className="text-xs font-bold text-slate-500 hover:text-red-600 cursor-pointer">✕ Cancelar</button>
          </div>
          <form onSubmit={handleUpdateProduct} className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-amber-900 uppercase mb-1">Nombre</label>
              <input 
                type="text" 
                value={editingProduct.name}
                onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-sm font-semibold"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-extrabold text-amber-900 uppercase mb-1">Stock Ideal (Máx)</label>
              <input 
                type="number" 
                step="0.1"
                value={editingProduct.ideal_stock}
                onChange={(e) => setEditingProduct({...editingProduct, ideal_stock: e.target.value})}
                className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-sm font-semibold"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-extrabold text-amber-900 uppercase mb-1">Unidad</label>
              <input 
                type="text" 
                value={editingProduct.unit_measure}
                onChange={(e) => setEditingProduct({...editingProduct, unit_measure: e.target.value})}
                className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-sm font-semibold"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-extrabold text-amber-900 uppercase mb-1">Costo Unitario ($)</label>
              <input 
                type="number" 
                step="0.01"
                value={editingProduct.unit_price}
                onChange={(e) => setEditingProduct({...editingProduct, unit_price: e.target.value})}
                className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-sm font-semibold"
                required
              />
            </div>
            <div className="sm:col-span-4 flex justify-end">
              <button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition shadow cursor-pointer">
                Guardar Cambios del Producto
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabla General con Filtro y Paginación (10 filas) */}
      <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden space-y-4">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h3 className="text-lg font-bold">📋 Listado de Insumos Registrados ({filteredProducts.length})</h3>
          {/* Filtro por Proveedor */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-bold text-slate-500 uppercase">Filtrar Tienda:</span>
            <select 
              value={selectedProviderFilter}
              onChange={(e) => { setSelectedProviderFilter(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2 rounded-xl border border-slate-200 text-sm bg-slate-50 outline-none font-semibold text-slate-700"
            >
              <option value="ALL">Todas las Tiendas</option>
              {providers.map(p => (
                <option key={p.id} value={p.name}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase text-xs border-b border-slate-100">
                <th className="p-4">Producto</th>
                <th className="p-4">Tienda</th>
                <th className="p-4">Stock Ideal (Máx)</th>
                <th className="p-4">Unidad</th>
                <th className="p-4">Costo Unitario</th>
                <th className="p-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentTableData.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400 font-semibold">
                    No se encontraron insumos registrados.
                  </td>
                </tr>
              ) : (
                currentTableData.map((item) => (
                  <tr key={item.product_id} className="hover:bg-slate-50 transition">
                    <td className="p-4 font-bold text-slate-800">{item.name}</td>
                    <td className="p-4"><span className="bg-orange-50 text-orange-700 px-2.5 py-1 rounded-lg text-xs font-semibold">{item.providerName}</span></td>
                    <td className="p-4 font-semibold text-slate-600">{item.ideal_stock}</td>
                    <td className="p-4 text-slate-500">{item.unit_measure}</td>
                    <td className="p-4 font-black text-slate-700">${Number(item.unit_price || 0).toFixed(2)}</td>
                    <td className="p-4 text-center space-x-2">
                      <button 
                        type="button"
                        onClick={() => { setEditingProduct(item); window.scrollTo({ top: 200, behavior: 'smooth' }); }}
                        className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer"
                      >
                        ✏️ Editar
                      </button>
                      <button 
                        type="button"
                        onClick={() => handleDeleteProduct(item.product_id)}
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-600 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer"
                      >
                        🗑️ Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Controles de Paginación */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex justify-between items-center bg-slate-50/50">
            <span className="text-xs font-bold text-slate-500">
              Página {currentPage} de {totalPages} ({filteredProducts.length} insumos totales)
            </span>
            <div className="flex gap-2">
              <button 
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 disabled:opacity-40 hover:bg-slate-100 transition cursor-pointer"
              >
                Anterior
              </button>
              <button 
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 disabled:opacity-40 hover:bg-slate-100 transition cursor-pointer"
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