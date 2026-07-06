import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addCustomer, editCustomer, deleteCustomer, adjustCustomerCredit } from '../store/slices/customerSlice';

export const Customers = () => {
  const dispatch = useDispatch();
  const { customers } = useSelector((s) => s.customers);

  // States
  const [custTab, setCustTab] = useState('list'); // list, reminders, credit-ledger
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form Fields
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [birthday, setBirthday] = useState('');
  const [anniversary, setAnniversary] = useState('');
  const [creditLimit, setCreditLimit] = useState('5000');

  // Customer Credit Ledger Adjustments Form
  const [creditMobile, setCreditMobile] = useState('');
  const [creditChange, setCreditChange] = useState('');
  const [creditNote, setCreditNote] = useState('');
  const [creditType, setCreditType] = useState('Payment Received'); // Credit Sale, Payment Received, Adjustment

  const resetForm = () => {
    setName('');
    setMobile('');
    setEmail('');
    setAddress('');
    setBirthday('');
    setAnniversary('');
    setCreditLimit('5000');
    setEditMode(false);
    setEditingId(null);
  };

  const handleOpenAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (c) => {
    setName(c.name);
    setMobile(c.mobile);
    setEmail(c.email || '');
    setAddress(c.address || '');
    setBirthday(c.birthday || '');
    setAnniversary(c.anniversary || '');
    setCreditLimit(c.creditLimit?.toString() || '5000');
    setEditingId(c.id);
    setEditMode(true);
    setIsModalOpen(true);
  };

  // Submit Customer form
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || mobile.length !== 10) {
      alert('Please fill valid name and 10-digit mobile number.');
      return;
    }

    const payload = {
      id: editMode ? editingId : `cust_${Date.now()}`,
      name,
      mobile,
      email,
      address,
      birthday,
      anniversary,
      creditLimit: Number(creditLimit)
    };

    if (editMode) {
      dispatch(editCustomer(payload));
    } else {
      dispatch(addCustomer(payload));
    }

    setIsModalOpen(false);
    resetForm();
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      dispatch(deleteCustomer(id));
    }
  };

  // Handle Customer Credit payback / adjustment
  const handleCreditReconcile = (e) => {
    e.preventDefault();
    if (!creditMobile || !creditChange) return;

    const amount = Number(creditChange);
    // Payment Received reduces debt (negative), Credit Sale adds debt (positive)
    const finalAmount = creditType === 'Payment Received' ? -amount : amount;

    dispatch(adjustCustomerCredit({
      mobile: creditMobile,
      amount: finalAmount,
      type: creditType,
      note: creditNote || 'Manual adjustment'
    }));

    alert(`Credit transaction processed. Balance updated for client +91 ${creditMobile}`);
    setCreditMobile('');
    setCreditChange('');
    setCreditNote('');
  };

  // Extract Upcoming Birthday & Anniversary Reminders (current month of July)
  const currentMonthNum = 7; // July (our simulated current local time date is July 1st, 2026)
  const birthdayReminders = customers.filter(c => {
    if (!c.birthday) return false;
    const bMonth = Number(c.birthday.split('-')[1]);
    return bMonth === currentMonthNum;
  });

  const anniversaryReminders = customers.filter(c => {
    if (!c.anniversary) return false;
    const aMonth = Number(c.anniversary.split('-')[1]);
    return aMonth === currentMonthNum;
  });

  return (
    <div className="space-y-6">
      {/* Sub tabs header */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200/85 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex gap-2">
          <button
            onClick={() => setCustTab('list')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              custTab === 'list' 
                ? 'bg-slate-50 text-[#3B82F6] border border-slate-200' 
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700/50'
            }`}
          >
            👥 Registered Profiles
          </button>
          <button
            onClick={() => setCustTab('reminders')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              custTab === 'reminders' 
                ? 'bg-slate-50 text-[#3B82F6] border border-slate-200' 
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700/50'
            }`}
          >
            🎂 Birthday & Anniversary Reminders
          </button>
          <button
            onClick={() => setCustTab('credit-ledger')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              custTab === 'credit-ledger' 
                ? 'bg-slate-50 text-[#3B82F6] border border-slate-200' 
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700/50'
            }`}
          >
            💳 Customer Store Credit Ledger
          </button>
        </div>

        {custTab === 'list' && (
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 rounded-xl bg-slate-850 hover:bg-slate-900 text-white font-extrabold uppercase text-xs tracking-wider transition cursor-pointer"
          >
            ➕ Register Customer
          </button>
        )}
      </div>

      {/* Tab content 1: Customers list */}
      {custTab === 'list' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/85 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-700/30 border-b border-slate-100 dark:border-slate-700 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                  <th className="p-4">Customer Details</th>
                  <th className="p-4">Contact Details</th>
                  <th className="p-4 text-center">Loyalty Rewards</th>
                  <th className="p-4 text-right">Credit Balance</th>
                  <th className="p-4 text-center">Key Reminders</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50 text-xs">
                {customers.map(c => {
                  const creditPercent = Math.min(100, (c.currentCredit / (c.creditLimit || 5000)) * 100);
                  
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/10">
                      <td className="p-4 font-bold text-slate-850 dark:text-slate-100 text-sm">
                        {c.name}
                      </td>
                      <td className="p-4">
                        <div className="text-slate-700 dark:text-slate-350">📞 {c.mobile}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{c.email} | {c.address}</div>
                      </td>
                      <td className="p-4 text-center">
                        <span className="px-2.5 py-0.5 rounded-full font-black text-[10px] bg-slate-50 text-[#3B82F6] border border-slate-200 inline-block">
                          ⭐ {c.loyaltyPoints} Points
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="font-black text-slate-900 dark:text-white">₹{c.currentCredit}</div>
                        <div className="text-[9px] text-slate-400 font-bold mt-0.5">Limit: ₹{c.creditLimit}</div>
                        {/* tiny bar */}
                        {c.currentCredit > 0 && (
                          <div className="w-24 bg-slate-100 h-1 rounded overflow-hidden mt-1 ml-auto">
                            <div className="bg-slate-500 h-full" style={{ width: `${creditPercent}%` }} />
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <div className="space-y-0.5 text-[9px] font-bold text-slate-400">
                          {c.birthday && <div>🎂 Bday: {new Date(c.birthday).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</div>}
                          {c.anniversary && <div>💍 Anniv: {new Date(c.anniversary).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</div>}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenEditModal(c)}
                            className="p-1 px-2 border rounded-lg hover:bg-slate-100 transition text-[10px]"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDelete(c.id)}
                            className="p-1 px-2 border rounded-lg hover:bg-slate-50 text-slate-500 transition text-[10px]"
                          >
                            🗑️ Delete
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
      )}

      {/* Tab content 2: Upcoming reminders */}
      {custTab === 'reminders' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Birthdays this month */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200/85 dark:border-slate-700 shadow-sm space-y-4">
            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              🎂 Birthdays in July
            </h2>
            <div className="space-y-3">
              {birthdayReminders.length > 0 ? (
                birthdayReminders.map(c => (
                  <div key={c.id} className="flex justify-between items-center p-3 bg-rose-50/20 border border-pink-100 rounded-xl">
                    <div className="text-xs">
                      <div className="font-bold text-slate-850 dark:text-slate-100">{c.name}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">📞 +91 {c.mobile}</div>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] font-black text-[#8B5CF6] bg-rose-50 px-2.5 py-0.5 rounded-full">
                        {new Date(c.birthday).toLocaleDateString('en-IN', { day: '2-digit', month: 'long' })}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-450 font-bold text-xs">No customer birthdays reported this month.</div>
              )}
            </div>
          </div>

          {/* Anniversaries this month */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200/85 dark:border-slate-700 shadow-sm space-y-4">
            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              💍 Anniversaries in July
            </h2>
            <div className="space-y-3">
              {anniversaryReminders.length > 0 ? (
                anniversaryReminders.map(c => (
                  <div key={c.id} className="flex justify-between items-center p-3 bg-slate-50/20 border border-red-100 rounded-xl">
                    <div className="text-xs">
                      <div className="font-bold text-slate-850 dark:text-slate-100">{c.name}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">📞 +91 {c.mobile}</div>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] font-black text-[#3B82F6] bg-slate-50 px-2.5 py-0.5 rounded-full">
                        {new Date(c.anniversary).toLocaleDateString('en-IN', { day: '2-digit', month: 'long' })}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-450 font-bold text-xs">No customer anniversaries reported this month.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab content 3: Customer credit ledger */}
      {custTab === 'credit-ledger' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Outstanding Balance Table */}
          <div className="xl:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/85 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-700/30 border-b border-slate-100 dark:border-slate-700 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                    <th className="p-4">Customer Name / Mobile</th>
                    <th className="p-4">Credit Status / limit</th>
                    <th className="p-4 text-right">Owed Debt Balance</th>
                    <th className="p-4">Latest Credit Event</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50 text-xs">
                  {customers.filter(c => c.currentCredit > 0).map(c => {
                    const latestLog = c.creditLedger?.[0];
                    return (
                      <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/10">
                        <td className="p-4">
                          <div className="font-bold text-slate-850 dark:text-slate-100">{c.name}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">📞 +91 {c.mobile}</div>
                        </td>
                        <td className="p-4 font-bold text-slate-500">
                          Limit: ₹{c.creditLimit}
                        </td>
                        <td className="p-4 text-right font-black text-[#8B5CF6]">
                          ₹{c.currentCredit}
                        </td>
                        <td className="p-4">
                          {latestLog ? (
                            <div className="text-[10px]">
                              <span className="font-black text-[#3B82F6]">{latestLog.type}</span>: 
                              <span className="font-bold text-slate-700 dark:text-slate-300 ml-1">₹{latestLog.amount}</span>
                              <div className="text-[9px] text-slate-400 mt-0.5">{latestLog.note}</div>
                            </div>
                          ) : (
                            <span className="text-[9px] text-slate-400">No events logged</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Record credit payment form */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200/85 dark:border-slate-700 shadow-sm space-y-4 h-fit">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Store Credit Controller
            </h3>
            <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
              Record customer credit repayments, or manually debit a custom credit sale.
            </p>

            <form onSubmit={handleCreditReconcile} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Select Debtor Profile</label>
                <select
                  required
                  value={creditMobile}
                  onChange={(e) => setCreditMobile(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border focus:outline-none"
                >
                  <option value="">-- Choose Debtor --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.mobile}>{c.name} (Debt: ₹{c.currentCredit} / Limit: ₹{c.creditLimit})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Reconciliation Type</label>
                  <select
                    value={creditType}
                    onChange={(e) => setCreditType(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border focus:outline-none font-bold"
                  >
                    <option value="Payment Received">💵 Payment Received</option>
                    <option value="Credit Sale">💳 Credit Sale Debit</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="1000"
                    value={creditChange}
                    onChange={(e) => setCreditChange(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border focus:outline-none font-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Transaction Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Paid cash at POS counter, or ledger credit adjustment"
                  value={creditNote}
                  onChange={(e) => setCreditNote(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-slate-850 hover:bg-slate-900 text-white font-extrabold uppercase tracking-widest text-[10px] rounded-xl shadow-lg transition cursor-pointer"
              >
                💾 Process Credit Transaction
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add/Edit Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-xl shadow-2xl border border-slate-100 dark:border-slate-700 p-6 space-y-6">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest font-mono">
                {editMode ? 'Modify Customer Profile' : 'Register Customer Profile'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 dark:text-slate-400 hover:text-slate-500">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Full Customer Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Rajesh Kumar"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">10-Digit Mobile Phone *</label>
                  <input
                    type="text"
                    required
                    maxLength="10"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                    placeholder="9876543210"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="customer@email.com"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Allowed Store Credit Limit (₹)</label>
                  <input
                    type="number"
                    value={creditLimit}
                    onChange={(e) => setCreditLimit(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border focus:outline-none font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Birthday Date</label>
                  <input
                    type="date"
                    value={birthday}
                    onChange={(e) => setBirthday(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Marriage Anniversary Date</label>
                  <input
                    type="date"
                    value={anniversary}
                    onChange={(e) => setAnniversary(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Contact Home Address</label>
                <textarea
                  rows="2"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Sector 15, Chandigarh"
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border focus:outline-none"
                />
              </div>

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
                  className="px-5 py-2.5 bg-[#3B82F6] text-white font-extrabold uppercase tracking-widest rounded-xl hover:bg-blue-600 transition"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
