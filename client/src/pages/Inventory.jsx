import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addStockAdjustment, addSupplier, editSupplier, adjustSupplierBalance } from '../store/slices/inventorySlice';
import { updateStock } from '../store/slices/productSlice';

export const Inventory = () => {
  const dispatch = useDispatch();

  // Redux Slices
  const { products } = useSelector((s) => s.products);
  const { suppliers, stockAdjustments } = useSelector((s) => s.inventory);

  // States
  const [invTab, setInvTab] = useState('stock-list'); // stock-list, adjustments, suppliers
  const [isAdjModalOpen, setIsAdjModalOpen] = useState(false);
  const [isSupModalOpen, setIsSupModalOpen] = useState(false);

  // Stock Adjustment Form Fields
  const [adjProductId, setAdjProductId] = useState('');
  const [adjVariantId, setAdjVariantId] = useState('');
  const [adjType, setAdjType] = useState('Stock In'); // Stock In, Stock Out, Stock Transfer, Damaged Stock, Inventory Adjustment
  const [adjQty, setAdjQty] = useState('');
  const [adjReason, setAdjReason] = useState('');

  // Supplier Form Fields
  const [supEditMode, setSupEditMode] = useState(false);
  const [supEditingId, setSupEditingId] = useState(null);
  const [supName, setSupName] = useState('');
  const [supContact, setSupContact] = useState('');
  const [supPhone, setSupPhone] = useState('');
  const [supEmail, setSupEmail] = useState('');
  const [supAddress, setSupAddress] = useState('');
  const [supGst, setSupGst] = useState('');
  const [supBalance, setSupBalance] = useState('');

  // Supplier Payment Ledger Form
  const [paySupId, setPaySupId] = useState('');
  const [payAmount, setPayAmount] = useState('');

  const selectedProduct = products.find(p => p.id === adjProductId);

  const resetSupForm = () => {
    setSupName('');
    setSupContact('');
    setSupPhone('');
    setSupEmail('');
    setSupAddress('');
    setSupGst('');
    setSupBalance('0');
    setSupEditMode(false);
    setSupEditingId(null);
  };

  const handleOpenAddSup = () => {
    resetSupForm();
    setIsSupModalOpen(true);
  };

  const handleOpenEditSup = (s) => {
    setSupName(s.name);
    setSupContact(s.contactPerson);
    setSupPhone(s.phone);
    setSupEmail(s.email);
    setSupAddress(s.address);
    setSupGst(s.gstNumber);
    setSupBalance(s.outstandingBalance.toString());
    setSupEditingId(s.id);
    setSupEditMode(true);
    setIsSupModalOpen(true);
  };

  // Submit Stock Adjustment
  const handleAdjSubmit = (e) => {
    e.preventDefault();
    if (!adjProductId || !adjQty) return;

    const qtyVal = Number(adjQty);
    // Determine sign: Stock In = positive; Stock Out / Damaged / Transfer = negative;
    const sign = (adjType === 'Stock In' || (adjType === 'Inventory Adjustment' && qtyVal > 0)) ? 1 : -1;
    const changeQty = Math.abs(qtyVal) * sign;

    const prod = products.find(p => p.id === adjProductId);
    const variant = prod?.variants?.find(v => v.id === adjVariantId);
    const variantSku = variant ? variant.sku : prod?.sku;

    // 1. Log adjustment in inventory history
    dispatch(addStockAdjustment({
      type: adjType,
      productId: adjProductId,
      productName: prod?.name || 'Unknown',
      variantSku: variantSku || 'N/A',
      quantity: Math.abs(qtyVal),
      reason: adjReason || 'POS manual inventory update',
      user: 'Store Manager'
    }));

    // 2. Modify actual stock level in product list
    dispatch(updateStock({
      productId: adjProductId,
      variantId: adjVariantId || undefined,
      changeQty
    }));

    setIsAdjModalOpen(false);
    setAdjProductId('');
    setAdjVariantId('');
    setAdjQty('');
    setAdjReason('');
  };

  // Submit Supplier
  const handleSupSubmit = (e) => {
    e.preventDefault();
    const supData = {
      id: supEditMode ? supEditingId : `sup_${Date.now()}`,
      name: supName,
      contactPerson: supContact,
      phone: supPhone,
      email: supEmail,
      address: supAddress,
      gstNumber: supGst,
      outstandingBalance: Number(supBalance)
    };

    if (supEditMode) {
      dispatch(editSupplier(supData));
    } else {
      dispatch(addSupplier(supData));
    }
    
    setIsSupModalOpen(false);
    resetSupForm();
  };

  // Supplier Payment reconciliation
  const handlePaySupplier = (e) => {
    e.preventDefault();
    if (!paySupId || !payAmount) return;

    dispatch(adjustSupplierBalance({
      supplierId: paySupId,
      changeAmount: -Number(payAmount)
    }));

    alert(`Reconciled outstanding supplier payment. Cleared: ₹${payAmount}`);
    setPaySupId('');
    setPayAmount('');
  };

  return (
    <div className="space-y-6">
      {/* Sub Menu Navigation */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200/85 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex gap-2">
          <button
            onClick={() => setInvTab('stock-list')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              invTab === 'stock-list' 
                ? 'bg-slate-50 text-[#3B82F6] border border-slate-200' 
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700/50'
            }`}
          >
            📋 Stock Levels Monitor
          </button>
          <button
            onClick={() => setInvTab('adjustments')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              invTab === 'adjustments' 
                ? 'bg-slate-50 text-[#3B82F6] border border-slate-200' 
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700/50'
            }`}
          >
            📜 Stock Log Ledger
          </button>
          <button
            onClick={() => setInvTab('suppliers')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              invTab === 'suppliers' 
                ? 'bg-slate-50 text-[#3B82F6] border border-slate-200' 
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700/50'
            }`}
          >
            🚚 Supplier Database
          </button>
        </div>

        {invTab === 'stock-list' && (
          <button
            onClick={() => setIsAdjModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-slate-850 hover:bg-slate-900 text-white font-extrabold uppercase text-xs tracking-wider transition cursor-pointer"
          >
            ⚡ Adjust Stock
          </button>
        )}

        {invTab === 'suppliers' && (
          <button
            onClick={handleOpenAddSup}
            className="px-4 py-2.5 rounded-xl bg-slate-850 hover:bg-slate-900 text-white font-extrabold uppercase text-xs tracking-wider transition cursor-pointer"
          >
            ➕ Add Supplier
          </button>
        )}
      </div>

      {/* Tab content 1: Stock list monitor */}
      {invTab === 'stock-list' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/85 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-700/30 border-b border-slate-100 dark:border-slate-700 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                  <th className="p-4">Clothing SKU / Name</th>
                  <th className="p-4">Fabric / Category</th>
                  <th className="p-4 text-center">Current stock</th>
                  <th className="p-4 text-center">Safety Reorder</th>
                  <th className="p-4 text-center">Health Status</th>
                  <th className="p-4 text-center">Variants Summary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50 text-xs">
                {products.map(p => {
                  const isOut = p.stockQuantity <= 0;
                  const isLow = p.stockQuantity <= p.reorderLevel && !isOut;
                  
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/10">
                      <td className="p-4">
                        <div className="font-bold text-slate-800 dark:text-slate-150 text-sm">{p.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{p.sku} | Bar: {p.barcode}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-slate-700 dark:text-slate-350">{p.category}</div>
                        <div className="text-[9px] text-slate-450 uppercase mt-0.5">{p.fabric}</div>
                      </td>
                      <td className="p-4 text-center font-black text-slate-900 dark:text-white">
                        {p.stockQuantity} Pcs
                      </td>
                      <td className="p-4 text-center font-bold text-slate-400">
                        {p.reorderLevel} Pcs
                      </td>
                      <td className="p-4 text-center">
                        {isOut ? (
                          <span className="px-2.5 py-0.5 rounded-full font-black text-[9px] bg-slate-50 text-red-600 uppercase tracking-wider animate-pulse">Out of Stock</span>
                        ) : isLow ? (
                          <span className="px-2.5 py-0.5 rounded-full font-black text-[9px] bg-amber-50 text-amber-700 uppercase tracking-wider">Low Stock</span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full font-black text-[9px] bg-emerald-50 text-emerald-600 uppercase tracking-wider">Stock Good</span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        {p.variants && p.variants.length > 0 ? (
                          <div className="flex flex-wrap gap-1 items-center justify-center">
                            {p.variants.map((v, idx) => (
                              <span key={idx} className={`text-[8px] font-black px-1.5 py-0.5 rounded border ${
                                v.stockQuantity <= v.reorderLevel 
                                  ? 'bg-rose-50 text-[#8B5CF6] border-rose-200' 
                                  : 'bg-slate-100 text-slate-500 border-slate-200'
                              }`}>
                                {v.size}/{v.color.substring(0,3)}: {v.stockQuantity}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[9px] text-slate-400">No Variants</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab content 2: Stock adjustments history */}
      {invTab === 'adjustments' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/85 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-700/30 border-b border-slate-100 dark:border-slate-700 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Garment SKU</th>
                  <th className="p-4">Adjustment Type</th>
                  <th className="p-4 text-center">Adjusted Qty</th>
                  <th className="p-4">Reason / Notes</th>
                  <th className="p-4">User</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50 text-xs">
                {stockAdjustments.map(adj => {
                  return (
                    <tr key={adj.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/10">
                      <td className="p-4 text-slate-400 font-medium">
                        {new Date(adj.date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-slate-850 dark:text-slate-100">{adj.productName}</div>
                        <div className="text-[9px] text-slate-450 font-mono mt-0.5">SKU: {adj.variantSku}</div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded font-extrabold text-[9px] uppercase tracking-wider ${
                          adj.type === 'Stock In' ? 'bg-emerald-50 text-emerald-600' :
                          adj.type === 'Damaged Stock' ? 'bg-slate-50 text-red-600 animate-pulse' :
                          'bg-blue-50 text-blue-600'
                        }`}>
                          {adj.type}
                        </span>
                      </td>
                      <td className="p-4 text-center font-black text-slate-900 dark:text-white">
                        {adj.quantity} Pcs
                      </td>
                      <td className="p-4 font-semibold text-slate-650 dark:text-slate-350">
                        {adj.reason}
                      </td>
                      <td className="p-4 font-medium text-slate-400 uppercase tracking-widest text-[9px]">
                        {adj.user}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab content 3: Suppliers lists */}
      {invTab === 'suppliers' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Supplier Table */}
          <div className="xl:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/85 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-700/30 border-b border-slate-100 dark:border-slate-700 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                    <th className="p-4">Supplier Firm Name</th>
                    <th className="p-4">Contact Details</th>
                    <th className="p-4">GST Number</th>
                    <th className="p-4 text-right">Outstanding Dues</th>
                    <th className="p-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50 text-xs">
                  {suppliers.map(s => {
                    return (
                      <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/10">
                        <td className="p-4">
                          <div className="font-bold text-slate-850 dark:text-slate-100 text-sm">{s.name}</div>
                          <div className="text-[10px] text-slate-400 font-semibold mt-0.5">Sp: {s.contactPerson}</div>
                        </td>
                        <td className="p-4">
                          <div className="text-slate-650 dark:text-slate-350">📞 {s.phone}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">✉️ {s.email} | {s.address}</div>
                        </td>
                        <td className="p-4 font-mono font-bold text-slate-400 uppercase">
                          {s.gstNumber}
                        </td>
                        <td className="p-4 text-right font-black text-slate-900 dark:text-white">
                          ₹{s.outstandingBalance.toLocaleString('en-IN')}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-center">
                            <button
                              onClick={() => handleOpenEditSup(s)}
                              className="p-1 px-2 border rounded-lg hover:bg-slate-100 hover:text-slate-500 font-bold transition text-[10px]"
                            >
                              ✏️ Edit
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Supplier Payments Reconciliation Card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200/85 dark:border-slate-700 shadow-sm space-y-4 h-fit">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Supplier Payments Desk
            </h3>
            <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
              Clear outstanding dues for fabrics and raw supplies. This will deduct from supplier outstanding balance logs.
            </p>

            <form onSubmit={handlePaySupplier} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Select Supplier</label>
                <select
                  required
                  value={paySupId}
                  onChange={(e) => setPaySupId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 focus:outline-none"
                >
                  <option value="">-- Choose Supplier --</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name} (Balance: ₹{s.outstandingBalance})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Amount to Pay (₹)</label>
                <input
                  type="number"
                  required
                  placeholder="5000"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border focus:outline-none font-bold"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-slate-850 hover:bg-slate-900 text-white font-extrabold uppercase tracking-widest text-[10px] rounded-xl shadow-lg transition cursor-pointer"
              >
                💸 Reconcile Supplier Dues
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Adjust Stock Level Modal */}
      {isAdjModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md shadow-2xl border border-slate-100 dark:border-slate-700 p-6 space-y-6">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest animate-pulse">
                Stock Adjustment Voucher
              </h2>
              <button onClick={() => setIsAdjModalOpen(false)} className="text-slate-500 dark:text-slate-400 hover:text-slate-500">✕</button>
            </div>

            <form onSubmit={handleAdjSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Select Clothing Item *</label>
                <select
                  required
                  value={adjProductId}
                  onChange={(e) => { setAdjProductId(e.target.value); setAdjVariantId(''); }}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border focus:outline-none"
                >
                  <option value="">-- Choose Product --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                  ))}
                </select>
              </div>

              {/* Variant selection if product has variants */}
              {selectedProduct?.variants && selectedProduct.variants.length > 0 && (
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Select Size / Color variant</label>
                  <select
                    value={adjVariantId}
                    onChange={(e) => setAdjVariantId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border focus:outline-none"
                  >
                    <option value="">-- Choose Variant --</option>
                    {selectedProduct.variants.map(v => (
                      <option key={v.id} value={v.id}>Size: {v.size} | Color: {v.color} (Stock: {v.stockQuantity})</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Adjustment Type</label>
                  <select
                    value={adjType}
                    onChange={(e) => setAdjType(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border focus:outline-none"
                  >
                    <option value="Stock In">📦 Stock In (Add)</option>
                    <option value="Stock Out">📤 Stock Out (Remove)</option>
                    <option value="Stock Transfer">🔄 Stock Transfer</option>
                    <option value="Damaged Stock">⚠️ Damaged Stock</option>
                    <option value="Inventory Adjustment">⚙️ Inv Adjustment</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Quantity (Pcs) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="10"
                    value={adjQty}
                    onChange={(e) => setAdjQty(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border focus:outline-none font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Reason / Voucher Notes</label>
                <textarea
                  rows="3"
                  placeholder="e.g. Received new stock delivery, or damaged due to fabric dye bleeding"
                  value={adjReason}
                  onChange={(e) => setAdjReason(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 border-t pt-4">
                <button
                  type="button"
                  onClick={() => setIsAdjModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 dark:bg-slate-750 text-slate-650 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#3B82F6] text-white font-extrabold uppercase tracking-widest rounded-xl hover:bg-blue-600 transition shadow-lg shadow-blue-500/20"
                >
                  Save Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add/Edit Supplier Modal */}
      {isSupModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-xl shadow-2xl border border-slate-100 dark:border-slate-700 p-6 space-y-6">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">
                {supEditMode ? 'Modify Supplier Profile' : 'Register Supplier'}
              </h2>
              <button onClick={() => setIsSupModalOpen(false)} className="text-slate-500 dark:text-slate-400 hover:text-slate-500">✕</button>
            </div>

            <form onSubmit={handleSupSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Supplier Firm Name *</label>
                  <input
                    type="text"
                    required
                    value={supName}
                    onChange={(e) => setSupName(e.target.value)}
                    placeholder="Vardhman Fabrics"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Contact Person Name</label>
                  <input
                    type="text"
                    value={supContact}
                    onChange={(e) => setSupContact(e.target.value)}
                    placeholder="Amit Vardhman"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={supPhone}
                    onChange={(e) => setSupPhone(e.target.value)}
                    placeholder="9812345678"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Email Address</label>
                  <input
                    type="email"
                    value={supEmail}
                    onChange={(e) => setSupEmail(e.target.value)}
                    placeholder="sales@vardhman.com"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">GSTIN Number</label>
                  <input
                    type="text"
                    value={supGst}
                    onChange={(e) => setSupGst(e.target.value)}
                    placeholder="03AAAAA1111A1Z1"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Initial Outstanding Balance (₹)</label>
                  <input
                    type="number"
                    value={supBalance}
                    onChange={(e) => setSupBalance(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border focus:outline-none font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Billing Address</label>
                <textarea
                  rows="2"
                  value={supAddress}
                  onChange={(e) => setSupAddress(e.target.value)}
                  placeholder="Ludhiana, Punjab"
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 border-t pt-4">
                <button
                  type="button"
                  onClick={() => setIsSupModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 dark:bg-slate-750 text-slate-650 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#3B82F6] text-white font-extrabold uppercase tracking-widest rounded-xl hover:bg-blue-600 transition"
                >
                  Save Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
