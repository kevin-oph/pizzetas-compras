import { useState, useEffect } from 'react';
import api from '../api/client';
import Swal from 'sweetalert2';
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  Edit3, 
  Search, 
  DollarSign, 
  Layers, 
  ChefHat, 
  ChevronDown, 
  ChevronUp, 
  Save, 
  RefreshCw 
} from 'lucide-react';

const formatMXN = (val) => {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(val || 0);
};

export default function RecipeManager() {
  const [menuItems, setMenuItems] = useState([]);
  const [catalogProducts, setCatalogProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  // Estado para modal / editor de receta
  const [editingItem, setEditingItem] = useState(null);
  const [tempRecipes, setTempRecipes] = useState([]);
  const [selectedNewProduct, setSelectedNewProduct] = useState('');
  const [selectedNewQty, setSelectedNewQty] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [menuRes, invRes] = await Promise.all([
        api.get('/api/menu-items'),
        api.get('/api/inventory-catalog')
      ]);
      setMenuItems(menuRes.data || []);

      // Aplanar catálogo de insumos
      const prods = [];
      Object.entries(invRes.data || {}).forEach(([_, items]) => {
        items.forEach(it => prods.push(it));
      });
      setCatalogProducts(prods);
    } catch (err) {
      console.error("Error al cargar recetas:", err);
      Swal.fire('Error', 'No se pudieron cargar las recetas del servidor', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setTempRecipes(item.recipes ? [...item.recipes] : []);
    setSelectedNewProduct('');
    setSelectedNewQty('');
  };

  const handleAddIngredient = () => {
    const pId = parseInt(selectedNewProduct);
    const qty = parseFloat(selectedNewQty);

    if (!pId || isNaN(qty) || qty <= 0) {
      Swal.fire('Atención', 'Selecciona un insumo y especifica una cantidad válida mayor a 0.', 'warning');
      return;
    }

    const prodObj = catalogProducts.find(p => p.product_id === pId);
    if (!prodObj) return;

    // Verificar si ya está en la receta
    const exists = tempRecipes.find(r => r.product_id === pId);
    if (exists) {
      setTempRecipes(prev => prev.map(r => r.product_id === pId ? { ...r, quantity_needed: qty, cost: qty * prodObj.unit_price } : r));
    } else {
      setTempRecipes(prev => [
        ...prev,
        {
          product_id: pId,
          product_name: prodObj.name,
          unit: prodObj.unit,
          unit_price: prodObj.unit_price,
          quantity_needed: qty,
          cost: qty * prodObj.unit_price
        }
      ]);
    }

    setSelectedNewProduct('');
    setSelectedNewQty('');
  };

  const handleRemoveIngredient = (productId) => {
    setTempRecipes(prev => prev.filter(r => r.product_id !== productId));
  };

  const handleSaveRecipe = async () => {
    if (!editingItem) return;

    try {
      await api.post('/api/menu-items', {
        pos_name: editingItem.pos_name,
        category: editingItem.category,
        sale_price: parseFloat(editingItem.sale_price) || 0.0,
        recipes: tempRecipes.map(r => ({
          product_id: r.product_id,
          quantity_needed: r.quantity_needed
        }))
      });

      Swal.fire({
        icon: 'success',
        title: '¡Receta Guardada!',
        text: `Se actualizó la receta de "${editingItem.pos_name}".`,
        confirmButtonColor: '#ea580c'
      });

      setEditingItem(null);
      fetchData();
    } catch (err) {
      console.error("Error al guardar receta:", err);
      Swal.fire('Error', 'No se pudo guardar la receta en el servidor', 'error');
    }
  };

  const filteredItems = menuItems.filter(item => 
    item.pos_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tempTotalCost = tempRecipes.reduce((sum, r) => sum + (r.cost || (r.quantity_needed * (r.unit_price || 0))), 0);
  const tempMargin = (editingItem?.sale_price || 0) - tempTotalCost;
  const tempFoodCostPct = editingItem?.sale_price > 0 ? (tempTotalCost / editingItem.sale_price * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 font-sans text-slate-800 pb-28">
      
      {/* HEADER */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-400 mb-1">
            <ChefHat size={16} />
            <span>Escandallos & Costeo de Recetas</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Catálogo de Recetas del Menú
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-xl">
            Vincula los platillos de tu punto de venta (POS) con los insumos del almacén para descontar stock exacto y conocer tu margen de ganancia real.
          </p>
        </div>

        <button
          onClick={fetchData}
          className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl border border-slate-700 transition cursor-pointer flex items-center gap-2 text-xs font-bold"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          <span>Actualizar</span>
        </button>
      </div>

      {/* BUSCADOR */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-3">
        <Search size={18} className="text-slate-400" />
        <input 
          type="text"
          placeholder="Buscar platillo o pizza (ej. Pepperoni, Pastor, Mojito, Boneless)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-xs sm:text-sm font-semibold outline-none text-slate-800"
        />
      </div>

      {/* EDITOR DE RECETA MODAL / INLINE */}
      {editingItem && (
        <div className="bg-amber-50 border border-amber-300 rounded-3xl p-6 shadow-xl space-y-6 animate-fadeIn">
          <div className="flex justify-between items-start border-b border-amber-200 pb-4">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 block">
                Editando Escandallo / Receta
              </span>
              <h3 className="text-xl font-black text-amber-950 mt-0.5">
                {editingItem.pos_name}
              </h3>
              <p className="text-xs text-amber-700 mt-0.5">Categoría: {editingItem.category}</p>
            </div>

            <button
              onClick={() => setEditingItem(null)}
              className="text-xs font-bold text-slate-500 hover:text-red-600 cursor-pointer p-1"
            >
              ✕ Cerrar
            </button>
          </div>

          {/* INDICADORES FINANCIEROS DEL PLATILLO */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="bg-white p-3 rounded-2xl border border-amber-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Precio Venta POS</span>
              <span className="text-base font-black text-slate-900">{formatMXN(editingItem.sale_price)}</span>
            </div>
            <div className="bg-white p-3 rounded-2xl border border-amber-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Costo Insumos</span>
              <span className="text-base font-black text-rose-600">{formatMXN(tempTotalCost)}</span>
            </div>
            <div className="bg-white p-3 rounded-2xl border border-amber-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Margen de Ganancia</span>
              <span className="text-base font-black text-emerald-600">{formatMXN(tempMargin)}</span>
            </div>
            <div className="bg-white p-3 rounded-2xl border border-amber-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">% Food Cost</span>
              <span className="text-base font-black text-blue-600">{tempFoodCostPct.toFixed(1)}%</span>
            </div>
          </div>

          {/* AGREGAR INGREDIENTE */}
          <div className="bg-white p-4 rounded-2xl border border-amber-200 space-y-3">
            <h4 className="text-xs font-black text-slate-700 uppercase">Agregar Insumo de Almacén a la Receta:</h4>
            <div className="flex flex-col sm:flex-row gap-2.5">
              <select
                value={selectedNewProduct}
                onChange={(e) => setSelectedNewProduct(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold outline-none bg-slate-50"
              >
                <option value="">Selecciona un insumo del almacén...</option>
                {catalogProducts.map(p => (
                  <option key={p.product_id} value={p.product_id}>
                    {p.name} ({p.unit}) - ${p.unit_price}/{p.unit}
                  </option>
                ))}
              </select>

              <input 
                type="number"
                step="0.001"
                min="0"
                placeholder="Porción (ej. 0.2)"
                value={selectedNewQty}
                onChange={(e) => setSelectedNewQty(e.target.value)}
                className="w-full sm:w-36 px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold outline-none bg-slate-50"
              />

              <button
                type="button"
                onClick={handleAddIngredient}
                className="bg-amber-600 hover:bg-amber-700 text-white font-black px-4 py-2 rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Plus size={15} />
                <span>Agregar</span>
              </button>
            </div>
          </div>

          {/* TABLA DE INGREDIENTES DE ESTA RECETA */}
          <div className="bg-white rounded-2xl border border-amber-200 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-amber-100/60 text-amber-900 uppercase font-black border-b border-amber-200">
                  <th className="p-3">Insumo Requerido</th>
                  <th className="p-3 text-center">Porción por Platillo</th>
                  <th className="p-3 text-right">Costo Unitario</th>
                  <th className="p-3 text-right">Costo en Platillo</th>
                  <th className="p-3 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tempRecipes.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-6 text-center text-slate-400 font-semibold">
                      Aún no hay ingredientes agregados a esta receta.
                    </td>
                  </tr>
                ) : (
                  tempRecipes.map(r => (
                    <tr key={r.product_id} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900">{r.product_name}</td>
                      <td className="p-3 text-center font-black text-slate-700">
                        {r.quantity_needed} {r.unit}
                      </td>
                      <td className="p-3 text-right font-semibold text-slate-500">
                        ${Number(r.unit_price || 0).toFixed(2)}
                      </td>
                      <td className="p-3 text-right font-black text-rose-600">
                        {formatMXN(r.quantity_needed * (r.unit_price || 0))}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveIngredient(r.product_id)}
                          className="text-red-500 hover:text-red-700 font-bold text-xs p-1"
                          title="Quitar ingrediente"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setEditingItem(null)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSaveRecipe}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-6 py-2.5 rounded-xl text-xs sm:text-sm shadow-md transition cursor-pointer flex items-center gap-1.5"
            >
              <Save size={16} />
              <span>Guardar Receta</span>
            </button>
          </div>
        </div>
      )}

      {/* LISTADO DE PLATILLOS DEL MENÚ */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden space-y-4">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="font-black text-base sm:text-lg text-slate-900">
              Platillos Registrados en el POS ({filteredItems.length})
            </h3>
            <p className="text-xs text-slate-400">Escandallos y porcentaje de costo de alimentos (% Food Cost)</p>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredItems.map(item => {
            const isExpanded = expandedId === item.id;
            const hasRecipes = item.recipes_count > 0;
            return (
              <div key={item.id} className="p-4 hover:bg-slate-50/70 transition">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setExpandedId(prev => prev === item.id ? null : item.id)}
                      className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200"
                    >
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm sm:text-base">
                          {item.pos_name}
                        </span>
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {hasRecipes ? `${item.recipes_count} insumos vinculados` : '⚠️ Sin receta (no descuenta insumos)'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-5">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Venta</span>
                      <span className="text-sm font-black text-slate-900">{formatMXN(item.sale_price)}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Costo Insumos</span>
                      <span className="text-sm font-black text-rose-600">{formatMXN(item.recipe_cost)}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">% Food Cost</span>
                      <span className={`text-xs font-black px-2 py-0.5 rounded-md ${
                        item.food_cost_percentage <= 30 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {item.food_cost_percentage}%
                      </span>
                    </div>

                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1"
                    >
                      <Edit3 size={14} />
                      <span className="hidden sm:inline">Editar</span>
                    </button>
                  </div>
                </div>

                {/* DETALLE EXPANDIBLE DE INGREDIENTES */}
                {isExpanded && (
                  <div className="mt-3 pl-8 pr-2 pt-3 border-t border-slate-100 space-y-2">
                    <h5 className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
                      Ingredientes que componen este platillo:
                    </h5>
                    {item.recipes?.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No hay ingredientes registrados aún.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {item.recipes.map((r, i) => (
                          <div key={i} className="p-2 rounded-xl bg-slate-100/70 text-xs flex justify-between">
                            <span className="font-bold text-slate-700">{r.product_name}:</span>
                            <span className="font-black text-slate-900">{r.quantity_needed} {r.unit} ({formatMXN(r.cost)})</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
