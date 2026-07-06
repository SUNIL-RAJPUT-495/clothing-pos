import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { products } = useSelector((s) => s.products);
  const { orders } = useSelector((s) => s.sales);
  const { customers } = useSelector((s) => s.customers);

  // Compute metrics
  const todayStr = new Date().toISOString().split('T')[0];
  const todayOrders = orders.filter(o => o.date && o.date.startsWith(todayStr) && o.status !== 'Returned');
  const todaySalesVal = todayOrders.reduce((sum, o) => sum + o.total, 0);

  const monthlyOrders = orders.filter(o => o.status !== 'Returned');
  const monthlySalesVal = monthlyOrders.reduce((sum, o) => sum + o.total, 0);

  const totalOrdersCount = orders.length;
  const totalCustomersCount = customers.length;
  const totalProductsCount = products.length;

  const lowStockItems = products.filter(p => p.stockQuantity <= p.reorderLevel);
  const lowStockCount = lowStockItems.length;

  // Best Selling Products calculation
  const productSalesMap = {};
  orders.forEach(o => {
    if (o.status !== 'Returned') {
      o.items.forEach(item => {
        productSalesMap[item.name] = (productSalesMap[item.name] || 0) + item.qty;
      });
    }
  });

  const bestSelling = Object.entries(productSalesMap)
    .map(([name, qty]) => {
      const prod = products.find(p => p.name === name) || {};
      return {
        name,
        qty,
        category: prod.category || 'Apparel',
        sellingPrice: prod.sellingPrice || 0,
        revenue: qty * (prod.discountPrice || prod.sellingPrice || 0)
      };
    })
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  // Group sales by day
  const dailySales = {};
  orders.forEach(o => {
    if (o.status !== 'Returned') {
      const day = o.date.split('T')[0];
      dailySales[day] = (dailySales[day] || 0) + o.total;
    }
  });

  const chartDays = [];
  for (let i = 15; i <= 30; i++) {
    chartDays.push(`2026-06-${i.toString().padStart(2, '0')}`);
  }
  chartDays.push('2026-07-01');

  const chartData = chartDays.map(day => ({
    label: day.split('-')[2] + ' ' + (day.split('-')[1] === '06' ? 'Jun' : 'Jul'),
    value: dailySales[day] || 0
  }));

  const maxVal = Math.max(...chartData.map(d => d.value), 1000);

  // SVG Chart Dimensions
  const chartHeight = 180;
  const chartWidth = 600;
  const paddingLeft = 50;
  const paddingRight = 15;
  const paddingTop = 25;
  const paddingBottom = 25;

  const points = chartData.map((d, index) => {
    const x = paddingLeft + (index / (chartData.length - 1)) * (chartWidth - paddingLeft - paddingRight);
    const y = paddingTop + (1 - d.value / maxVal) * (chartHeight - paddingTop - paddingBottom);
    return { x, y, ...d };
  });

  const polylinePath = points.map(p => `${p.x},${p.y}`).join(' ');
  const areaPath = `${paddingLeft},${chartHeight - paddingBottom} ` + polylinePath + ` ${chartWidth - paddingRight},${chartHeight - paddingBottom}`;

  // Max Sold Quantity for progress visualizer
  const maxSoldQty = Math.max(...bestSelling.map(item => item.qty), 1);

  // Payment badge helper
  const renderPaymentBadge = (method) => {
    const methods = Array.isArray(method) ? method : [{ method }];
    return (
      <div className="flex gap-1 justify-end flex-wrap">
        {methods.map((m, idx) => {
          let color = "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-305";
          if (m.method.toLowerCase().includes('upi') || m.method.toLowerCase().includes('gpay')) {
            color = "bg-blue-500/10 text-[#3B82F6] dark:text-blue-400";
          } else if (m.method.toLowerCase().includes('cash')) {
            color = "bg-emerald-500/10 text-[#10B981] dark:text-emerald-450";
          } else if (m.method.toLowerCase().includes('card')) {
            color = "bg-violet-500/10 text-[#8B5CF6] dark:text-violet-405";
          }
          return (
            <span key={idx} className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md ${color}`}>
              {m.method}
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
        
        {/* Today's Sales */}
        <div className="bg-gradient-to-br from-[#3B82F6] via-[#6366F1] to-[#8B5CF6] rounded-2xl p-5 text-white shadow-lg shadow-blue-500/20 hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 flex flex-col justify-between h-32 relative overflow-hidden group">
          <div className="absolute right-0 bottom-0 opacity-10 translate-x-3 translate-y-3 pointer-events-none group-hover:scale-110 transition-transform duration-500">
            <svg className="w-24 h-24 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeWidth="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex items-center justify-between z-10">
            <span className="text-[9px] uppercase font-black tracking-widest opacity-80">Today's Sales</span>
            <span className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center text-xs shadow-inner">💵</span>
          </div>
          <div className="z-10">
            <div className="text-2xl font-black tracking-tight">₹{todaySalesVal.toLocaleString('en-IN')}</div>
            <div className="text-[8px] font-black mt-1 opacity-90 uppercase tracking-widest bg-white/10 py-0.5 px-2 rounded-md inline-block">
              {todayOrders.length} Invoices Issued
            </div>
          </div>
        </div>

        {/* Monthly Sales */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:scale-[1.02] hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 flex flex-col justify-between h-32 relative overflow-hidden group">
          <div className="absolute right-0 bottom-0 opacity-5 translate-x-3 translate-y-3 pointer-events-none group-hover:scale-110 transition-transform duration-500 text-blue-500">
            <svg className="w-24 h-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[9px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-widest">Monthly Sales</span>
            <span className="w-7 h-7 rounded-xl bg-blue-500/10 text-[#3B82F6] dark:bg-blue-950/20 flex items-center justify-center text-xs">🛍️</span>
          </div>
          <div>
            <div className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">₹{monthlySalesVal.toLocaleString('en-IN')}</div>
            <div className="text-[8px] text-slate-400 dark:text-slate-500 font-extrabold mt-1.5 uppercase tracking-widest">June - July Active</div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:scale-[1.02] hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 flex flex-col justify-between h-32 relative overflow-hidden group">
          <div className="absolute right-0 bottom-0 opacity-5 translate-x-3 translate-y-3 pointer-events-none group-hover:scale-110 transition-transform duration-500 text-violet-500">
            <svg className="w-24 h-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[9px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-widest">Total Orders</span>
            <span className="w-7 h-7 rounded-xl bg-violet-500/10 text-[#8B5CF6] dark:bg-violet-950/20 flex items-center justify-center text-xs">🛒</span>
          </div>
          <div>
            <div className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">{totalOrdersCount}</div>
            <div className="text-[8px] text-slate-400 dark:text-slate-500 font-extrabold mt-1.5 uppercase tracking-widest">Processed Logs</div>
          </div>
        </div>

        {/* Total Customers */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:scale-[1.02] hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 flex flex-col justify-between h-32 relative overflow-hidden group">
          <div className="absolute right-0 bottom-0 opacity-5 translate-x-3 translate-y-3 pointer-events-none group-hover:scale-110 transition-transform duration-500 text-emerald-500">
            <svg className="w-24 h-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[9px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-widest">Total Customers</span>
            <span className="w-7 h-7 rounded-xl bg-emerald-500/10 text-[#10B981] dark:bg-emerald-950/20 flex items-center justify-center text-xs">👥</span>
          </div>
          <div>
            <div className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">{totalCustomersCount}</div>
            <div className="text-[8px] text-slate-400 dark:text-slate-500 font-extrabold mt-1.5 uppercase tracking-widest">Active CRM Entries</div>
          </div>
        </div>

        {/* Total Products */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:scale-[1.02] hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 flex flex-col justify-between h-32 relative overflow-hidden group">
          <div className="absolute right-0 bottom-0 opacity-5 translate-x-3 translate-y-3 pointer-events-none group-hover:scale-110 transition-transform duration-500 text-blue-500">
            <svg className="w-24 h-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[9px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-widest">Total Products</span>
            <span className="w-7 h-7 rounded-xl bg-blue-500/10 text-[#3B82F6] dark:bg-blue-950/20 flex items-center justify-center text-xs">📦</span>
          </div>
          <div>
            <div className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">{totalProductsCount}</div>
            <div className="text-[8px] text-slate-400 dark:text-slate-500 font-extrabold mt-1.5 uppercase tracking-widest">SKUs & Collections</div>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className={`rounded-2xl p-5 border hover:scale-[1.02] hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col justify-between h-32 relative overflow-hidden group ${
          lowStockCount > 0 
            ? 'bg-amber-500/5 dark:bg-amber-950/10 border-amber-500/30 text-amber-800 dark:text-amber-400' 
            : 'bg-white dark:bg-slate-900 border-slate-200/60 dark:border-slate-800 text-slate-900 dark:text-white'
        }`}
        onClick={() => navigate('/admin/inventory')}>
          <div className="flex items-center justify-between">
            <span className="text-[9px] uppercase font-black tracking-widest opacity-80">Low Stock items</span>
            <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs ${
              lowStockCount > 0 ? 'bg-amber-500/20 text-amber-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
            }`}>⚠️</span>
          </div>
          <div>
            <div className="text-2xl font-black tracking-tight">{lowStockCount}</div>
            <div className={`text-[8px] font-black uppercase mt-1.5 tracking-widest ${
              lowStockCount > 0 ? 'text-amber-600 dark:text-amber-400 animate-pulse' : 'text-slate-400'
            }`}>
              {lowStockCount > 0 ? 'Needs Attention' : 'Inventory Healthy'}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Chart & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sales / Profit Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Performance analytics</span>
              <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                Sales Revenue Trend
              </h2>
            </div>
            <span className="text-[8px] font-black text-slate-455 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700">
              Last 15 Days
            </span>
          </div>

          <div className="w-full">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto overflow-visible">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.18" />
                  <stop offset="50%" stopColor="#6366F1" stopOpacity="0.05" />
                  <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.00" />
                </linearGradient>
                <linearGradient id="chartLineGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="50%" stopColor="#6366F1" />
                  <stop offset="100%" stopColor="#8B5CF6" />
                </linearGradient>
                <filter id="glow" x="-10%" y="-10%" width="120%" height="120%">
                  <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#3B82F6" floodOpacity="0.35" />
                </filter>
              </defs>

              {/* Grid Lines */}
              <line x1={paddingLeft} y1={paddingTop} x2={chartWidth - paddingRight} y2={paddingTop} stroke="#e2e8f0" strokeDasharray="4,4" className="dark:stroke-slate-850" strokeWidth="0.8" />
              <line x1={paddingLeft} y1={(chartHeight - paddingBottom + paddingTop) / 2} x2={chartWidth - paddingRight} y2={(chartHeight - paddingBottom + paddingTop) / 2} stroke="#e2e8f0" strokeDasharray="4,4" className="dark:stroke-slate-850" strokeWidth="0.8" />
              <line x1={paddingLeft} y1={chartHeight - paddingBottom} x2={chartWidth - paddingRight} y2={chartHeight - paddingBottom} stroke="#e2e8f0" className="dark:stroke-slate-800" strokeWidth="1" />

              {/* Y Axis Labels */}
              <text x={paddingLeft - 10} y={paddingTop + 3} textAnchor="end" className="text-[8px] font-black fill-slate-400 dark:fill-slate-500 font-mono">
                ₹{Math.round(maxVal).toLocaleString('en-IN')}
              </text>
              <text x={paddingLeft - 10} y={(chartHeight - paddingBottom + paddingTop) / 2 + 3} textAnchor="end" className="text-[8px] font-black fill-slate-400 dark:fill-slate-500 font-mono">
                ₹{Math.round(maxVal / 2).toLocaleString('en-IN')}
              </text>
              <text x={paddingLeft - 10} y={chartHeight - paddingBottom + 3} textAnchor="end" className="text-[8px] font-black fill-slate-400 dark:fill-slate-500 font-mono">
                ₹0
              </text>

              {/* Area Path */}
              <path d={areaPath} fill="url(#chartGradient)" />

              {/* Line Path */}
              <polyline fill="none" stroke="url(#chartLineGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={polylinePath} filter="url(#glow)" />

              {/* Data Points */}
              {points.map((p, idx) => (
                <g key={idx} className="group cursor-pointer">
                  <circle cx={p.x} cy={p.y} r="3" fill="#ffffff" stroke="url(#chartLineGrad)" strokeWidth="2.5" className="transition-all duration-200 hover:r-4" />
                  <circle cx={p.x} cy={p.y} r="8" fill="transparent" />
                  
                  <g className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none">
                    <rect x={p.x - 35} y={p.y - 25} width="70" height="17" rx="5" fill="#0f172a" className="shadow-lg" />
                    <text x={p.x} y={p.y - 14} textAnchor="middle" fill="#ffffff" className="text-[8px] font-black font-mono">
                      ₹{p.value.toLocaleString('en-IN')}
                    </text>
                  </g>
                </g>
              ))}

              {/* X Axis Labels */}
              {chartData.map((d, index) => {
                if (index % 2 !== 0 && index !== chartData.length - 1) return null;
                const x = paddingLeft + (index / (chartData.length - 1)) * (chartWidth - paddingLeft - paddingRight);
                return (
                  <text key={index} x={x} y={chartHeight - paddingBottom + 14} textAnchor="middle" className="text-[7px] font-black fill-slate-400 dark:fill-slate-555 uppercase tracking-wider">
                    {d.label}
                  </text>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Low Stock Notifications Panel */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col mb-4">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Urgent alerts</span>
              <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                Low Stock Warnings
              </h2>
            </div>
            
            <div className="space-y-2.5 max-h-[180px] overflow-y-auto pr-1 no-scrollbar scrollbar-none">
              {lowStockItems.length > 0 ? (
                lowStockItems.map(p => (
                  <div key={p.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 rounded-xl hover:border-slate-200 dark:hover:border-slate-700 transition duration-200">
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-855 dark:text-slate-200 truncate">{p.name}</div>
                      <div className="text-[9px] font-black font-mono text-slate-400 dark:text-slate-500 mt-0.5 uppercase tracking-wider">{p.sku}</div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-3">
                      <span className="text-[9px] font-black text-amber-600 bg-amber-500/10 px-2.5 py-1 rounded-lg">
                        {p.stockQuantity} Left
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-slate-400 dark:text-slate-550 font-bold text-xs">
                  ✨ Inventory levels are fully stocked.
                </div>
              )}
            </div>
          </div>
          
          <button 
            onClick={() => navigate('/admin/inventory')}
            className="w-full mt-4 py-3 bg-slate-50 dark:bg-slate-800 hover:bg-gradient-to-r hover:from-[#3B82F6] hover:to-[#8B5CF6] hover:text-white border border-slate-250 dark:border-slate-700 dark:hover:border-transparent rounded-xl text-[9px] font-black text-slate-655 dark:text-slate-350 uppercase tracking-widest transition-all duration-300 cursor-pointer shadow-xs active:scale-98"
          >
            Open Inventory Ledger
          </button>
        </div>
      </div>

      {/* Grid: Best Sellers & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Best Selling Products */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800 shadow-xs">
          <div className="flex flex-col mb-4">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Catalog stars</span>
            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Best Selling Products
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th className="pb-3 text-[9px] font-black text-slate-455 dark:text-slate-500 uppercase tracking-widest">Garment Name</th>
                  <th className="pb-3 text-[9px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-widest">Category</th>
                  <th className="pb-3 text-[9px] font-black text-slate-455 dark:text-slate-500 uppercase tracking-widest text-right">Sales volume</th>
                  <th className="pb-3 text-[9px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-widest text-right">Gross revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-xs">
                {bestSelling.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 pr-2">
                      <span className="font-extrabold text-slate-855 dark:text-slate-200">{item.name}</span>
                      {/* Visual progress bar */}
                      <div className="w-32 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] h-full rounded-full" 
                          style={{ width: `${(item.qty / maxSoldQty) * 100}%` }}
                        />
                      </div>
                    </td>
                    <td className="py-3.5 text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{item.category}</td>
                    <td className="py-3.5 font-black text-slate-700 dark:text-slate-300 text-right">{item.qty} Pcs</td>
                    <td className="py-3.5 font-black text-slate-900 dark:text-white text-right">₹{item.revenue.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800 shadow-xs">
          <div className="flex flex-col mb-4">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Billing records</span>
            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Recent Invoices Log
            </h2>
          </div>
          
          <div className="space-y-3">
            {orders.slice(-4).reverse().map((o) => (
              <div key={o.id} className="flex items-center justify-between p-3.5 bg-slate-50/40 dark:bg-slate-900/10 border border-slate-100 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-xl transition duration-200 hover:border-slate-200 dark:hover:border-slate-700">
                <div className="min-w-0 pr-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-900 dark:text-white">{o.id}</span>
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md ${
                      o.status === 'Returned' 
                        ? 'bg-slate-500/10 text-slate-500 dark:text-slate-400' 
                        : 'bg-emerald-500/10 text-[#10B981]'
                    }`}>
                      {o.status}
                    </span>
                  </div>
                  <div className="text-[10px] font-semibold text-slate-400 dark:text-slate-505 mt-1 truncate">
                    {o.customerName} ({o.customerMobile}) • {new Date(o.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-xs font-black text-slate-900 dark:text-white font-mono">
                    ₹{o.total.toLocaleString('en-IN')}
                  </div>
                  <div className="mt-1">
                    {renderPaymentBadge(o.paymentMethod)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
