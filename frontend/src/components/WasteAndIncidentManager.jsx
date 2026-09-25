import { useState, useEffect } from 'react';
import api from '../api/client';
import Swal from 'sweetalert2';
import { 
  Trash2, 
  Sparkles, 
  UtensilsCrossed, 
  AlertOctagon, 
  Search, 
  Plus, 
  RotateCcw, 
  Clock, 
  DollarSign, 
  CheckCircle2, 
  Tag, 
  ShieldAlert,
  Flame,
  PackageCheck
} from 'lucide-react';

const formatMXN = (val) => {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(val || 0);
};

const REASON_PRESETS = {
  MERMA: [
    'Se quemó en horno',
    'Se cayó al piso',
    'Ingrediente caducado / descompuesto',
    'Error en preparación / comanda',
    'Masa sobrefermentada'
  ],
  LIMPIEZA: [
    'Apertura de turno / Insumo nuevo',
    'Limpieza profunda de cierre',
    'Relleno de servilleteros',
    'Limpieza de campana y grasa',
    'Cambio de bolsas de basura'
  ],
  COMIDA_PERSONAL: [
    'Comida colaboradores turno',
    'Degustación / Prueba de sabor',
    'Cortesía a cliente'
  ],
  OTRO: [
    'Ajuste operativo',
    'Muestra / Donación'
  ]
};

