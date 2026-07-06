import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addStitchingOrder, updateStitchingStatus, editStitchingOrder, addTailor } from '../store/slices/stitchingSlice';

export const Stitching = () => {
  const dispatch = useDispatch();
  const { stitchingOrders, tailors } = useSelector((s) => s.stitching);

  // States
  const [stitchTab, setStitchTab] = useState('orders'); // orders, tailors
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form Fields
  const [customerName, setCustomerName] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const [orderType, setOrderType] = useState('Alteration'); // Alteration, Custom Stitching
  const [items, setItems] = useState('');
  const [tailorId, setTailorId] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [charges, setCharges] = useState('');
  const [notes, setNotes] = useState('');

  // Measurements sheets nested states
  const [chest, setChest] = useState('');
  const [waist, setWaist] = useState('');
  const [length, setLength] = useState('');
  const [sleeve, setSleeve] = useState('');
  const [shoulder, setShoulder] = useState('');
  const [neck, setNeck] = useState('');
  const [hip, setHip] = useState('');
  const [inseam, setInseam] = useState('');
  const [thigh, setThigh] = useState('');
  const [bottomWidth, setBottomWidth] = useState('');

  // Tailor Form fields
  const [isTailorModalOpen, setIsTailorModalOpen] = useState(false);
  const [tailorName, setTailorName] = useState('');
  const [tailorSpecialties, setTailorSpecialties] = useState('');

  const resetForm = () => {
    setCustomerName('');
    setCustomerMobile('');
    setOrderType('Alteration');
    setItems('');
    setTailorId(tailors[0]?.id || '');
    setDeliveryDate('');
    setCharges('');
    setNotes('');
    setChest('');
    setWaist('');
    setLength('');
    setSleeve('');
    setShoulder('');
    setNeck('');
    setHip('');
    setInseam('');
    setThigh('');
    setBottomWidth('');
    setEditMode(false);
    setEditingId(null);
  };

  const handleOpenAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (o) => {
    setCustomerName(o.customerName);
    setCustomerMobile(o.customerMobile);
    setOrderType(o.orderType);
    setItems(o.items);
    setTailorId(o.tailorId);
    setDeliveryDate(o.deliveryDate);
    setCharges(o.charges);
    setNotes(o.notes || '');

    // Load measurements
    const m = o.measurements || {};
    setChest(m.chest || '');
    setWaist(m.waist || '');
    setLength(m.length || '');
    setSleeve(m.sleeve || '');
    setShoulder(m.shoulder || '');
    setNeck(m.neck || '');
    setHip(m.hip || '');
    setInseam(m.inseam || '');
    setThigh(m.thigh || '');
    setBottomWidth(m.bottomWidth || '');

    setEditingId(o.id);
    setEditMode(true);
    setIsModalOpen(true);
  };

  // Submit Stitching/Alteration order
  const handleSubmit = (e) => {
    e.preventDefault();

    const selectedTailor = tailors.find(t => t.id === tailorId);

    const measurementsData = {
      chest, waist, length, sleeve, shoulder, neck, hip, inseam, thigh, bottomWidth
    };

    // Clean blank measurements
    Object.keys(measurementsData).forEach(key => {
      if (!measurementsData[key]) delete measurementsData[key];
    });

    const payload = {
      id: editMode ? editingId : undefined,
      customerName,
      customerMobile,
      orderType,
      items,
      tailorId,
      tailorName: selectedTailor ? selectedTailor.name : 'Unassigned',
      deliveryDate,
      charges: Number(charges),
      notes,
      measurements: measurementsData
    };

    if (editMode) {
      dispatch(editStitchingOrder(payload));
    } else {
      dispatch(addStitchingOrder(payload));
    }

    setIsModalOpen(false);
    resetForm();
  };

  // Bump Status (Pending -> In Progress -> Ready -> Delivered)
  const handleStatusChange = (orderId, currentStatus) => {
    let nextStatus = 'Pending';
    if (currentStatus === 'Pending') nextStatus = 'In Progress';
    else if (currentStatus === 'In Progress') nextStatus = 'Ready for Delivery';
    else if (currentStatus === 'Ready for Delivery') nextStatus = 'Delivered';
    else return; // already delivered, lock status

    dispatch(updateStitchingStatus({ orderId, status: nextStatus }));
  };

  // Add Tailor submit
  const handleAddTailorSubmit = (e) => {
    e.preventDefault();
    if (!tailorName) return;

    dispatch(addTailor({
      name: tailorName,
      specialties: tailorSpecialties.split(',').map(s => s.trim())
    }));

    setIsTailorModalOpen(false);
    setTailorName('');
    setTailorSpecialties('');
  };

  return (
    <div className="space-y-6">
      {/* Sub menu tabs */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200/85 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex gap-2">
          <button
            onClick={() => setStitchTab('orders')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              stitchTab === 'orders' 
                ? 'bg-slate-50 text-[#3B82F6] border border-slate-200' 
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700/50'
            }`}
          >
            ✂️ Stitching & Alteration Orders
          </button>
          <button
            onClick={() => setStitchTab('tailors')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              stitchTab === 'tailors' 
                ? 'bg-slate-50 text-[#3B82F6] border border-slate-200' 
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700/50'
            }`}
          >
            👔 Tailor Assignment Board
          </button>
        </div>

        {stitchTab === 'orders' && (
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 rounded-xl bg-[#3B82F6] hover:bg-blue-600 text-white font-extrabold uppercase text-xs tracking-wider transition cursor-pointer"
          >
            ➕ Log Tailoring Voucher
          </button>
        )}

        {stitchTab === 'tailors' && (
          <button
            onClick={() => setIsTailorModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-slate-850 hover:bg-slate-900 text-white font-extrabold uppercase text-xs tracking-wider transition cursor-pointer"
          >
            ➕ Add Tailor Profile
          </button>
        )}
      </div>

      {/* Tab content 1: Stitching orders list */}
      {stitchTab === 'orders' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/85 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-700/30 border-b border-slate-100 dark:border-slate-700 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                  <th className="p-4">Customer info</th>
                  <th className="p-4">Work Order Details</th>
                  <th className="p-4">Assigned Tailor</th>
                  <th className="p-4">Due Delivery Date</th>
                  <th className="p-4 text-center">Measurement sheet</th>
                  <th className="p-4 text-right">Job Charges</th>
                  <th className="p-4 text-center">Status / Next step</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50 text-xs">
                {stitchingOrders.map(o => {
                  const statusColors = {
                    'Pending': 'bg-amber-50 text-amber-700',
                    'In Progress': 'bg-blue-50 text-blue-600',
                    'Ready for Delivery': 'bg-pink-50 text-pink-650 animate-pulse',
                    'Delivered': 'bg-emerald-50 text-emerald-600'
                  };

                  return (
                    <tr key={o.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/10">
                      <td className="p-4">
                        <div className="font-bold text-slate-850 dark:text-slate-100 text-sm">{o.customerName}</div>
                        <div className="text-[10px] text-slate-400 font-semibold mt-0.5">📞 {o.customerMobile}</div>
                      </td>
                      <td className="p-4">
                        <span className="px-1.5 py-0.5 rounded font-black text-[9px] bg-slate-100 dark:bg-slate-700 text-slate-500 uppercase tracking-wide">
                          {o.orderType}
                        </span>
                        <div className="font-bold text-slate-700 dark:text-slate-200 mt-1">{o.items}</div>
                        {o.notes && <div className="text-[10px] text-slate-400 font-semibold mt-0.5 italic">Note: "{o.notes}"</div>}
                      </td>
                      <td className="p-4 font-bold text-slate-700 dark:text-slate-350">
                        👨‍🔧 {o.tailorName}
                      </td>
                      <td className="p-4 font-black text-slate-600 dark:text-slate-400">
                        📅 {new Date(o.deliveryDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="p-4">
                        {o.measurements ? (
                          <div className="flex flex-wrap gap-1 items-center justify-center max-w-[180px]">
                            {Object.entries(o.measurements).map(([key, val]) => (
                              <span key={key} className="text-[8px] font-black px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-500 uppercase">
                                {key.substring(0,3)}:{val}"
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[9px] text-slate-400">Blank</span>
                        )}
                      </td>
                      <td className="p-4 text-right font-black text-slate-900 dark:text-white">
                        ₹{o.charges}
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleStatusChange(o.id, o.status)}
                          className={`px-3 py-1 rounded-full font-black text-[9px] uppercase tracking-wider transition ${statusColors[o.status] || 'bg-slate-100 text-slate-600'}`}
                          title={o.status !== 'Delivered' ? 'Click to trigger next status workflow' : 'Job finished'}
                        >
                          {o.status} {o.status !== 'Delivered' && '➔'}
                        </button>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleOpenEditModal(o)}
                          className="p-1 px-2 border rounded-lg hover:bg-slate-100 transition text-[10px]"
                        >
                          ✏️ Edit Card
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab content 2: Tailors List */}
      {stitchTab === 'tailors' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tailors.map(t => (
            <div key={t.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/85 dark:border-slate-700 p-5 shadow-sm space-y-3">
              <div className="flex justify-between items-start">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-lg">👨‍🔧</div>
                <span className="px-2 py-0.5 rounded-full font-black text-[8px] bg-emerald-50 text-emerald-650 uppercase tracking-widest">{t.status}</span>
              </div>

              <div>
                <h3 className="font-black text-sm text-slate-850 dark:text-white">{t.name}</h3>
                <p className="text-[10px] text-slate-400 font-bold mt-0.5">Specialties & Skills:</p>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {t.specialties.map((s, i) => (
                    <span key={i} className="text-[8px] font-black px-2 py-0.5 bg-slate-50 dark:bg-slate-700/60 rounded border text-slate-500">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Summary of assigned orders */}
              <div className="border-t border-dashed pt-3 text-xs text-slate-500 font-semibold flex justify-between">
                <span>Active Workloads:</span>
                <span className="text-[#3B82F6] font-black">
                  {stitchingOrders.filter(o => o.tailorId === t.id && o.status !== 'Delivered').length} Pending Jobs
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Alteration Order Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 dark:border-slate-700 p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest font-mono">
                {editMode ? 'Modify Tailoring Voucher' : 'Issue Tailoring Work Order'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 dark:text-slate-400 hover:text-slate-500">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 text-xs">
              {/* Customer Profile & Assignment */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Customer Name *</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Rajesh Kumar"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Customer Mobile *</label>
                  <input
                    type="text"
                    required
                    maxLength="10"
                    value={customerMobile}
                    onChange={(e) => setCustomerMobile(e.target.value.replace(/\D/g, ''))}
                    placeholder="9876543210"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Order Type</label>
                  <select
                    value={orderType}
                    onChange={(e) => setOrderType(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border focus:outline-none font-bold text-slate-500"
                  >
                    <option value="Alteration">🔄 Garment Alteration / Hemming</option>
                    <option value="Custom Stitching">✂️ Custom Fabric Stitching</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Garment Item Details *</label>
                  <input
                    type="text"
                    required
                    value={items}
                    onChange={(e) => setItems(e.target.value)}
                    placeholder="e.g. Slim fit Denim tapering from knees"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Assign Master Tailor</label>
                  <select
                    value={tailorId}
                    onChange={(e) => setTailorId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border focus:outline-none text-slate-500"
                  >
                    {tailors.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Promise Delivery Date *</label>
                  <input
                    type="date"
                    required
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border focus:outline-none font-bold"
                  />
                </div>
              </div>

              {/* Nested Measurement Sheet Card */}
              <div className="bg-slate-50 dark:bg-slate-700/20 p-5 border rounded-2xl space-y-4">
                <div className="font-extrabold text-[10px] text-slate-400 uppercase tracking-widest">Garment Measurements Sheet (Inches)</div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Chest</label>
                    <input type="text" value={chest} onChange={(e) => setChest(e.target.value)} className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-700 border text-center font-bold" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Waist</label>
                    <input type="text" value={waist} onChange={(e) => setWaist(e.target.value)} className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-700 border text-center font-bold" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Garment Length</label>
                    <input type="text" value={length} onChange={(e) => setLength(e.target.value)} className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-700 border text-center font-bold" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Sleeve Length</label>
                    <input type="text" value={sleeve} onChange={(e) => setSleeve(e.target.value)} className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-700 border text-center font-bold" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Shoulder Width</label>
                    <input type="text" value={shoulder} onChange={(e) => setShoulder(e.target.value)} className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-700 border text-center font-bold" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Neck Circumference</label>
                    <input type="text" value={neck} onChange={(e) => setNeck(e.target.value)} className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-700 border text-center font-bold" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Hip Circumference</label>
                    <input type="text" value={hip} onChange={(e) => setHip(e.target.value)} className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-700 border text-center font-bold" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Inseam</label>
                    <input type="text" value={inseam} onChange={(e) => setInseam(e.target.value)} className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-700 border text-center font-bold" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Thigh</label>
                    <input type="text" value={thigh} onChange={(e) => setThigh(e.target.value)} className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-700 border text-center font-bold" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Bottom Width</label>
                    <input type="text" value={bottomWidth} onChange={(e) => setBottomWidth(e.target.value)} className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-700 border text-center font-bold" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Charges / Stitching Fee (₹) *</label>
                  <input
                    type="number"
                    required
                    value={charges}
                    onChange={(e) => setCharges(e.target.value)}
                    placeholder="250"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border focus:outline-none font-bold text-slate-850 dark:text-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Specific Stitching Instructions</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Shorten length by 2 inches, slim tapering knee down"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border focus:outline-none text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex justify-end gap-3 border-t pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 dark:bg-slate-750 text-slate-650 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#3B82F6] text-white font-extrabold uppercase tracking-widest rounded-xl hover:bg-blue-600 transition shadow-lg"
                >
                  {editMode ? 'Save Work Order' : 'Create Work Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Tailor Modal */}
      {isTailorModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md shadow-2xl border border-slate-100 dark:border-slate-700 p-6 space-y-6">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">
                Register New Tailor Profile
              </h2>
              <button onClick={() => setIsTailorModalOpen(false)} className="text-slate-500 dark:text-slate-400 hover:text-slate-500">✕</button>
            </div>

            <form onSubmit={handleAddTailorSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Tailor / Master Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Master Gurpreet Singh"
                  value={tailorName}
                  onChange={(e) => setTailorName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Specialties (Comma separated)</label>
                <input
                  type="text"
                  placeholder="Lehengas, Anarkali Suits, Silk Hemming"
                  value={tailorSpecialties}
                  onChange={(e) => setTailorSpecialties(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 border-t pt-4">
                <button
                  type="button"
                  onClick={() => setIsTailorModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 dark:bg-slate-750 text-slate-650 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#3B82F6] text-white font-extrabold uppercase tracking-widest rounded-xl hover:bg-blue-600 transition"
                >
                  Register Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stitching;
