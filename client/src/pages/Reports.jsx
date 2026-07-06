import React, { useState } from 'react';
import { useSelector } from 'react-redux';

export const Reports = () => {
  const { orders } = useSelector((s) => s.sales);
  const { products } = useSelector((s) => s.products);

  const [reportTab, setReportTab] = useState('sales-summary'); // sales-summary, profit-loss, tax-gst

  // Calculations for periods
  const todayStr = new Date().toISOString().split('T')[0];
  const juneStartStr = '2026-06-01';
  const yearStartStr = '2026-01-01';

  const completedOrders = orders.filter(o => o.status !== 'Returned');

  // Daily
  const dailyOrders = completedOrders.filter(o => o.date.startsWith(todayStr));
  const dailySales = dailyOrders.reduce((sum, o) => sum + o.total, 0);

  // Weekly (June 24 to July 1)
  const weeklyOrders = completedOrders.filter(o => {
    const oDate = o.date.split('T')[0];
    return oDate >= '2026-06-24' && oDate <= '2026-07-01';
  });
  const weeklySales = weeklyOrders.reduce((sum, o) => sum + o.total, 0);

  // Monthly
  const monthlyOrders = completedOrders.filter(o => o.date >= juneStartStr);
  const monthlySales = monthlyOrders.reduce((sum, o) => sum + o.total, 0);

  // Yearly
  const yearlyOrders = completedOrders.filter(o => o.date >= yearStartStr);
  const yearlySales = yearlyOrders.reduce((sum, o) => sum + o.total, 0);

  // Category wise sales breakdown
  const categorySales = {};
  completedOrders.forEach(o => {
    o.items.forEach(item => {
      // Find category of item
      const prod = products.find(p => p.id === item.productId) || {};
      const cat = prod.category || 'Apparel';
      categorySales[cat] = (categorySales[cat] || 0) + (item.discountPrice || item.sellingPrice) * item.qty;
    });
  });

  const catData = Object.entries(categorySales).map(([category, val]) => ({ category, val }));
  const maxCatVal = Math.max(...catData.map(c => c.val), 1000);

  // GST reports
  let totalTaxableValue = 0;
  let totalGstCollected = 0;

  completedOrders.forEach(o => {
    totalGstCollected += o.gst;
    totalTaxableValue += (o.total - o.gst);
  });

  // Profit/Loss margin statements (COGS vs Revenue)
  let totalRevenue = 0;
  let totalCOGS = 0; // Purchase costs

  completedOrders.forEach(o => {
    totalRevenue += o.total;
    o.items.forEach(item => {
      // Match purchase price
      const prod = products.find(p => p.id === item.productId);
      const ccost = prod ? prod.purchasePrice : Math.round((item.discountPrice || item.sellingPrice) * 0.5); // fall back to 50%
      totalCOGS += ccost * item.qty;
    });
  });

  const grossProfit = totalRevenue - totalCOGS;
  const grossProfitMargin = totalRevenue > 0 ? Math.round((grossProfit / totalRevenue) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Sub tabs navigation */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200/85 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex gap-2">
          <button
            onClick={() => setReportTab('sales-summary')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              reportTab === 'sales-summary' 
                ? 'bg-slate-50 text-[#3B82F6] border border-slate-200' 
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700/50'
            }`}
          >
            📊 Sales Breakdown
          </button>
          <button
            onClick={() => setReportTab('profit-loss')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              reportTab === 'profit-loss' 
                ? 'bg-slate-50 text-[#3B82F6] border border-slate-200' 
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700/50'
            }`}
          >
            💸 P&L Margin Statement
          </button>
          <button
            onClick={() => setReportTab('tax-gst')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              reportTab === 'tax-gst' 
                ? 'bg-slate-50 text-[#3B82F6] border border-slate-200' 
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700/50'
            }`}
          >
            📋 GST Tax Collections
          </button>
        </div>
      </div>

      {/* Tab content 1: Sales summaries */}
      {reportTab === 'sales-summary' && (
        <div className="space-y-6">
          {/* Sales summaries cards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-slate-800 border rounded-2xl p-5 shadow-xs">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">Daily revenue</span>
              <span className="text-2xl font-black text-slate-850 dark:text-white mt-1 block">₹{dailySales.toLocaleString('en-IN')}</span>
              <span className="text-[9px] text-slate-500 font-bold block mt-1">Simulated date: July 1st</span>
            </div>
            <div className="bg-white dark:bg-slate-800 border rounded-2xl p-5 shadow-xs">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">Weekly cumulative</span>
              <span className="text-2xl font-black text-slate-850 dark:text-white mt-1 block">₹{weeklySales.toLocaleString('en-IN')}</span>
              <span className="text-[9px] text-slate-500 font-bold block mt-1">Past 7 business days</span>
            </div>
            <div className="bg-white dark:bg-slate-800 border rounded-2xl p-5 shadow-xs">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">Monthly turnover</span>
              <span className="text-2xl font-black text-slate-850 dark:text-white mt-1 block">₹{monthlySales.toLocaleString('en-IN')}</span>
              <span className="text-[9px] text-slate-500 font-bold block mt-1">June - July aggregate</span>
            </div>
            <div className="bg-white dark:bg-slate-800 border rounded-2xl p-5 shadow-xs">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">Yearly projected</span>
              <span className="text-2xl font-black text-slate-850 dark:text-white mt-1 block">₹{yearlySales.toLocaleString('en-IN')}</span>
              <span className="text-[9px] text-slate-500 font-bold block mt-1">FY 2026 calendar year</span>
            </div>
          </div>

          {/* Interactive SVG Bar chart for category breakdown */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200/85 dark:border-slate-700 shadow-sm max-w-3xl space-y-4">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Category-wise Sales Distribution
            </h3>

            <div className="space-y-4 pt-2">
              {catData.map((c, idx) => {
                const percent = Math.round((c.val / maxCatVal) * 100);
                return (
                  <div key={idx} className="space-y-1.5 text-xs">
                    <div className="flex justify-between font-bold">
                      <span className="text-slate-750 dark:text-slate-200">{c.category}</span>
                      <span className="text-slate-900 dark:text-white font-black">₹{c.val.toLocaleString('en-IN')}</span>
                    </div>
                    {/* progress bar */}
                    <div className="w-full bg-slate-50 dark:bg-slate-700 h-3.5 rounded-full overflow-hidden border border-slate-100 dark:border-slate-650">
                      <div
                        className="bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] h-full rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab content 2: P&L Margins Statement */}
      {reportTab === 'profit-loss' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/85 dark:border-slate-700 shadow-sm p-6 max-w-3xl space-y-6">
          <div className="border-b pb-3">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Gross Profit & Loss Account
            </h3>
            <p className="text-[10px] text-slate-400 font-semibold mt-1">
              FY 2026 Cumulative Ledger (June 15th to July 1st)
            </p>
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="flex justify-between font-bold border-b pb-2 text-slate-600 dark:text-slate-400 uppercase tracking-wider text-[10px]">
              <span>Accounting head</span>
              <span>Reconciliation balance</span>
            </div>

            <div className="flex justify-between font-bold">
              <span className="text-slate-700 dark:text-slate-350">Gross Sales Revenue (Net collections)</span>
              <span className="text-slate-900 dark:text-white font-black text-sm">₹{totalRevenue.toLocaleString('en-IN')}</span>
            </div>

            <div className="flex justify-between font-bold text-slate-500">
              <span>Less: Cost of Goods Sold (Fabric / Supply Cost)</span>
              <span>-₹{totalCOGS.toLocaleString('en-IN')}</span>
            </div>

            <div className="flex justify-between font-black text-slate-900 dark:text-white border-t border-dashed pt-4 text-sm">
              <span>Gross Trading Profit</span>
              <span className="text-emerald-600">₹{grossProfit.toLocaleString('en-IN')}</span>
            </div>

            <div className="flex justify-between font-black text-slate-900 dark:text-white border-b pb-4 text-sm">
              <span>Gross Operating Margin (%)</span>
              <span className="text-emerald-600">{grossProfitMargin}%</span>
            </div>
          </div>

          {/* Quick analysis box */}
          <div className="p-4 bg-emerald-50/20 border border-emerald-100 rounded-2xl text-[10px] leading-relaxed text-emerald-800 dark:text-emerald-350 font-bold">
            ✨ Store operating efficiency is highly positive! Average margin tags exceed 40-50% due to optimized procurement from Surat Textile Hub and Vardhman Fabrics.
          </div>
        </div>
      )}

      {/* Tab content 3: GST collected tax returns */}
      {reportTab === 'tax-gst' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/85 dark:border-slate-700 shadow-sm p-6 max-w-3xl space-y-6">
          <div className="border-b pb-3">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
              GST Tax Ledger Summary
            </h3>
            <p className="text-[10px] text-slate-400 font-semibold mt-1">
              Required documentation for GSTR-1 filings.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-slate-50 dark:bg-slate-700/35 border rounded-2xl p-4 text-center">
                <span className="text-[9px] text-slate-450 uppercase font-black tracking-widest block">Net Taxable Value</span>
                <span className="text-lg font-black text-slate-900 dark:text-white mt-1 block">₹{totalTaxableValue.toLocaleString('en-IN')}</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-700/35 border rounded-2xl p-4 text-center">
                <span className="text-[9px] text-slate-450 uppercase font-black tracking-widest block">Collected Output GST</span>
                <span className="text-lg font-black text-[#3B82F6] mt-1 block">₹{totalGstCollected.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="border-t border-dashed pt-4 text-[10px] text-slate-400 font-semibold leading-relaxed">
              ⚠️ GSTR filing instructions: File cumulative output tax of ₹{totalGstCollected} under 5% and 12% apparel tariffs. Make sure input tax credits (ITC) from Vardhman PO vouchers are claimed within deadline.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
