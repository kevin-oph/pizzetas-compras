import { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { 
  ShoppingCart, 
  Check, 
  Store, 
  DollarSign, 
  Receipt, 
  Search, 
  RefreshCw, 
  Edit3, 
  Sparkles 
} from 'lucide-react';

const CATEGORIES = [
  { name: 'ALL', label: 'Todas' },
  { name: 'Carnes', label: '🥩 Carnes' },
  { name: 'Quesos y Lácteos', label: '🧀 Lácteos' },
  { name: 'Vinos y Licores', label: '🍷 Licores' },
  { name: 'Abarrotes y Harinas', label: '🌾 Abarrotes' },
  { name: 'Desechables y Empaque', label: '📦 Empaque' },
  { name: 'Limpieza', label: '🧼 Limpieza' }
];

const formatMXN = (val) => {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(val || 0);
};

export default function ShoppingChecklist() {
  const [shoppingData, setShoppingData] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Estados de compra por producto: { [productId]: { checked: bool, quantity: number, unit_price_paid: number } }
  const [itemSelections, setItemSelections] = useState({});
  const [ticketNumber, setTicketNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchShoppingList = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/shopping-list');
      const data = res.data || {};
      setShoppingData(data);

      const providers = Object.keys(data);
      if (providers.length > 0 && (!selectedProvider || !data[selectedProvider])) {
        setSelectedProvider(providers[0]);
      }

      // Inicializar o sincronizar selecciones por defecto
      const initialSelections = {};
      Object.values(data).forEach(provData => {
        (provData.items || []).forEach(item => {
          initialSelections[item.product_id] = {
            checked: false,
            quantity: item.buy_amount,
            unit_price_paid: item.last_purchased_price || item.unit_price || 0.0
          };
        });
      });
      setItemSelections(prev => ({ ...initialSelections, ...prev }));
    } catch (err) {
      console.error("Error al cargar lista de compras:", err);
      Swal.fire('Error', 'No se pudo conectar con el servidor', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShoppingList();
  }, []);

  const handleToggleCheck = (productId, defaultQty, defaultPrice) => {
    setItemSelections(prev => {
      const current = prev[productId] || { checked: false, quantity: defaultQty, unit_price_paid: defaultPrice };
      return {
        ...prev,
        [productId]: {
          ...current,
          checked: !current.checked
        }
      };
    });
  };

  const handleQtyChange = (productId, value) => {
    const val = parseFloat(value);
    setItemSelections(prev => ({
      ...prev,
      [productId]: {
        ...(prev[productId] || {}),
        quantity: isNaN(val) ? 0 : Math.max(0, val)
      }
    }));
  };

  const handlePriceChange = (productId, value) => {
    const val = parseFloat(value);
    setItemSelections(prev => ({
      ...prev,
      [productId]: {
        ...(prev[productId] || {}),
        unit_price_paid: isNaN(val) ? 0 : Math.max(0, val)
      }
    }));
  };

  const currentProviderData = shoppingData[selectedProvider] || { items: [], estimated_provider_cost: 0, provider_id: 0 };
  const providerItems = currentProviderData.items || [];

  // Filtrado por categoría y búsqueda
  const filteredItems = providerItems.filter(item => {
    const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Cálculo del ticket en tiempo real de los seleccionados para el proveedor actual
  const checkedItemsForCurrentProvider = providerItems.filter(item => itemSelections[item.product_id]?.checked);
  
  const currentTicketTotal = checkedItemsForCurrentProvider.reduce((sum, item) => {
    const sel = itemSelections[item.product_id];
    const qty = sel?.quantity !== undefined ? sel.quantity : item.buy_amount;
    const price = sel?.unit_price_paid !== undefined ? sel.unit_price_paid : item.unit_price;
    return sum + (qty * price);
  }, 0);

  const handleSelectAllProvider = () => {
    const allChecked = filteredItems.every(item => itemSelections[item.product_id]?.checked);
    setItemSelections(prev => {
      const updated = { ...prev };
      filteredItems.forEach(item => {
        updated[item.product_id] = {
          checked: !allChecked,
          quantity: updated[item.product_id]?.quantity ?? item.buy_amount,
          unit_price_paid: updated[item.product_id]?.unit_price_paid ?? item.unit_price
        };
      });
      return updated;
    });
  };

  const handleRegisterPurchase = async () => {
    if (checkedItemsForCurrentProvider.length === 0) {
      Swal.fire('Atención', 'Marca al menos un producto adquirido para registrar la compra.', 'warning');
      return;
    }

    const confirmRes = await Swal.fire({
      title: `¿Confirmar Compra en ${selectedProvider}?`,
      html: `
        <div class="text-left text-sm space-y-2 mt-2">
          <p>Vas a registrar <b>${checkedItemsForCurrentProvider.length} productos</b>.</p>
          <p>Total real a pagar: <b class="text-emerald-600 text-lg">${formatMXN(currentTicketTotal)}</b></p>
          <p class="text-xs text-slate-500">Esto actualizará el almacén, el último precio de compra y guardará el ticket en el historial.</p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, Registrar Compra',
      cancelButtonText: 'Cancelar'
    });

    if (!confirmRes.isConfirmed) return;

    try {
      setSubmitting(true);
      const itemsPayload = checkedItemsForCurrentProvider.map(item => {
        const sel = itemSelections[item.product_id];
        return {
          product_id: item.product_id,
          quantity: sel.quantity,
          unit_price_paid: sel.unit_price_paid
        };
      });

      const res = await axios.post('/api/register-purchase', {
        provider_id: currentProviderData.provider_id,
        ticket_number: ticketNumber.trim() || undefined,
        notes: notes.trim() || undefined,
        items: itemsPayload
      });

      Swal.fire({
        icon: 'success',
        title: '¡Compra Guardada con Éxito!',
        text: `Ticket: ${res.data.ticket_number} por ${formatMXN(res.data.total_cost)}`,
        confirmButtonColor: '#ea580c'
      });

      // Limpiar ticket y refrescar datos
      setTicketNumber('');
      setNotes('');
      await fetchShoppingList();
    } catch (err) {
      console.error("Error al registrar compra:", err);
      Swal.fire('Error', 'No se pudo guardar la compra en el servidor', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const providersList = Object.keys(shoppingData);

  if (loading && providersList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-orange-500 gap-3">
        <RefreshCw className="animate-spin" size={36} />
        <p className="font-bold text-base">Sincronizando checklist con almacén...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-3 sm:p-6 space-y-5 pb-36 font-sans text-slate-800">
      
      {/* BANNER PRINCIPAL (MÓVIL FRIENDLY) */}
      <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-600 rounded-3xl p-5 sm:p-7 text-white shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-orange-200">
            <ShoppingCart size={15} />
            <span>Checklist & Captura de Tickets</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight mt-1">
            Lista de Compras Inteligente
          </h2>
          <p className="text-orange-100 text-xs sm:text-sm mt-0.5 max-w-md">
            Marca lo que compraste, edita el precio real pagado y registra el ticket exacto.
          </p>
        </div>

        <button
          onClick={fetchShoppingList}
          className="bg-white/20 hover:bg-white/30 text-white px-3.5 py-2 rounded-2xl text-xs font-bold backdrop-blur-md transition border border-white/30 flex items-center gap-2 cursor-pointer self-end sm:self-auto"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          <span>Actualizar</span>
        </button>
      </div>

      {providersList.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center shadow-sm border border-slate-100 space-y-3">
          <div className="text-5xl">🎉</div>
          <h3 className="text-xl font-black text-slate-800">¡Almacén Completamente Abastecido!</h3>
          <p className="text-slate-500 text-xs sm:text-sm max-w-sm mx-auto">
            No hay ningún insumo por debajo de su nivel ideal. Todo está al 100% para operar la cocina.
          </p>
        </div>
      ) : (
        <>
          {/* SELECTOR DE TIENDAS TÁCTIL (TABS DESPLAZABLES) */}
          <div className="space-y-2">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider block px-1">
              Selecciona la Tienda / Proveedor:
            </span>
            <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-none">
              {providersList.map(provName => {
                const count = shoppingData[provName]?.items?.length || 0;
                const isSelected = selectedProvider === provName;
                return (
                  <button
                    key={provName}
                    onClick={() => setSelectedProvider(provName)}
                    className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold whitespace-nowrap transition flex items-center gap-2 cursor-pointer border ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <Store size={15} className={isSelected ? "text-orange-400" : "text-slate-400"} />
                    <span>{provName}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                      isSelected ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* BUSCADOR Y FILTRO DE CATEGORÍAS GASTRONÓMICAS */}
          <div className="bg-white rounded-2xl p-3 shadow-sm border border-slate-100 space-y-3">
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder={`Buscar insumo en ${selectedProvider}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-orange-500 font-semibold"
              />
            </div>

            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.name}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                    selectedCategory === cat.name
                      ? 'bg-orange-50 text-orange-700 border border-orange-300 font-black'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-transparent'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* LISTA DE PRODUCTOS DE LA TIENDA SELECCIONADA */}
          <div className="space-y-3">
            <div className="flex justify-between items-center px-1">
              <span className="text-xs font-bold text-slate-500">
                Mostrando {filteredItems.length} insumos requeridos
              </span>
              <button
                type="button"
                onClick={handleSelectAllProvider}
                className="text-xs font-black text-orange-600 hover:text-orange-700 cursor-pointer"
              >
                {filteredItems.every(i => itemSelections[i.product_id]?.checked) ? 'Desmarcar todos' : 'Marcar todos'}
              </button>
            </div>

            {filteredItems.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center text-slate-400 font-bold text-xs sm:text-sm border border-slate-100">
                No hay productos pendientes que coincidan con el filtro en {selectedProvider}.
              </div>
            ) : (
              filteredItems.map(item => {
                const sel = itemSelections[item.product_id] || { 
                  checked: false, 
                  quantity: item.buy_amount, 
                  unit_price_paid: item.unit_price 
                };
                const isChecked = sel.checked;
                const subtotal = (sel.quantity || 0) * (sel.unit_price_paid || 0);

                return (
                  <div
                    key={item.product_id}
                    className={`rounded-2xl p-4 transition border shadow-sm ${
                      isChecked
                        ? 'bg-emerald-50/70 border-emerald-300'
                        : 'bg-white border-slate-200/80 hover:border-slate-300'
                    }`}
                  >
                    {/* ENCABEZADO DE LA TARJETA */}
                    <div className="flex items-start gap-3">
                      <button
                        type="button"
                        onClick={() => handleToggleCheck(item.product_id, item.buy_amount, item.unit_price)}
                        className={`w-7 h-7 rounded-xl flex items-center justify-center transition flex-shrink-0 mt-0.5 cursor-pointer border ${
                          isChecked
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow'
                            : 'bg-slate-100 text-transparent border-slate-300 hover:border-orange-500'
                        }`}
                      >
                        <Check size={16} strokeWidth={3} className={isChecked ? "block" : "hidden"} />
                      </button>

                      <div className="flex-1 min-w-0" onClick={() => handleToggleCheck(item.product_id, item.buy_amount, item.unit_price)}>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className={`font-bold text-sm sm:text-base cursor-pointer ${isChecked ? 'text-emerald-950 font-black' : 'text-slate-900'}`}>
                            {item.name}
                          </h4>
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                            {item.category}
                          </span>
                        </div>

                        <p className="text-xs text-slate-500 mt-1">
                          Stock: <span className="font-black text-amber-600">{item.current_stock}</span> / Ideal: <span className="font-bold">{item.ideal_stock} {item.unit}</span>
                          &nbsp;• Sugerido: <span className="text-orange-600 font-extrabold">{item.buy_amount} {item.unit}</span>
                        </p>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <span className="text-xs font-black text-slate-900 block">
                          {formatMXN(subtotal)}
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold">
                          Base: ${item.unit_price}/{item.unit}
                        </span>
                      </div>
                    </div>

                    {/* CAMPOS EDITABLES DE COMPRA REAL (CANTIDAD Y PRECIO UNITARIO REAL PAGADO) */}
                    <div className="mt-3 pt-3 border-t border-slate-200/60 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      <div>
                        <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-0.5">
                          Cantidad Real ({item.unit})
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          value={sel.quantity ?? item.buy_amount}
                          onChange={(e) => handleQtyChange(item.product_id, e.target.value)}
                          className={`w-full px-3 py-1.5 rounded-xl text-xs sm:text-sm font-black border outline-none ${
                            isChecked ? 'bg-white border-emerald-300 text-emerald-950' : 'bg-slate-50 border-slate-200'
                          }`}
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-0.5 flex items-center gap-1">
                          <Edit3 size={11} className="text-orange-500" />
                          <span>Precio Pagado ($)</span>
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          value={sel.unit_price_paid ?? item.unit_price}
                          onChange={(e) => handlePriceChange(item.product_id, e.target.value)}
                          className={`w-full px-3 py-1.5 rounded-xl text-xs sm:text-sm font-black border outline-none ${
                            isChecked ? 'bg-white border-emerald-300 text-emerald-950' : 'bg-slate-50 border-slate-200'
                          }`}
                        />
                      </div>

                      <div className="col-span-2 sm:col-span-1 flex flex-col justify-end">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase">Subtotal Insumo</span>
                        <span className="text-sm font-black text-slate-800">
                          {formatMXN(subtotal)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* BARRA FLOTANTE / INFERIOR PARA CONFIRMAR TICKET DE LA TIENDA (STICKY MOBILE) */}
          <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-700 p-4 shadow-2xl">
            <div className="max-w-4xl mx-auto space-y-3">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="p-2.5 bg-orange-600 text-white rounded-xl">
                    <Receipt size={22} />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase">
                      Ticket {selectedProvider} ({checkedItemsForCurrentProvider.length} productos)
                    </p>
                    <p className="text-xl sm:text-2xl font-black text-white">
                      {formatMXN(currentTicketTotal)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <input
                    type="text"
                    placeholder="No. Ticket / Factura (Opcional)"
                    value={ticketNumber}
                    onChange={(e) => setTicketNumber(e.target.value)}
                    className="flex-1 sm:w-48 px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none focus:ring-1 focus:ring-orange-500 font-medium"
                  />

                  <button
                    type="button"
                    disabled={checkedItemsForCurrentProvider.length === 0 || submitting}
                    onClick={handleRegisterPurchase}
                    className="flex-1 sm:flex-initial bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 text-white font-black px-6 py-2.5 rounded-xl text-xs sm:text-sm shadow-lg transition transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    <Check size={16} />
                    <span>{submitting ? 'Guardando...' : 'Registrar Compra'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

    </div>
  );
}