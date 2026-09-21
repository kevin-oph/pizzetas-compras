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
            unit_measure: item.unit_measure || item.unit,
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
      Swal.fire({ icon: 'success', title: '¡Producto Creado!', confirmButtonColor: '#ea580c' });
      setNewName('');
      setNewIdeal('');
      setNewPrice('');
      fetchData();
    } catch {
      Swal.fire('Error', 'No se pudo crear el producto', 'error');
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
      text: "Esta acción dará de baja el producto permanentemente.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`/api/products/${id}`);
        Swal.fire('¡Eliminado!', 'El producto ha sido dado de baja.', 'success');
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

  if (loading) return <div className="p-8 text-center text-orange-500 font-bold">Cargando panel de control...</div>;

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-8 pb-24 font-sans text-slate-800">
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight">⚙️ Panel CRUD del Administrador</h2>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">Registra tiendas, da de alta nuevos insumos o modifica sus métricas y costos en tiempo real.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Registrar Tienda */}
        <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-100 space-y-4">
          <h3 className="text-lg font-bold flex items-center gap-2">🏪 Registrar Nueva Tienda / Proveedor</h3>
          <form onSubmit={handleCreateProvider} className="space-y-3">
            <input 
              type="text" 
              placeholder="Ej. Costco..." 
              value={newProviderName}
              onChange={(e) => setNewProviderName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
              required
            />
            <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-sm transition cursor-pointer">
              Agregar Proveedor
            </button>
          </form>
        </div>

        {/* Dar de Alta Insumo */}
        <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-100 space-y-4">
          <h3 className="text-lg font-bold flex items-center gap-2">📦 Dar de Alta Nuevo Insumo</h3>
          <form onSubmit={handleCreateProduct} className="space-y-3">
            <input 
              type="text" 
              placeholder="Nombre del producto..." 
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
              required
            />
            <div className="grid grid-cols-2 gap-3">
              <select 
                value={newProviderId}
                onChange={(e) => setNewProviderId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white outline-none"
                required
              >
                <option value="">Selecciona Tienda...</option>
                {providers.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <input 
                type="text" 
                placeholder="Unidad (ej. bulto, kg)" 
                value={newUnit}
                onChange={(e) => setNewUnit(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input 
                type="number" 
                step="0.1"
                placeholder="Stock Ideal / Máx" 
                value={newIdeal}
                onChange={(e) => setNewIdeal(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none"
                required
              />
              <input 
                type="number" 
                step="0.01"
                placeholder="Costo Unitario ($)" 
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none"
                required
              />
            </div>
            <button type="submit" className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 text-white font-bold py-2.5 rounded-xl text-sm transition shadow-lg cursor-pointer">
              Guardar Nuevo Insumo
            </button>
          </form>
        </div>
      </div>

      {/* Sección de Edición */}
      {editingProduct && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 shadow-md space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-amber-900">✏️ Actualizar Producto y Costos: {editingProduct.name}</h3>
            <button type="button" onClick={() => setEditingProduct(null)} className="text-xs font-bold text-slate-500 hover:text-red-600 cursor-pointer">✕ Cancelar</button>
          </div>
          <form onSubmit={handleUpdateProduct} className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            <input 
              type="text" 
              placeholder="Nombre"
              value={editingProduct.name}
              onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
              className="px-3 py-2 bg-white rounded-xl border border-slate-200 text-sm"
              required
            />
            <input 
              type="number" 
              step="0.1"
              placeholder="Stock Ideal"
              value={editingProduct.ideal_stock}
              onChange={(e) => setEditingProduct({...editingProduct, ideal_stock: e.target.value})}
              className="px-3 py-2 bg-white rounded-xl border border-slate-200 text-sm"
              required
            />
            <input 
              type="text" 
              placeholder="Unidad"
              value={editingProduct.unit_measure}
              onChange={(e) => setEditingProduct({...editingProduct, unit_measure: e.target.value})}
              className="px-3 py-2 bg-white rounded-xl border border-slate-200 text-sm"
              required
            />
            <input 
              type="number" 
              step="0.01"
              placeholder="Costo Unitario ($)"
              value={editingProduct.unit_price}
              onChange={(e) => setEditingProduct({...editingProduct, unit_price: e.target.value})}
              className="px-3 py-2 bg-white rounded-xl border border-slate-200 text-sm"
              required
            />
            <button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 rounded-xl text-sm transition cursor-pointer">
              Guardar Cambios
            </button>
          </form>
        </div>
      )}

      {/* Tabla General */}
      <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-lg font-bold">📋 Listado de Insumos Registrados ({products.length})</h3>
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
              {products.map((item) => (
                <tr key={item.product_id} className="hover:bg-slate-50 transition">
                  <td className="p-4 font-bold text-slate-800">{item.name}</td>
                  <td className="p-4"><span className="bg-orange-50 text-orange-700 px-2.5 py-1 rounded-lg text-xs font-semibold">{item.providerName}</span></td>
                  <td className="p-4 font-semibold text-slate-600">{item.ideal_stock}</td>
                  <td className="p-4 text-slate-500">{item.unit_measure}</td>
                  <td className="p-4 font-black text-slate-700">${Number(item.unit_price || 0).toFixed(2)}</td>
                  <td className="p-4 text-center space-x-2">
                    <button 
                      type="button"
                      onClick={() => setEditingProduct(item)}
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}