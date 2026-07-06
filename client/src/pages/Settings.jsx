import React, { useState, useEffect } from 'react';

export const Settings = () => {
  const [storeName, setStoreName] = useState('');
  const [storeAddress, setStoreAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [gstin, setGstin] = useState('');
  const [gstRate, setGstRate] = useState(12);

  // UI state
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'success' | 'error', text: '' }

  const API_URL = 'http://localhost:5000/api/settings';

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      if (data.success && data.settings) {
        setStoreName(data.settings.storeName || '');
        setStoreAddress(data.settings.storeAddress || '');
        setPhone(data.settings.phone || '');
        setEmail(data.settings.email || '');
        setGstin(data.settings.gstin || '');
        setGstRate(data.settings.gstRate !== undefined ? data.settings.gstRate : 12);
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to load settings.' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Connection to server failed.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const token = localStorage.getItem('accessToken');
    try {
      const response = await fetch(API_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          storeName,
          storeAddress,
          phone,
          email,
          gstin,
          gstRate: Number(gstRate),
        }),
      });

      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Store settings saved successfully!' });
        // Auto fade out message after 3 seconds
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to update settings.' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Server connection failed.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Title Header */}
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-widest">
          ⚙️ Store Settings
        </h2>
        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">
          Configure boutique profile and billing defaults
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl border text-xs font-bold transition-all duration-300 flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400'
          }`}
        >
          <span>{message.type === 'success' ? '✔' : '⚠️'}</span>
          <span>{message.text}</span>
        </div>
      )}

      {loading ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200/85 dark:border-slate-700 shadow-sm flex flex-col items-center justify-center min-h-[300px]">
          <div className="w-8 h-8 rounded-full border-4 border-slate-100 border-t-[#3B82F6] animate-spin mb-4" />
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Settings...</div>
        </div>
      ) : (
        <form onSubmit={handleSave} className="bg-white dark:bg-slate-800 rounded-2xl p-6 md:p-8 border border-slate-200/85 dark:border-slate-700 shadow-sm space-y-6">
          <div className="border-b dark:border-slate-700 pb-4">
            <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">Boutique Information</h3>
            <p className="text-[10px] text-slate-400 font-semibold mt-1">This details appear on POS billing invoice templates and communication templates.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Store Name */}
            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">
                Boutique / Store Name *
              </label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="Classic Wardrobes Ltd."
                className="w-full px-4 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-900/30 border-slate-200/60 dark:border-slate-700 focus:outline-none focus:border-[#3B82F6] text-xs text-slate-800 dark:text-slate-150 font-semibold"
              />
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">
                Contact Phone / Mobile No. *
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="9876543210"
                className="w-full px-4 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-900/30 border-slate-200/60 dark:border-slate-700 focus:outline-none focus:border-[#3B82F6] text-xs text-slate-800 dark:text-slate-150 font-semibold"
              />
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">
                Store Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="billing@boutique.com"
                className="w-full px-4 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-900/30 border-slate-200/60 dark:border-slate-700 focus:outline-none focus:border-[#3B82F6] text-xs text-slate-800 dark:text-slate-150 font-semibold"
              />
            </div>

            {/* GSTIN */}
            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">
                GSTIN / Tax Registration No.
              </label>
              <input
                type="text"
                value={gstin}
                onChange={(e) => setGstin(e.target.value)}
                placeholder="07AAAAA1111A1Z1"
                className="w-full px-4 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-900/30 border-slate-200/60 dark:border-slate-700 focus:outline-none focus:border-[#3B82F6] text-xs text-slate-800 dark:text-slate-150 font-semibold font-mono"
              />
            </div>

            {/* Store-wide GST Rate */}
            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">
                Default Store GST Rate (%) *
              </label>
              <input
                type="number"
                required
                value={gstRate}
                onChange={(e) => setGstRate(e.target.value)}
                placeholder="12"
                min="0"
                max="100"
                className="w-full px-4 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-900/30 border-slate-200/60 dark:border-slate-700 focus:outline-none focus:border-[#3B82F6] text-xs text-slate-800 dark:text-slate-150 font-semibold"
              />
            </div>
          </div>

          {/* Store Location */}
          <div>
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">
              Store Location / Address *
            </label>
            <textarea
              required
              rows="3"
              value={storeAddress}
              onChange={(e) => setStoreAddress(e.target.value)}
              placeholder="Shop No. 101, First Floor, Mall of India, New Delhi"
              className="w-full p-4 rounded-xl border bg-slate-50 dark:bg-slate-900/30 border-slate-200/60 dark:border-slate-700 focus:outline-none focus:border-[#3B82F6] text-xs text-slate-800 dark:text-slate-150 font-semibold"
            />
          </div>



          {/* Submit Actions */}
          <div className="border-t dark:border-slate-700 pt-6 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] text-white font-extrabold uppercase tracking-widest text-[10px] rounded-xl shadow-lg shadow-blue-500/10 hover:opacity-95 transition-all duration-200 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Saving...
                </>
              ) : (
                '💾 Save Store Settings'
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Settings;