export default function WasteAndIncidentManager({ user }) {
  const [products, setProducts] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [selectedReasonType, setSelectedReasonType] = useState('MERMA');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('TODOS');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [invRes, logsRes] = await Promise.all([
        api.get('/api/inventory-catalog'),
        api.get('/api/consumptions?limit=40')
      ]);

      // Aplanar lista de productos de todas las tiendas
      const allProds = [];
      Object.keys(invRes.data).forEach(store => {
        invRes.data[store].forEach(p => {
          allProds.push({ ...p, storeName: store });
        });
      });
      // Ordenar por nombre
      allProds.sort((a, b) => a.name.localeCompare(b.name));
      setProducts(allProds);

      // Filtrar bitácora para mostrar salidas operativas y mermas (excluir o destacar los que son venta pos)
      setLogs(logsRes.data || []);
    } catch (err) {
      console.error("Error al cargar datos:", err);
      Swal.fire('Error', 'No se pudieron cargar los datos de insumos.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'TODOS' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleSelectProduct = (prod) => {
    setSelectedProduct(prod);
    setQuantity(1);
  };

  const handleQuickAddQty = (val) => {
    setQuantity(prev => Math.max(0.1, Number((prev + val).toFixed(2))));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProduct) {
      Swal.fire('Atención', 'Selecciona el insumo de la lista primero.', 'warning');
      return;
    }
    if (quantity <= 0) {
      Swal.fire('Atención', 'Ingresa una cantidad mayor a 0.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        product_id: selectedProduct.product_id,
        consumed_amount: Number(quantity),
        reason_type: selectedReasonType,
        shift_notes: notes.trim() || `Salida por ${selectedReasonType}`,
        user_id: user?.id || null
      };

      const res = await api.post('/api/consume-stock', payload);

      Swal.fire({
        icon: 'success',
        title: '¡Salida Registrada!',
        text: `Se descontaron ${quantity} ${selectedProduct.unit} de '${selectedProduct.name}'. Costo: ${formatMXN(res.data.cost_total)}`,
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });

      // Reset form
      setSelectedProduct(null);
      setSearchTerm('');
      setNotes('');
      setQuantity(1);

      // Recargar datos
      await fetchData();
    } catch (err) {
      console.error("Error al registrar salida:", err);
      Swal.fire('Error', 'No se pudo registrar la salida del insumo.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteLog = async (logId, prodName, qty, unit) => {
    const confirm = await Swal.fire({
      title: '¿Revertir este registro?',
      text: `Se cancelará la merma y se devolverán ${qty} ${unit} de '${prodName}' al inventario.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, Revertir Stock',
      cancelButtonText: 'Cancelar'
    });

    if (!confirm.isConfirmed) return;

    try {
      await api.delete(`/api/consumptions/${logId}`);
      Swal.fire({
        icon: 'success',
        title: 'Revertido',
        text: 'El stock fue reintegrado al almacén con éxito.',
        timer: 1500,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });
      fetchData();
    } catch (err) {
      console.error("Error al revertir registro:", err);
      Swal.fire('Error', 'No se pudo revertir el registro.', 'error');
    }
  };

  const totalCost = selectedProduct ? (quantity * (selectedProduct.unit_price || 0)) : 0;

  // Categorías únicas
  const categories = ['TODOS', ...new Set(products.map(p => p.category))];

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in max-w-6xl mx-auto">
      {/* HEADER EXPLICATIVO */}
      <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-amber-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/30 mb-2">
            <Flame size={14} className="text-rose-400" />
            <span>Mermas, Desperdicios y Salidas Operativas</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Control de Mermas e Insumos de Cocina
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
            Los consumos normales por platillos vendidos se descuentan automáticamente con el <b>Excel del POS</b>. Usa este módulo únicamente para reportar mermas (platos quemados/accidentes) o insumos de empaque y limpieza (bolsas, cloro, servilletas).
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* FORMULARIO DE CAPTURA RÁPIDA (COLUMNA IZQUIERDA / 7 COLS) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 space-y-6">
          <h3 className="font-extrabold text-slate-800 text-base sm:text-lg flex items-center gap-2">
            <Plus className="text-rose-600" size={20} />
            <span>1. Selecciona el Tipo de Salida</span>
          </h3>

          {/* SELECTOR DE TIPO (PILLS) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => { setSelectedReasonType('MERMA'); setNotes(''); }}
              className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 border transition cursor-pointer ${
                selectedReasonType === 'MERMA'
                  ? 'bg-rose-50 border-rose-400 text-rose-700 font-extrabold ring-2 ring-rose-400/20 shadow-sm'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 font-medium'
              }`}
            >
              <Trash2 size={20} className={selectedReasonType === 'MERMA' ? 'text-rose-600' : 'text-slate-400'} />
              <span className="text-xs">Merma / Desperdicio</span>
            </button>

            <button
              type="button"
              onClick={() => { setSelectedReasonType('LIMPIEZA'); setNotes(''); }}
              className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 border transition cursor-pointer ${
                selectedReasonType === 'LIMPIEZA'
                  ? 'bg-sky-50 border-sky-400 text-sky-700 font-extrabold ring-2 ring-sky-400/20 shadow-sm'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 font-medium'
              }`}
            >
              <Sparkles size={20} className={selectedReasonType === 'LIMPIEZA' ? 'text-sky-600' : 'text-slate-400'} />
              <span className="text-xs">Limpieza / Empaque</span>
            </button>

            <button
              type="button"
              onClick={() => { setSelectedReasonType('COMIDA_PERSONAL'); setNotes(''); }}
              className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 border transition cursor-pointer ${
                selectedReasonType === 'COMIDA_PERSONAL'
                  ? 'bg-emerald-50 border-emerald-400 text-emerald-700 font-extrabold ring-2 ring-emerald-400/20 shadow-sm'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 font-medium'
              }`}
            >
              <UtensilsCrossed size={20} className={selectedReasonType === 'COMIDA_PERSONAL' ? 'text-emerald-600' : 'text-slate-400'} />
              <span className="text-xs">Comida Personal</span>
            </button>

            <button
              type="button"
              onClick={() => { setSelectedReasonType('OTRO'); setNotes(''); }}
              className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 border transition cursor-pointer ${
                selectedReasonType === 'OTRO'
                  ? 'bg-purple-50 border-purple-400 text-purple-700 font-extrabold ring-2 ring-purple-400/20 shadow-sm'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 font-medium'
              }`}
            >
              <Tag size={20} className={selectedReasonType === 'OTRO' ? 'text-purple-600' : 'text-slate-400'} />
              <span className="text-xs">Otro Ajuste</span>
            </button>
          </div>

          {/* BUSCADOR DE INSUMO */}
          <div className="space-y-3">
            <h3 className="font-extrabold text-slate-800 text-sm flex items-center justify-between">
              <span>2. Busca y Elige el Insumo del Almacén</span>
              {selectedProduct && (
                <span className="text-xs text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-200">
                  Seleccionado: {selectedProduct.name}
                </span>
              )}
            </h3>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar insumo (ej. Harina, Queso, Boneless, Cloro, Bolsa...)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white text-slate-700 outline-none focus:ring-2 focus:ring-rose-500"
              >
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* LISTA RÁPIDA DE INSUMOS FILTRADOS */}
            <div className="max-h-48 overflow-y-auto space-y-1.5 p-1 bg-slate-50 rounded-2xl border border-slate-100">
              {filteredProducts.length === 0 ? (
                <p className="text-xs text-slate-400 p-4 text-center">No se encontraron insumos con ese nombre.</p>
              ) : (
                filteredProducts.slice(0, 20).map(p => {
                  const isSelected = selectedProduct?.product_id === p.product_id;
                  return (
                    <div
                      key={p.product_id}
                      onClick={() => handleSelectProduct(p)}
                      className={`p-2.5 rounded-xl flex items-center justify-between text-xs cursor-pointer transition ${
                        isSelected
                          ? 'bg-rose-600 text-white font-bold shadow-md'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{p.name}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-md ${
                          isSelected ? 'bg-rose-700 text-rose-100' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {p.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={isSelected ? 'text-rose-100' : 'text-slate-400'}>
                          Stock: <b>{p.current_stock} {p.unit}</b>
                        </span>
                        <span className="font-mono font-bold">
                          ${p.unit_price}/unit
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* CAPTURA DE CANTIDAD Y MOTIVO */}
          {selectedProduct && (
            <div className="bg-rose-50/50 border border-rose-100 p-5 rounded-2xl space-y-4 animate-fade-in">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-rose-100 pb-3">
                <div>
                  <p className="text-xs text-rose-600 font-extrabold uppercase tracking-wider">Insumo seleccionado</p>
                  <p className="font-black text-slate-900 text-base">{selectedProduct.name}</p>
                  <p className="text-xs text-slate-500">
                    Stock actual: <b>{selectedProduct.current_stock} {selectedProduct.unit}</b> en {selectedProduct.storeName}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">Impacto económico</p>
                  <p className="text-lg font-black text-rose-600 font-mono">
                    {formatMXN(totalCost)}
                  </p>
                </div>
              </div>

              {/* CANTIDAD */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Cantidad a dar de baja ({selectedProduct.unit}):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-32 p-3 text-center font-bold text-base bg-white rounded-xl border border-rose-200 outline-none focus:ring-2 focus:ring-rose-500"
                  />
                  <div className="flex flex-wrap gap-1">
                    <button
                      type="button"
                      onClick={() => handleQuickAddQty(0.5)}
                      className="px-2.5 py-1.5 bg-white text-slate-700 hover:bg-rose-100 rounded-lg text-xs font-bold border border-slate-200"
                    >
                      +0.5
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickAddQty(1)}
                      className="px-2.5 py-1.5 bg-white text-slate-700 hover:bg-rose-100 rounded-lg text-xs font-bold border border-slate-200"
                    >
                      +1
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickAddQty(2)}
                      className="px-2.5 py-1.5 bg-white text-slate-700 hover:bg-rose-100 rounded-lg text-xs font-bold border border-slate-200"
                    >
                      +2
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickAddQty(5)}
                      className="px-2.5 py-1.5 bg-white text-slate-700 hover:bg-rose-100 rounded-lg text-xs font-bold border border-slate-200"
                    >
                      +5
                    </button>
                  </div>
                </div>
              </div>

              {/* MOTIVO / CHIPS */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Motivo o justificación:
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {REASON_PRESETS[selectedReasonType]?.map(preset => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setNotes(preset)}
                      className="text-[11px] px-2.5 py-1 bg-white hover:bg-rose-100 text-slate-600 rounded-lg border border-slate-200 transition"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Escribe un detalle adicional si lo deseas..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-rose-200 bg-white text-xs outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              {/* BOTON SUBMIT */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full py-3.5 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-700 text-white font-black text-sm rounded-2xl shadow-lg transition transform active:scale-95 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <PackageCheck size={18} />
                <span>{submitting ? 'Registrando en Almacén...' : `Confirmar Salida de ${quantity} ${selectedProduct.unit}`}</span>
              </button>
            </div>
          )}
        </div>

        {/* BITÁCORA DE SALIDAS Y MERMAS RECIENTES (COLUMNA DERECHA / 5 COLS) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 space-y-4 flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                <Clock className="text-slate-600" size={18} />
                <span>Salidas Registradas Recientemente</span>
              </h3>
              <p className="text-slate-400 text-xs mt-0.5">Últimos movimientos del almacén</p>
            </div>
            <button
              onClick={fetchData}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition"
              title="Recargar bitácora"
            >
              <RotateCcw size={16} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[500px] space-y-3 pr-1">
            {logs.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-12">No hay salidas registradas aún.</p>
            ) : (
              logs.map(log => {
                const isPOS = log.reason_type === 'VENTA_POS';
                const isMerma = log.reason_type === 'MERMA';
                const isClean = log.reason_type === 'LIMPIEZA';
                const isStaff = log.reason_type === 'COMIDA_PERSONAL';

                let badgeClass = 'bg-slate-100 text-slate-600 border-slate-200';
                let badgeText = log.reason_type || 'SALIDA';

                if (isPOS) {
                  badgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                  badgeText = 'VENTA POS';
                } else if (isMerma) {
                  badgeClass = 'bg-rose-50 text-rose-700 border-rose-200';
                  badgeText = 'MERMA';
                } else if (isClean) {
                  badgeClass = 'bg-sky-50 text-sky-700 border-sky-200';
                  badgeText = 'LIMPIEZA';
                } else if (isStaff) {
                  badgeClass = 'bg-amber-50 text-amber-700 border-amber-200';
                  badgeText = 'PERSONAL';
                }

                return (
                  <div
                    key={log.id}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 hover:border-slate-200 transition"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${badgeClass}`}>
                            {badgeText}
                          </span>
                          <span className="font-extrabold text-slate-800 text-xs">
                            {log.product_name}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                          {log.shift_notes || 'Sin nota'}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="font-mono font-black text-xs text-slate-700">
                          -{log.quantity} {log.unit}
                        </span>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {formatMXN(log.total_cost)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/50 text-[10px] text-slate-400">
                      <span>{log.timestamp}</span>
                      {!isPOS && (
                        <button
                          onClick={() => handleDeleteLog(log.id, log.product_name, log.quantity, log.unit)}
                          className="text-rose-500 hover:text-rose-700 font-bold hover:underline cursor-pointer flex items-center gap-1"
                        >
                          <RotateCcw size={11} />
                          <span>Deshacer</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
