import React, { useState, useEffect } from 'react';

export const Payments = () => {
  // Statistics States
  const [stats, setStats] = useState({ cash: 0, upi: 0, card: 0, wallet: 0, mixed: 0 });
  const [loadingStats, setLoadingStats] = useState(false);

  // Gateway Settings States
  const [gatewayEnabled, setGatewayEnabled] = useState(false);
  const [gatewayToken, setGatewayToken] = useState('');
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  // Status message
  const [message, setMessage] = useState(null); // { type: 'success' | 'error', text: '' }

  const SETTINGS_API = 'http://localhost:5000/api/settings';
  const STATS_API = 'http://localhost:5000/api/cart/payment-stats';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoadingStats(true);
    setLoadingSettings(true);
    const token = localStorage.getItem('accessToken');
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };

    try {
      // 1. Fetch Payment Stats
      const statsRes = await fetch(STATS_API, { headers });
      const statsData = await statsRes.json();
      if (statsData.success && statsData.stats) {
        setStats(statsData.stats);
      }

      // 2. Fetch Gateway Settings
      const settingsRes = await fetch(SETTINGS_API);
      const settingsData = await settingsRes.json();
      if (settingsData.success && settingsData.settings) {
        setGatewayEnabled(settingsData.settings.imbGatewayEnabled || false);
        setGatewayToken(settingsData.settings.imbGatewayToken || '');
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Error connecting to the backend server.' });
    } finally {
      setLoadingStats(false);
      setLoadingSettings(false);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    setMessage(null);

    const token = localStorage.getItem('accessToken');
    try {
      const response = await fetch(SETTINGS_API, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          imbGatewayEnabled: gatewayEnabled,
          imbGatewayToken: gatewayToken,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Gateway configuration updated successfully!' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to update settings.' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Server connection failed.' });
    } finally {
      setSavingSettings(false);
    }
  };

  const totalPayments = stats.cash + stats.upi + stats.card + stats.wallet + stats.mixed;

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-widest">
          💳 Payments & Gateways
        </h2>
        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">
          Real-time transaction earnings and payment gateway credentials
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl border text-xs font-bold transition-all duration-300 flex items-center gap-2 max-w-4xl ${
            message.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400'
          }`}
        >
          <span>{message.type === 'success' ? '✔' : '⚠️'}</span>
          <span>{message.text}</span>
        </div>
      )}

      {/* Main Grid: Statistics vs Configurations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        
        {/* Left Side: Real-time payments ledger split */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/85 dark:border-slate-700 shadow-sm p-6 space-y-6">
          <div className="border-b dark:border-slate-700 pb-3">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Payments Summary
            </h3>
            <p className="text-[10px] text-slate-400 font-semibold mt-1">
              Sales revenue split collected from completed POS billing checkouts.
            </p>
          </div>

          {loadingStats ? (
            <div className="flex flex-col items-center justify-center min-h-[200px]">
              <div className="w-6 h-6 rounded-full border-4 border-slate-100 border-t-[#3B82F6] animate-spin mb-2" />
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Loading Stats...</div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Cash Earnings Card */}
              <div className="p-4 bg-slate-50 dark:bg-slate-900/30 border dark:border-transparent rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-lg font-bold">
                    💵
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">Cash Register</h4>
                    <p className="text-[9px] text-slate-400 font-semibold uppercase mt-0.5">Physical Store Cash</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-base font-black text-slate-900 dark:text-white">
                    ₹{stats.cash.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* UPI Earnings Card */}
              <div className="p-4 bg-slate-50 dark:bg-slate-900/30 border dark:border-transparent rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#3B82F6]/10 text-[#3B82F6] flex items-center justify-center text-lg font-bold">
                    📱
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">UPI / QR Codes</h4>
                    <p className="text-[9px] text-slate-400 font-semibold uppercase mt-0.5">Digital Phone Payments</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-base font-black text-slate-900 dark:text-white">
                    ₹{stats.upi.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Summary Totals */}
              <div className="border-t border-dashed dark:border-slate-700 pt-4 flex items-center justify-between px-2">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Total POS Sales (Cash + UPI)
                </div>
                <div className="text-lg font-black text-[#3B82F6]">
                  ₹{(stats.cash + stats.upi).toLocaleString()}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: IMB Gateway settings credentials */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/85 dark:border-slate-700 shadow-sm p-6 flex flex-col justify-between">
          <form onSubmit={handleSaveSettings} className="space-y-6">
            <div className="border-b dark:border-slate-700 pb-3">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                IMB Payment Gateway Settings
              </h3>
              <p className="text-[10px] text-slate-400 font-semibold mt-1">
                Configure credentials for online/direct credit card integrations.
              </p>
            </div>

            {loadingSettings ? (
              <div className="flex flex-col items-center justify-center min-h-[150px]">
                <div className="w-6 h-6 rounded-full border-4 border-slate-100 border-t-[#3B82F6] animate-spin mb-2" />
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Loading Configuration...</div>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Gateway Toggle Switch Option */}
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/30 border dark:border-transparent rounded-2xl">
                  <div>
                    <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">Enable IMB Gateway</h4>
                    <p className="text-[9px] text-slate-400 font-semibold uppercase mt-0.5">Toggle card payment API active</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={gatewayEnabled}
                      onChange={(e) => setGatewayEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-350 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#3B82F6]" />
                  </label>
                </div>

                {/* Gateway Token Input */}
                <div className={`${gatewayEnabled ? 'opacity-100' : 'opacity-50 pointer-events-none'} transition-opacity duration-200`}>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">
                    IMB Gateway Token Key
                  </label>
                  <input
                    type="password"
                    disabled={!gatewayEnabled}
                    value={gatewayToken}
                    onChange={(e) => setGatewayToken(e.target.value)}
                    placeholder="Enter security token key..."
                    className="w-full px-4 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-900/30 border-slate-200/60 dark:border-slate-700 focus:outline-none focus:border-[#3B82F6] text-xs text-slate-800 dark:text-slate-150 font-semibold font-mono"
                  />
                </div>
              </div>
            )}

            <div className="border-t dark:border-slate-700 pt-5 flex justify-end">
              <button
                type="submit"
                disabled={savingSettings || loadingSettings}
                className="px-5 py-2.5 bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] text-white font-extrabold uppercase tracking-widest text-[9px] rounded-xl shadow-lg hover:opacity-95 transition-opacity duration-150 disabled:opacity-50 cursor-pointer"
              >
                {savingSettings ? 'Saving...' : '💾 Update Gateway Settings'}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Payments;
