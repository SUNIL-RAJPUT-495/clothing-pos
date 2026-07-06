import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { createPurchaseOrder, updatePurchaseOrderStatus, adjustSupplierBalance } from '../store/slices/inventorySlice';
import { updateStock } from '../store/slices/productSlice';

export const Purchases = () => {
  const dispatch = useDispatch();

  // Redux Slices
  const { suppliers, purchaseOrders } = useSelector((s) => s.inventory);
  const { products } = useSelector((s) => s.products);

  // States
  const [isPoModalOpen, setIsPoModalOpen] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [poItems, setPoItems] = useState([]);
  
  // PO sub-items input states
  const [poSku, setPoSku] = useState('');
  const [poQty, setPoQty] = useState('');
  const [poCost, setPoCost] = useState('');

  const selectedSupplier = suppliers.find(s => s.id === selectedSupplierId);

  // Add Item to active PO form list
  const handleAddPoItem = () => {
    if (!poSku || !poQty || !poCost) return;
    
    // Attempt to match product SKU
    const matchedProduct = products.find(p => p.sku === poSku || p.variants?.some(v => v.sku === poSku));
    const name = matchedProduct ? matchedProduct.name : 'Raw Fabrics Supplies';

    setPoItems([
      ...poItems,
      {
        sku: poSku,
        name,
        quantity: Number(poQty),
        costPrice: Number(poCost)
      }
    ]);

    setPoSku('');
    setPoQty('');
    setPoCost('');
  };

  const handleRemovePoItem = (idx) => {
    setPoItems(poItems.filter((_, i) => i !== idx));
  };

  // Submit PO
  const handlePoSubmit = (e) => {
    e.preventDefault();
    if (!selectedSupplierId || poItems.length === 0) {
      alert('Please configure a supplier and add at least one supply item.');
      return;
    }

    const subtotal = poItems.reduce((sum, item) => sum + item.costPrice * item.quantity, 0);
    const gst = Math.round(subtotal * 0.12);
    const total = subtotal + gst;

    const poId = `PO-202607-${Math.floor(100 + Math.random() * 900)}`;

    const newPO = {
      id: poId,
      date: new Date().toISOString(),
      supplierId: selectedSupplierId,
      supplierName: selectedSupplier ? selectedSupplier.name : 'Unknown',
      items: poItems,
      subtotal,
      gst,
      total,
      status: 'Sent', // Draft, Sent, Received, Cancelled
      paymentStatus: 'Unpaid', // Paid, Partial, Unpaid
      outstandingDues: total
    };

    // 1. Dispatch create purchase order
    dispatch(createPurchaseOrder(newPO));

    // 2. Adjust supplier outstanding ledger balance
    dispatch(adjustSupplierBalance({
      supplierId: selectedSupplierId,
      changeAmount: total
    }));

    setIsPoModalOpen(false);
    setSelectedSupplierId('');
    setPoItems([]);
    alert(`Issued Purchase Order ${poId} to ${newPO.supplierName}`);
  };

  // Trigger PO Goods Receipt (Inventory stock-in action)
  const handleReceiveGoods = (po) => {
    if (po.status === 'Received') return;

    // 1. Increment inventory levels for each PO item
    po.items.forEach(item => {
      // Find matches in catalog
      const matchedProd = products.find(p => p.sku === item.sku);
      if (matchedProd) {
        dispatch(updateStock({
          productId: matchedProd.id,
          changeQty: item.quantity
        }));
      } else {
        // Try variants match
        const matchedVariantProd = products.find(p => p.variants?.some(v => v.sku === item.sku));
        const matchedVar = matchedVariantProd?.variants?.find(v => v.sku === item.sku);
        if (matchedVariantProd && matchedVar) {
          dispatch(updateStock({
            productId: matchedVariantProd.id,
            variantId: matchedVar.id,
            changeQty: item.quantity
          }));
        }
      }
    });

    // 2. Mark PO status as Received
    dispatch(updatePurchaseOrderStatus({
      poId: po.id,
      status: 'Received'
    }));

    alert(`Successfully processed goods receipt voucher for PO ${po.id}. Stock items loaded into catalog.`);
  };

  // Mark PO as paid
  const handleSettlePoPayment = (po) => {
    if (po.paymentStatus === 'Paid') return;

    dispatch(updatePurchaseOrderStatus({
      poId: po.id,
      paymentStatus: 'Paid',
      outstandingDues: 0
    }));

    dispatch(adjustSupplierBalance({
      supplierId: po.supplierId,
      changeAmount: -po.outstandingDues
    }));

    alert(`Settle outstanding bills for PO ${po.id}. Supplier dues balanced.`);
  };

  return (
    <div className="space-y-6">
      {/* Search & Actions toolbar */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200/85 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
            Purchase Orders & Bills
          </h2>
          <p className="text-[10px] text-slate-400 font-semibold mt-1">
            Reconcile purchase bills and automatically increment product stock upon goods receipt.
          </p>
        </div>
        <button
          onClick={() => { setSelectedSupplierId(''); setPoItems([]); setIsPoModalOpen(true); }}
          className="px-4 py-2.5 rounded-xl bg-[#3B82F6] hover:bg-blue-600 text-white font-extrabold uppercase text-xs tracking-wider transition cursor-pointer"
        >
          ➕ Raise Purchase Order (PO)
        </button>
      </div>

      {/* PO List Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/85 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-700/30 border-b border-slate-100 dark:border-slate-700 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                <th className="p-4">PO Number / Date</th>
                <th className="p-4">Supplier Firm</th>
                <th className="p-4">Items / Supplies Ordered</th>
                <th className="p-4 text-right">Invoiced Cost</th>
                <th className="p-4 text-center">Delivery status</th>
                <th className="p-4 text-center">Outstanding Dues</th>
                <th className="p-4 text-center">Bill payment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50 text-xs">
              {purchaseOrders.map(po => {
                return (
                  <tr key={po.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/10">
                    <td className="p-4">
                      <div className="font-black text-slate-900 dark:text-white">{po.id}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {new Date(po.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                    </td>
                    <td className="p-4 font-bold text-slate-750 dark:text-slate-200">
                      🏢 {po.supplierName}
                    </td>
                    <td className="p-4">
                      <div className="space-y-1 max-w-xs">
                        {po.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center text-[10px] font-semibold text-slate-500">
                            <span>{item.name} ({item.sku})</span>
                            <span className="font-bold text-slate-850 dark:text-slate-350">x{item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 text-right font-black text-slate-900 dark:text-white">
                      ₹{po.total.toLocaleString('en-IN')}
                      <div className="text-[9px] text-slate-400 font-bold mt-0.5">GST: ₹{po.gst}</div>
                    </td>
                    <td className="p-4 text-center">
                      {po.status === 'Received' ? (
                        <span className="px-2.5 py-0.5 rounded-full font-black text-[9px] bg-emerald-50 text-emerald-600 uppercase">Received</span>
                      ) : (
                        <button
                          onClick={() => handleReceiveGoods(po)}
                          className="px-2.5 py-1 bg-amber-50 text-amber-700 hover:bg-emerald-50 hover:text-emerald-600 border border-amber-250 hover:border-emerald-300 rounded-lg text-[9px] font-black uppercase tracking-wider transition"
                        >
                          Mark Received 📥
                        </button>
                      )}
                    </td>
                    <td className="p-4 text-center font-black text-[#8B5CF6]">
                      ₹{po.outstandingDues.toLocaleString('en-IN')}
                    </td>
                    <td className="p-4 text-center">
                      {po.paymentStatus === 'Paid' ? (
                        <span className="px-2.5 py-0.5 rounded-full font-black text-[9px] bg-emerald-50 text-emerald-650 uppercase">Paid</span>
                      ) : (
                        <button
                          onClick={() => handleSettlePoPayment(po)}
                          className="px-2.5 py-1 bg-slate-850 text-white hover:bg-slate-950 rounded-lg text-[9px] font-black uppercase tracking-wider transition cursor-pointer"
                        >
                          Settle Dues 💳
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Raise PO Modal */}
      {isPoModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 dark:border-slate-700 p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">
                Raise Purchase Order (PO)
              </h2>
              <button onClick={() => setIsPoModalOpen(false)} className="text-slate-500 dark:text-slate-400 hover:text-slate-500">✕</button>
            </div>

            <form onSubmit={handlePoSubmit} className="space-y-6 text-xs">
              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Select Supplier Firm *</label>
                <select
                  required
                  value={selectedSupplierId}
                  onChange={(e) => setSelectedSupplierId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border focus:outline-none"
                >
                  <option value="">-- Choose Supplier --</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name} (GSTIN: {s.gstNumber})</option>
                  ))}
                </select>
              </div>

              {/* Add PO Items sub form */}
              <div className="border-t pt-4 space-y-4">
                <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Garments Order Sheet List</div>
                
                <div className="p-4 bg-slate-50 dark:bg-slate-700/20 rounded-2xl grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Item SKU / Code *</label>
                    <input
                      type="text"
                      placeholder="e.g. DEN-JN-BL-M"
                      value={poSku}
                      onChange={(e) => setPoSku(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-lg bg-white dark:bg-slate-700 border text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Quantity Ordered *</label>
                    <input
                      type="number"
                      placeholder="100"
                      value={poQty}
                      onChange={(e) => setPoQty(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-lg bg-white dark:bg-slate-700 border text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Cost Price (₹/Pc) *</label>
                    <input
                      type="number"
                      placeholder="850"
                      value={poCost}
                      onChange={(e) => setPoCost(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-lg bg-white dark:bg-slate-700 border text-xs"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddPoItem}
                    className="w-full py-2 bg-slate-850 hover:bg-slate-900 text-white font-bold text-xs rounded-lg transition cursor-pointer"
                  >
                    ➕ Add Line Item
                  </button>
                </div>

                {/* Items preview table */}
                {poItems.length > 0 && (
                  <div className="border rounded-xl overflow-hidden">
                    <table className="w-full text-left border-collapse text-[11px]">
                      <thead className="bg-slate-50 dark:bg-slate-700/30 text-slate-400 font-extrabold uppercase">
                        <tr>
                          <th className="p-2.5 pl-4">Item Name</th>
                          <th className="p-2.5">SKU / Code</th>
                          <th className="p-2.5 text-center">Quantity</th>
                          <th className="p-2.5 text-right">Cost (₹)</th>
                          <th className="p-2.5 text-right">Subtotal (₹)</th>
                          <th className="p-2.5 text-center">Delete</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-105">
                        {poItems.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-750/30">
                            <td className="p-2.5 pl-4 font-bold text-slate-800 dark:text-white">{item.name}</td>
                            <td className="p-2.5 font-mono text-slate-500">{item.sku}</td>
                            <td className="p-2.5 text-center font-bold">{item.quantity} units</td>
                            <td className="p-2.5 text-right">₹{item.costPrice}</td>
                            <td className="p-2.5 text-right font-black text-slate-900 dark:text-white">₹{item.costPrice * item.quantity}</td>
                            <td className="p-2.5 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemovePoItem(idx)}
                                className="text-slate-500 hover:text-[#3B82F6] font-bold"
                              >
                                ✕
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Submit PO buttons */}
              <div className="flex justify-end gap-3 border-t pt-4">
                <button
                  type="button"
                  onClick={() => setIsPoModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 dark:bg-slate-750 text-slate-650 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#3B82F6] text-white font-extrabold uppercase tracking-widest rounded-xl hover:bg-blue-600 transition"
                >
                  Raise PO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Purchases;
