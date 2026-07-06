import React, { useState, useEffect } from 'react';

export const Shipping = () => {
  // Shipping Settings States
  const [shippingCharge, setShippingCharge] = useState(100);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(2000);
  const [allowStorePickup, setAllowStorePickup] = useState(true);
  const [shippingCarrier, setShippingCarrier] = useState('Local Courier');

  // UI state
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'success' | 'error', text: '' }

  const API_URL = 'http://localhost:5000/api/settings';

  useEffect(() => {
    fetchShippingSettings();
  }, []);

  const fetchShippingSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      if (data.success && data.settings) {
        setShippingCharge(data.settings.shippingCharge !== undefined ? data.settings.shippingCharge : 100);
        setFreeShippingThreshold(data.settings.freeShippingThreshold !== undefined ? data.settings.freeShippingThreshold : 2000);
        setAllowStorePickup(data.settings.allowStorePickup !== undefined ? data.settings.allowStorePickup : true);
        setShippingCarrier(data.settings.shippingCarrier || 'Local Courier');
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to load settings.' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Error connecting to the backend server.' });
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
          shippingCharge: Number(shippingCharge),
          freeShippingThreshold: Number(freeShippingThreshold),
          allowStorePickup,
          shippingCarrier,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Shipping configurations saved successfully!' });
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
          🚚 Shipping Settings
        </h2>
        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">
          Configure delivery rates, free thresholds, and store pickup options
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
            <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">Delivery Rates & Configurations</h3>
            <p className="text-[10px] text-slate-400 font-semibold mt-1">Configure parameters for calculating flat delivery rates and shipping details.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Shipping Charge */}
            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">
                Default Flat Shipping Fee (₹) *
              </label>
              <input
                type="number"
                required
                min="0"
                value={shippingCharge}
                onChange={(e) => setShippingCharge(e.target.value)}
                placeholder="100"
                className="w-full px-4 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-900/30 border-slate-200/60 dark:border-slate-700 focus:outline-none focus:border-[#3B82F6] text-xs text-slate-800 dark:text-slate-150 font-bold"
              />
            </div>

            {/* Free Shipping Threshold */}
            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">
                Free Delivery Threshold Level (₹) *
              </label>
              <input
                type="number"
                required
                min="0"
                value={freeShippingThreshold}
                onChange={(e) => setFreeShippingThreshold(e.target.value)}
                placeholder="2000"
                className="w-full px-4 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-900/30 border-slate-200/60 dark:border-slate-700 focus:outline-none focus:border-[#3B82F6] text-xs text-slate-800 dark:text-slate-150 font-bold"
              />
            </div>

            {/* Preferred Carrier */}
            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">
                Preferred Courier Carrier Partner
              </label>
              <select
                value={shippingCarrier}
                onChange={(e) => setShippingCarrier(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-900/30 border-slate-200/60 dark:border-slate-700 focus:outline-none focus:border-[#3B82F6] text-xs text-slate-500 font-extrabold"
              >
                <option value="Local Courier">Local Courier Partner</option>
                <option value="Blue Dart">Blue Dart Express</option>
                <option value="DTDC">DTDC Courier</option>
                <option value="Self Delivery">Store Self-Delivery Fleet</option>
              </select>
            </div>

            {/* Store Pickup Toggle */}
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/30 border dark:border-transparent rounded-2xl">
              <div>
                <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">Allow Store Pickups</h4>
                <p className="text-[9px] text-slate-400 font-semibold uppercase mt-0.5">Enable client self-collection</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowStorePickup}
                  onChange={(e) => setAllowStorePickup(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-350 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#3B82F6]" />
              </label>
            </div>
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
                '💾 Save Shipping Settings'
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Shipping;
