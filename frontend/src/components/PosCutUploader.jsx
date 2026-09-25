import { useState } from 'react';
import api from '../api/client';
import Swal from 'sweetalert2';
import { 
  Upload, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertTriangle, 
  DollarSign, 
  TrendingUp, 
  PieChart, 
  CreditCard, 
  Coins, 
  Layers, 
  ArrowRight,
  ClipboardPaste,
  Sparkles,
  RefreshCw
} from 'lucide-react';

const formatMXN = (val) => {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(val || 0);
};

export default function PosCutUploader() {
  const [activeInputMode, setActiveInputMode] = useState('paste'); // 'paste' | 'file'
  const [rawText, setRawText] = useState('');
  const [file, setFile] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  const handleParse = async () => {
    setParsing(true);
    try {
      let res;
      if (activeInputMode === 'paste') {
        if (!rawText.trim()) {
          Swal.fire('Atención', 'Pega el texto del corte de caja primero.', 'warning');
          setParsing(false);
          return;
        }
        res = await api.post('/api/sales-cut/parse-text', { text: rawText });
      } else {
        if (!file) {
          Swal.fire('Atención', 'Selecciona un archivo Excel (.xlsx, .xls) o CSV.', 'warning');
          setParsing(false);
          return;
        }
        const formData = new FormData();
        formData.append('file', file);
        res = await api.post('/api/sales-cut/upload-file', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      setPreviewData(res.data);
      Swal.fire({
        icon: 'success',
        title: '¡Corte Analizado!',
        text: `Ventas detectadas: ${formatMXN(res.data.summary.total_sales)} (${res.data.summary.total_items_sold} productos)`,
        timer: 1500,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });
    } catch (err) {
      console.error("Error al procesar corte:", err);
      Swal.fire('Error', 'No se pudo parsear el corte. Verifica el formato del archivo o texto.', 'error');
    } finally {
      setParsing(false);
    }
  };

  const handleConfirmCut = async () => {
    if (!previewData) return;

    const sum = previewData.summary;
    const confirmRes = await Swal.fire({
      title: '¿Aplicar Corte y Descontar Almacén?',
      html: `
        <div class="text-left text-sm space-y-2">
          <p>Fecha de corte: <b>${sum.date_str}</b></p>
          <p>Ventas Totales: <b class="text-emerald-600 text-lg">${formatMXN(sum.total_sales)}</b></p>
          <p>Costo de Insumos: <b class="text-rose-600">${formatMXN(sum.total_cogs)}</b> (${sum.food_cost_percentage}% Food Cost)</p>
          <p>Se descontarán <b>${previewData.ingredients_to_deduct.length} insumos</b> del inventario.</p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, Descontar y Guardar',
      cancelButtonText: 'Cancelar'
    });

    if (!confirmRes.isConfirmed) return;

    setConfirming(true);
    try {
      const payload = {
        cut_date_str: sum.date_str,
        total_sales: sum.total_sales,
        cash_sales: sum.cash_sales,
        card_sales: sum.card_sales,
        transfer_sales: sum.transfer_sales,
        tips_cash: sum.tips_cash,
        tips_card: sum.tips_card,
        tips_total: sum.tips_total,
        cash_balance: sum.cash_balance,
        total_items_sold: sum.total_items_sold,
        total_cogs: sum.total_cogs,
        gross_profit: sum.gross_profit,
        food_cost_percentage: sum.food_cost_percentage,
        sold_items: previewData.sold_items.map(it => ({
          name: it.name,
          quantity: it.quantity,
          total_amount: it.total_amount,
          unit_price: it.unit_price,
          cogs_cost: it.cogs_cost
        })),
        ingredients_to_deduct: previewData.ingredients_to_deduct.map(ing => ({
          product_id: ing.product_id,
          quantity_to_deduct: ing.quantity_to_deduct,
          cost: ing.total_cost
        }))
      };

      const res = await api.post('/api/sales-cut/confirm', payload);
      Swal.fire({
        icon: 'success',
        title: '¡Corte Aplicado al 100%!',
        html: `
          <div class="text-left text-sm space-y-1">
            <p>Se descontaron los insumos del almacén correctamente.</p>
            <p class="text-emerald-700 font-bold">Ganancia Bruta: ${formatMXN(res.data.gross_profit)}</p>
            <p class="text-slate-500 font-semibold">% Food Cost: ${res.data.food_cost_percentage}%</p>
          </div>
        `,
        confirmButtonColor: '#ea580c'
      });

      // Limpiar datos
      setPreviewData(null);
      setRawText('');
      setFile(null);
    } catch (err) {
      console.error("Error al confirmar corte:", err);
      Swal.fire('Error', 'No se pudo guardar el corte en el servidor.', 'error');
    } finally {
      setConfirming(false);
    }
  };

  const summary = previewData?.summary;
  const ingredients = previewData?.ingredients_to_deduct || [];
  const soldItems = previewData?.sold_items || [];

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 font-sans text-slate-800">
      
      {/* HEADER */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-400 mb-1">
            <FileSpreadsheet size={16} />
            <span>Integración POS & Punto de Venta</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Corte Diario de Caja y Ventas
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-xl">
            Importa el archivo Excel o pega el reporte de corte de tu punto de venta para descontar los insumos del almacén de forma automática según tus recetas.
          </p>
        </div>
      </div>

      {/* SECCIÓN DE ENTRADA (PEGA TEXTO O SUBE ARCHIVO) */}
      {!previewData && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <button
              onClick={() => setActiveInputMode('paste')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer ${
                activeInputMode === 'paste'
                  ? 'bg-orange-600 text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              <ClipboardPaste size={16} />
              <span>Pegar Reporte del Excel</span>
            </button>

            <button
              onClick={() => setActiveInputMode('file')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer ${
                activeInputMode === 'file'
                  ? 'bg-orange-600 text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              <Upload size={16} />
              <span>Subir Archivo (.xlsx / .xls / .csv)</span>
            </button>
          </div>

          {activeInputMode === 'paste' ? (
            <div className="space-y-3">
              <label className="block text-xs font-extrabold text-slate-500 uppercase">
                Copia y pega aquí todo el contenido del corte exportado:
              </label>
              <textarea
                rows={10}
                placeholder="Pega aquí las filas de tu Excel (Precorte de : CORTE GENERAL, Efectivo, Tarjeta, Producto, Cantidad, Total...)"
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-mono outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          ) : (
            <div className="border-2 border-dashed border-slate-200 rounded-3xl p-8 text-center space-y-4 hover:border-orange-500 transition">
              <div className="w-16 h-16 mx-auto bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center">
                <FileSpreadsheet size={32} />
              </div>
              <div>
                <p className="font-bold text-slate-800 text-sm sm:text-base">
                  {file ? file.name : 'Arrastra o selecciona el archivo del corte diario'}
                </p>
                <p className="text-xs text-slate-400 mt-1">Formatos soportados: Excel (.xlsx, .xls) y CSV (.csv)</p>
              </div>
              <input
                type="file"
                accept=".xlsx,.xls,.csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
                onChange={(e) => setFile(e.target.files[0])}
                className="block mx-auto text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-900 file:text-white hover:file:bg-slate-800 cursor-pointer"
              />
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              onClick={handleParse}
              disabled={parsing}
              className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 text-white font-black px-8 py-3 rounded-2xl text-xs sm:text-sm shadow-lg transition transform active:scale-95 cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              {parsing ? <RefreshCw className="animate-spin" size={16} /> : <Sparkles size={16} />}
              <span>{parsing ? 'Analizando Corte...' : 'Analizar Corte y Calcular Insumos'}</span>
            </button>
          </div>
        </div>
      )}

      {/* VISTA PREVIA DEL CORTE ANALIZADO */}
      {previewData && (
        <div className="space-y-6">
          
          {/* BARRA SUPERIOR DE ACCIÓN */}
          <div className="bg-emerald-50 border border-emerald-300 rounded-3xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="text-xs font-black text-emerald-800 uppercase tracking-wider block">
                Corte Analizado con Éxito
              </span>
              <h3 className="text-xl font-black text-emerald-950 mt-0.5">
                Fecha del Corte: {summary.date_str}
              </h3>
              <p className="text-xs text-emerald-700 font-semibold mt-0.5">
                {summary.total_items_sold} productos vendidos en total • {ingredients.length} insumos de almacén calculados para descuento
              </p>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <button
                onClick={() => setPreviewData(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 text-xs font-bold transition cursor-pointer"
              >
                Volver a Subir
              </button>

              <button
                onClick={handleConfirmCut}
                disabled={confirming}
                className="flex-1 md:flex-initial bg-emerald-600 hover:bg-emerald-700 text-white font-black px-6 py-2.5 rounded-xl text-xs sm:text-sm shadow-md transition transform active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={18} />
                <span>{confirming ? 'Descontando...' : 'Confirmar y Descontar Almacén'}</span>
              </button>
            </div>
          </div>

          {/* TARJETAS DE KPIS FINANCIEROS DEL CORTE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Ventas Totales */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              <span className="text-xs font-extrabold text-slate-400 uppercase">Ventas Totales</span>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
                {formatMXN(summary.total_sales)}
              </p>
              <span className="text-[11px] text-emerald-600 font-bold block mt-1">100% Facturación POS</span>
            </div>

            {/* Costo de Materia Prima (COGS) */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              <span className="text-xs font-extrabold text-slate-400 uppercase">Costo Insumos (COGS)</span>
              <p className="text-2xl sm:text-3xl font-black text-rose-600 mt-2">
                {formatMXN(summary.total_cogs)}
              </p>
              <span className="text-[11px] text-rose-700 font-bold block mt-1">
                {summary.food_cost_percentage}% Food Cost
              </span>
            </div>

            {/* Margen Bruto de Ganancia */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              <span className="text-xs font-extrabold text-slate-400 uppercase">Margen Bruto de Ganancia</span>
              <p className="text-2xl sm:text-3xl font-black text-emerald-600 mt-2">
                {formatMXN(summary.gross_profit)}
              </p>
              <span className="text-[11px] text-slate-500 font-semibold block mt-1">Ventas menos Insumos</span>
            </div>

            {/* Saldo y Propinas en Caja */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              <span className="text-xs font-extrabold text-slate-400 uppercase">Saldo en Caja</span>
              <p className="text-2xl sm:text-3xl font-black text-blue-600 mt-2">
                {formatMXN(summary.cash_balance || summary.cash_sales)}
              </p>
              <span className="text-[11px] text-slate-500 font-semibold block mt-1">
                Propinas: {formatMXN(summary.tips_total)}
              </span>
            </div>

          </div>

          {/* ARQUEO DE FORMAS DE PAGO */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <h4 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
              <CreditCard size={18} className="text-orange-600" />
              <span>Desglose de Formas de Pago</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-bold text-slate-500 block">💵 Efectivo</span>
                <span className="text-lg font-black text-slate-900">{formatMXN(summary.cash_sales)}</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-bold text-slate-500 block">💳 Tarjeta</span>
                <span className="text-lg font-black text-slate-900">{formatMXN(summary.card_sales)}</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-bold text-slate-500 block">📲 Transferencias</span>
                <span className="text-lg font-black text-slate-900">{formatMXN(summary.transfer_sales)}</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-bold text-slate-500 block">🪙 Propinas Totales</span>
                <span className="text-lg font-black text-emerald-600">{formatMXN(summary.tips_total)}</span>
              </div>
            </div>
          </div>

          {/* TABLA: INSUMOS QUE SE DESCONTARÁN DEL ALMACÉN */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h4 className="font-black text-base sm:text-lg text-slate-900 flex items-center gap-2">
                  <Layers size={20} className="text-orange-600" />
                  <span>Insumos a Descontar de Almacén ({ingredients.length})</span>
                </h4>
                <p className="text-xs text-slate-400">Calculados automáticamente multiplicando ventas por recetas</p>
              </div>
              <span className="text-xs font-black text-rose-600 bg-rose-50 px-3 py-1 rounded-xl">
                Costo Total: {formatMXN(summary.total_cogs)}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 uppercase font-black border-b border-slate-100">
                    <th className="p-3">Insumo Almacén</th>
                    <th className="p-3">Categoría</th>
                    <th className="p-3 text-center">Stock Actual</th>
                    <th className="p-3 text-center">Descuento (-)</th>
                    <th className="p-3 text-center">Nuevo Stock</th>
                    <th className="p-3 text-right">Costo Consumido</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ingredients.map(ing => {
                    const newStock = Math.max(0, ing.current_stock - ing.quantity_to_deduct);
                    return (
                      <tr key={ing.product_id} className="hover:bg-slate-50/70 transition">
                        <td className="p-3 font-bold text-slate-900">{ing.name}</td>
                        <td className="p-3">
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            {ing.category}
                          </span>
                        </td>
                        <td className="p-3 text-center font-bold text-slate-600">
                          {ing.current_stock} {ing.unit}
                        </td>
                        <td className="p-3 text-center font-black text-rose-600">
                          - {ing.quantity_to_deduct} {ing.unit}
                        </td>
                        <td className="p-3 text-center font-black text-emerald-700">
                          {newStock.toFixed(2)} {ing.unit}
                        </td>
                        <td className="p-3 text-right font-black text-slate-900">
                          {formatMXN(ing.total_cost)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* TABLA: DESGLOSE DE PRODUCTOS VENDIDOS EN EL CORTE */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h4 className="font-black text-base sm:text-lg text-slate-900">
                🍽️ Platillos y Bebidas Vendidos ({soldItems.length})
              </h4>
              <span className="text-xs font-bold text-slate-500">
                Total partidas: {summary.total_items_sold} unidades
              </span>
            </div>

            <div className="max-h-96 overflow-y-auto overflow-x-auto pr-1">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 uppercase font-black border-b border-slate-100">
                    <th className="p-3">Platillo / Bebida</th>
                    <th className="p-3">Categoría</th>
                    <th className="p-3 text-center">Cantidad</th>
                    <th className="p-3 text-right">Precio Unitario</th>
                    <th className="p-3 text-right">Total Venta</th>
                    <th className="p-3 text-right">Costo Insumos</th>
                    <th className="p-3 text-center">Receta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {soldItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70 transition">
                      <td className="p-3 font-bold text-slate-900">{item.name}</td>
                      <td className="p-3 text-slate-500 font-semibold">{item.category}</td>
                      <td className="p-3 text-center font-black text-slate-700">{item.quantity}</td>
                      <td className="p-3 text-right font-semibold text-slate-600">{formatMXN(item.unit_price)}</td>
                      <td className="p-3 text-right font-black text-slate-900">{formatMXN(item.total_amount)}</td>
                      <td className="p-3 text-right font-bold text-rose-600">{formatMXN(item.cogs_cost)}</td>
                      <td className="p-3 text-center">
                        {item.has_recipe ? (
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                            ✓ Vinculada
                          </span>
                        ) : (
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-500">
                            Sin Receta
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
