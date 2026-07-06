import React, { useState } from 'react';
import { useSelector } from 'react-redux';

export const WhatsAppSimulator = () => {
  const { customers } = useSelector((s) => s.customers);
  const { stitchingOrders } = useSelector((s) => s.stitching);

  // States
  const [waTab, setWaTab] = useState('campaigns'); // campaigns, delivery-updates, live-chat
  const [promoTemplate, setPromoTemplate] = useState('monsoon-sale'); // monsoon-sale, loyalty-gift
  const [selectedMobile, setSelectedMobile] = useState('');

  // Live Chat state mockup
  const [chatLog, setChatLog] = useState([
    { sender: 'customer', text: 'Hello, is my Ruby Red silk kurti altered and ready for pick-up?', time: '11:20 AM' },
    { sender: 'agent', text: 'Hi Simran! Let me check that status card in our tailor board for you.', time: '11:22 AM' },
    { sender: 'agent', text: 'Yes, Master Ramesh completed the side fittings! It is marked Ready for Delivery.', time: '11:23 AM' },
    { sender: 'customer', text: 'Perfect! I will come collect it this evening. Thank you.', time: '11:25 AM' }
  ]);
  const [typedMsg, setTypedMsg] = useState('');

  // Send promo campaign simulation
  const handleSendCampaign = () => {
    let msgCount = 0;
    customers.forEach(c => {
      if (c.mobile) msgCount++;
    });
    alert(`[WhatsApp API Simulated] Bulk promotional campaign broadcast successfully pushed to ${msgCount} active customers!`);
  };

  // Send stitching status simulation
  const handleSendUpdate = (order) => {
    const text = `🧵 *Downtown Apparels Alteration Alert* 🧵\n\nDear ${order.customerName},\nYour work order *${order.id}* for (${order.items}) is currently: *${order.status}*.\n\nAssigned Tailor: ${order.tailorName}\nScheduled pickup date: ${new Date(order.deliveryDate).toLocaleDateString()}\nOutstanding dues: ₹${order.charges}\n\nWe look forward to serving you!`;
    alert(`[WhatsApp API Simulated] Delivery update dispatched to client +91 ${order.customerMobile}:\n\n${text}`);
  };

  // Live chat send reply
  const handleSendChatReply = (e) => {
    e.preventDefault();
    if (!typedMsg) return;

    setChatLog([
      ...chatLog,
      { sender: 'agent', text: typedMsg, time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) }
    ]);
    setTypedMsg('');

    // Trigger mock auto-reply from customer after a short delay
    setTimeout(() => {
      setChatLog(prev => [
        ...prev,
        { sender: 'customer', text: 'Got it, thank you for the prompt support! 👍', time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) }
      ]);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Tab select bar */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200/85 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex gap-2">
          <button
            onClick={() => setWaTab('campaigns')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              waTab === 'campaigns' 
                ? 'bg-slate-50 text-[#3B82F6] border border-slate-200' 
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700/50'
            }`}
          >
            📢 Promo Broadcasts
          </button>
          <button
            onClick={() => setWaTab('delivery-updates')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              waTab === 'delivery-updates' 
                ? 'bg-slate-50 text-[#3B82F6] border border-slate-200' 
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700/50'
            }`}
          >
            🧵 Stitching Notifications
          </button>
          <button
            onClick={() => setWaTab('live-chat')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              waTab === 'live-chat' 
                ? 'bg-slate-50 text-[#3B82F6] border border-slate-200' 
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700/50'
            }`}
          >
            💬 Support Live Chat Mock
          </button>
        </div>
      </div>

      {/* Tab 1: Promo broadcasts */}
      {waTab === 'campaigns' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/85 dark:border-slate-700 shadow-sm p-6 max-w-3xl space-y-6">
          <div className="border-b pb-3">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Promotional Marketing Campaign
            </h3>
            <p className="text-[10px] text-slate-400 font-semibold mt-1">
              Send personalized bulk WhatsApp templates to all customer contact lists.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Choose Campaign Template</label>
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center gap-2 cursor-pointer p-3 border rounded-xl bg-slate-50 dark:bg-slate-700/30">
                  <input
                    type="radio"
                    name="promo-temp"
                    checked={promoTemplate === 'monsoon-sale'}
                    onChange={() => setPromoTemplate('monsoon-sale')}
                    className="accent-[#3B82F6]"
                  />
                  <div>
                    <div className="font-bold text-slate-850 dark:text-slate-200">Monsoon Denim Discount</div>
                    <div className="text-[9px] text-slate-400 font-normal">Flat 20% off denim range</div>
                  </div>
                </label>
                <label className="flex items-center gap-2 cursor-pointer p-3 border rounded-xl bg-slate-50 dark:bg-slate-700/30">
                  <input
                    type="radio"
                    name="promo-temp"
                    checked={promoTemplate === 'loyalty-gift'}
                    onChange={() => setPromoTemplate('loyalty-gift')}
                    className="accent-[#3B82F6]"
                  />
                  <div>
                    <div className="font-bold text-slate-850 dark:text-slate-200">Loyalty Points Gift</div>
                    <div className="text-[9px] text-slate-400 font-normal">Double points on silk purchases</div>
                  </div>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5 font-mono">Broadcast Text Preview</label>
              <textarea
                readOnly
                rows="6"
                value={promoTemplate === 'monsoon-sale' 
                  ? `🌦️ *Downtown Apparels Monsoon Denim Special* 🌦️\n\nDear [Name],\nGet ready for the rains with our premium denim fit range! Present this message at billing counter connectivity and claim *FLAT 20% OFF* our entire Jeans range.\n\nBrowse catalog: https://clothingpos.com/denim-catalog\n\nValid till July 15th, 2026. T&C apply.`
                  : `🎁 *Downtown Apparels Loyalty Gift Alert* 🎁\n\nHi [Name],\nWe value your loyalty! Earn *DOUBLE REWARD POINTS* on all custom stitching and silk kurti orders booked this week.\n\nCheck your current loyalty balance: https://clothingpos.com/loyalty/${customers[0]?.mobile || '9876543210'}`}
                className="w-full p-3 bg-slate-50 dark:bg-slate-700/50 border font-mono text-[10px] rounded-xl focus:outline-none"
              />
            </div>

            <button
              onClick={handleSendCampaign}
              className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold uppercase tracking-widest text-[10px] rounded-xl shadow-lg transition cursor-pointer"
            >
              🚀 Broadcast to {customers.length} Customers
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Stitching notifications updates */}
      {waTab === 'delivery-updates' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/85 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="p-4 border-b">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Stitching Status Alerts Dispatcher
            </h3>
            <p className="text-[10px] text-slate-400 font-semibold mt-1">
              Notify customers about alteration completions or delivery date changes directly.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-700/30 border-b border-slate-100 dark:border-slate-700 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                  <th className="p-4">Customer Name / Mobile</th>
                  <th className="p-4">Garment Job Details</th>
                  <th className="p-4">Tailoring Status</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50 text-xs">
                {stitchingOrders.map(o => (
                  <tr key={o.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/10">
                    <td className="p-4">
                      <div className="font-bold text-slate-850 dark:text-slate-100">{o.customerName}</div>
                      <div className="text-[10px] text-slate-400 font-semibold mt-0.5">📞 +91 {o.customerMobile}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-700 dark:text-slate-350">{o.items}</div>
                      <div className="text-[9px] text-slate-400 mt-0.5">ID: {o.id} | Delivery: {o.deliveryDate}</div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded font-black text-[9px] bg-slate-100 dark:bg-slate-700 text-slate-500 uppercase tracking-wider">
                        {o.status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleSendUpdate(o)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-black text-[9px] uppercase tracking-wider transition cursor-pointer"
                      >
                        💬 Send WhatsApp Status
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Support chat widget simulator */}
      {waTab === 'live-chat' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/85 dark:border-slate-700 shadow-sm flex flex-col h-[480px] overflow-hidden max-w-xl">
          {/* Chat header */}
          <div className="bg-emerald-600 p-4 text-white flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white text-emerald-600 flex items-center justify-center font-bold text-sm">SK</div>
              <div>
                <h4 className="font-black text-xs">Simran Kaur (+91 99887 76655)</h4>
                <p className="text-[9px] text-emerald-100 font-semibold">Online • Customer Support Chat</p>
              </div>
            </div>
            <span className="text-lg">💬</span>
          </div>

          {/* Chat Area log */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#e5ddd5] dark:bg-slate-900 no-scrollbar scrollbar-none">
            {chatLog.map((c, i) => (
              <div
                key={i}
                className={`max-w-[75%] p-3 rounded-xl text-xs space-y-1 ${
                  c.sender === 'customer' 
                    ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 self-start mr-auto' 
                    : 'bg-emerald-100 dark:bg-emerald-950/40 text-slate-800 dark:text-slate-200 self-end ml-auto'
                }`}
              >
                <div>{c.text}</div>
                <div className="text-[8px] text-slate-400 font-semibold text-right">{c.time}</div>
              </div>
            ))}
          </div>

          {/* Input control box */}
          <form onSubmit={handleSendChatReply} className="p-3 border-t bg-slate-50 dark:bg-slate-850 flex gap-2 flex-shrink-0">
            <input
              type="text"
              placeholder="Type your WhatsApp reply..."
              value={typedMsg}
              onChange={(e) => setTypedMsg(e.target.value)}
              className="flex-grow px-4 py-2.5 rounded-xl border bg-white dark:bg-slate-700 focus:outline-none text-xs"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold uppercase text-xs rounded-xl cursor-pointer"
            >
              Reply
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default WhatsAppSimulator;
