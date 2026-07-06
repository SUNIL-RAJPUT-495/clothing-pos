import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { completeSale, holdBill, resumeBill, deleteHeldBill, processReturnOrExchange } from '../store/slices/salesSlice';
import { updateStock } from '../store/slices/productSlice';
import { addLoyaltyPoints, addCustomer, deductLoyaltyPoints } from '../store/slices/customerSlice';
import Barcode from '../utils/barcode';
import QRCode from '../utils/qrcode';

const getProductIcon = (name = "") => {
  const n = name.toLowerCase();
  const size = "w-10 h-10 text-[#3B82F6]/80 dark:text-[#3B82F6] group-hover:scale-110 transition-transform duration-300";
  if (n.includes('shirt') || n.includes('tshirt') || n.includes('top') || n.includes('kurti') || n.includes('wear')) {
    return (
      <svg className={size} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h10M4 9v4c0 1 1 2 2 2h1v4c0 1 1 2 2 2h6c1 0 2-1 2-2v-4h1c1 0 2-1 2-2V9m-8-2v3m-3-3l3 3 3-3" />
      </svg>
    );
  }
  if (n.includes('pant') || n.includes('jeans') || n.includes('trouser') || n.includes('lower') || n.includes('skirt') || n.includes('pajama')) {
    return (
      <svg className={size} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 4h8l2 16h-4l-2-10-2 10H6L8 4z" />
      </svg>
    );
  }
  return (
    <svg className={size} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2a3 3 0 0 0-3 3h6a3 3 0 0 0-3-3z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 16V10a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v12" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 16h10" />
    </svg>
  );
};

export const POS = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redux Slices
  const { products, categories } = useSelector((s) => s.products);
  const { heldBills, coupons, orders } = useSelector((s) => s.sales);
  const { customers } = useSelector((s) => s.customers);

  // Cart State
  const [cart, setCart] = useState([]);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  // Customer State
  const [customerMobile, setCustomerMobile] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [showAddCustomerForm, setShowAddCustomerForm] = useState(false);
  const [redeemPoints, setRedeemPoints] = useState(false);

  // Filter Catalog States
  const [catalogSearch, setCatalogSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('');

  // Store settings for dynamic GST Rate and headers
  const [storeSettings, setStoreSettings] = useState(null);

  useEffect(() => {
    const fetchStoreSettings = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/settings');
        const data = await res.json();
        if (data.success && data.settings) {
          setStoreSettings(data.settings);
        }
      } catch (err) {
        console.error('Failed to load store settings:', err);
      }
    };
    fetchStoreSettings();
  }, []);

  // Checkout Modal State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentSplits, setPaymentSplits] = useState([{ method: 'Cash', amount: 0 }]);
  const [cashGiven, setCashGiven] = useState('');

  // Receipt Drawer States
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [latestOrderReceipt, setLatestOrderReceipt] = useState(null);

  // WhatsApp Simulation States
  const [isWaOpen, setIsWaOpen] = useState(false);
  const [waMobile, setWaMobile] = useState('');

  // Return & Exchange Tab States
  const [posTab, setPosTab] = useState('billing'); // billing, returns
  const [returnOrderId, setReturnOrderId] = useState('');
  const [returnOrder, setReturnOrder] = useState(null);
  const [itemsToReturn, setItemsToReturn] = useState({}); // { itemId: true/false }

  // Barcode Input Reference for scanner wedge simulation
  const barcodeInputRef = useRef(null);
  const [scannerVal, setScannerVal] = useState('');

  // Auto focus scanner input on POS load
  useEffect(() => {
    if (posTab === 'billing' && barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  }, [posTab]);

  // Handle scanned barcode submission
  const handleBarcodeScanSubmit = (e) => {
    e.preventDefault();
    if (!scannerVal) return;

    let foundProd = null;
    let foundVar = null;

    for (const p of products) {
      if (p.barcode === scannerVal) {
        foundProd = p;
        break;
      }
      if (p.variants) {
        const v = p.variants.find(vt => vt.barcode === scannerVal);
        if (v) {
          foundProd = p;
          foundVar = v;
          break;
        }
      }
    }

    if (foundProd) {
      addToCart(foundProd, foundVar);
    } else {
      alert(`No garment matches scanned code: "${scannerVal}"`);
    }
    setScannerVal('');
  };

  // Add Product / Variant to Cart
  const addToCart = (product, variant = null) => {
    const variantId = variant ? variant.id : null;
    const size = variant ? variant.size : product.size;
    const color = variant ? variant.color : product.color;
    const sku = variant ? variant.sku : product.sku;

    const existingIdx = cart.findIndex(
      item => item.productId === product.id && item.variantId === variantId
    );

    if (existingIdx !== -1) {
      const newCart = [...cart];
      newCart[existingIdx].qty += 1;
      setCart(newCart);
    } else {
      setCart([
        ...cart,
        {
          productId: product.id,
          variantId,
          name: product.name,
          sku,
          size,
          color,
          sellingPrice: product.sellingPrice,
          discountPrice: product.discountPrice,
          gstRate: product.gstRate,
          qty: 1
        }
      ]);
    }
  };

  const updateCartQty = (idx, change) => {
    const newCart = [...cart];
    newCart[idx].qty += change;
    if (newCart[idx].qty <= 0) {
      newCart.splice(idx, 1);
    }
    setCart(newCart);
  };

  const removeFromCart = (idx) => {
    const newCart = [...cart];
    newCart.splice(idx, 1);
    setCart(newCart);
  };

  // Find Customer by Mobile
  const handleCustomerLookup = (val) => {
    setCustomerMobile(val);
    const found = customers.find(c => c.mobile === val);
    if (found) {
      setSelectedCustomer(found);
      setShowAddCustomerForm(false);
    } else {
      setSelectedCustomer(null);
      if (val.length === 10) {
        setShowAddCustomerForm(true);
      } else {
        setShowAddCustomerForm(false);
      }
    }
  };

  const handleCreateCustomer = (e) => {
    e.preventDefault();
    if (!newCustomerName || customerMobile.length !== 10) return;

    const newCust = {
      name: newCustomerName,
      mobile: customerMobile,
      email: `${newCustomerName.toLowerCase().replace(/\s+/g, '')}@example.com`,
      address: 'POS Walk-In customer'
    };

    dispatch(addCustomer(newCust));
    setSelectedCustomer({
      ...newCust,
      loyaltyPoints: 0,
      currentCredit: 0
    });
    setShowAddCustomerForm(false);
    setNewCustomerName('');
  };

  // Apply Coupon Code
  const handleApplyCoupon = (e) => {
    e.preventDefault();
    const coup = coupons.find(c => c.code.toUpperCase() === couponCode.toUpperCase());
    if (coup) {
      const netSubtotal = cart.reduce((sum, item) => sum + (item.discountPrice || item.sellingPrice) * item.qty, 0);
      if (netSubtotal >= coup.minPurchase) {
        setAppliedCoupon(coup);
        setCouponCode('');
      } else {
        alert(`Minimum purchase for coupon ${coup.code} is ₹${coup.minPurchase}`);
      }
    } else {
      alert('Invalid coupon code!');
    }
  };

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + (item.discountPrice || item.sellingPrice) * item.qty, 0);
  
  let couponDiscountVal = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === 'percentage') {
      couponDiscountVal = Math.round(subtotal * (appliedCoupon.value / 100));
    } else {
      couponDiscountVal = appliedCoupon.value;
    }
  }

  const manualDiscountVal = Math.round(subtotal * (discountPercent / 100));
  const totalDiscount = couponDiscountVal + manualDiscountVal;

  let loyaltyPointsRedeemVal = 0;
  if (redeemPoints && selectedCustomer) {
    loyaltyPointsRedeemVal = Math.min(selectedCustomer.loyaltyPoints, subtotal - totalDiscount);
  }

  const netBeforeTax = Math.max(0, subtotal - totalDiscount - loyaltyPointsRedeemVal);
  
  const storeGstRate = storeSettings?.gstRate !== undefined ? storeSettings.gstRate : 12;
  const gstTotalVal = Math.round(netBeforeTax * (storeGstRate / 100));

  const grandTotal = netBeforeTax + gstTotalVal;

  // Handle suspended bill features
  const handleHoldBill = () => {
    if (cart.length === 0) return;
    const holdData = {
      customerMobile: selectedCustomer?.mobile || 'Walk-In',
      customerName: selectedCustomer?.name || 'Guest Customer',
      items: cart,
      subtotal,
      grandTotal
    };
    dispatch(holdBill(holdData));
    setCart([]);
    setSelectedCustomer(null);
    setCustomerMobile('');
    setDiscountPercent(0);
    setAppliedCoupon(null);
    setRedeemPoints(false);
  };

  const handleResumeBill = (hb) => {
    setCart(hb.items);
    if (hb.customerMobile !== 'Walk-In') {
      const found = customers.find(c => c.mobile === hb.customerMobile);
      if (found) setSelectedCustomer(found);
      setCustomerMobile(hb.customerMobile);
    }
    dispatch(resumeBill(hb.id));
  };

  // Open Checkout Modal
  const handleOpenCheckout = () => {
    if (cart.length === 0) return;
    setPaymentSplits([{ method: 'Cash', amount: grandTotal }]);
    setCashGiven('');
    setIsCheckoutOpen(true);
  };

  // Handle split payment splits edits
  const addSplit = () => {
    setPaymentSplits([...paymentSplits, { method: 'UPI', amount: 0 }]);
  };

  const removeSplit = (idx) => {
    const newSplits = paymentSplits.filter((_, i) => i !== idx);
    setPaymentSplits(newSplits);
  };

  const updateSplit = (idx, field, value) => {
    const newSplits = [...paymentSplits];
    if (field === 'amount') {
      newSplits[idx].amount = Number(value);
    } else {
      newSplits[idx].method = value;
    }
    setPaymentSplits(newSplits);
  };

  const finalizeSale = (paymentMethodList) => {
    const orderId = `ORD-20260701-${Math.floor(100 + Math.random() * 900)}`;

    const orderPayload = {
      id: orderId,
      date: new Date().toISOString(),
      customerMobile: selectedCustomer?.mobile || 'Walk-in',
      customerName: selectedCustomer?.name || 'Guest Customer',
      items: cart,
      subtotal,
      discount: totalDiscount + loyaltyPointsRedeemVal,
      gst: gstTotalVal,
      total: grandTotal,
      paymentMethod: paymentMethodList,
      status: 'Completed',
      loyaltyPointsEarned: Math.floor(grandTotal / 100),
      loyaltyPointsRedeemed: redeemPoints ? loyaltyPointsRedeemVal : 0
    };

    dispatch(completeSale(orderPayload));

    cart.forEach(item => {
      dispatch(updateStock({
        productId: item.productId,
        variantId: item.variantId,
        changeQty: -item.qty
      }));
    });

    if (selectedCustomer) {
      dispatch(addLoyaltyPoints({ mobile: selectedCustomer.mobile, points: orderPayload.loyaltyPointsEarned }));
      if (redeemPoints) {
        dispatch(deductLoyaltyPoints({ mobile: selectedCustomer.mobile, points: loyaltyPointsRedeemVal }));
      }
    }

    setLatestOrderReceipt(orderPayload);
    setIsCheckoutOpen(false);
    setIsReceiptOpen(true);
    
    // Clear POS workspace
    setCart([]);
    setSelectedCustomer(null);
    setCustomerMobile('');
    setDiscountPercent(0);
    setAppliedCoupon(null);
    setRedeemPoints(false);
  };

  // Checkout submission
  const handleFinalCheckout = () => {
    const totalPaid = paymentSplits.reduce((sum, p) => sum + p.amount, 0);
    if (Math.abs(totalPaid - grandTotal) > 2) {
      alert(`Payment total (₹${totalPaid}) must match Grand Total (₹${grandTotal}) exactly.`);
      return;
    }
    finalizeSale(paymentSplits);
  };

  const handleQuickGenerateBill = () => {
    if (cart.length === 0) return;
    finalizeSale([{ method: 'Cash', amount: grandTotal }]);
  };

  // Lookup Order for returns
  const handleLookupReturnOrder = (e) => {
    e.preventDefault();
    const found = orders.find(o => o.id === returnOrderId);
    if (found) {
      setReturnOrder(found);
      setItemsToReturn({});
    } else {
      alert(`Invoice "${returnOrderId}" not found.`);
      setReturnOrder(null);
    }
  };

  // Submit Returns/Exchange
  const handleProcessReturn = () => {
    if (!returnOrder) return;
    const returnedItems = returnOrder.items.filter(item => itemsToReturn[item.productId]);
    if (returnedItems.length === 0) {
      alert('Please check at least one garment to return.');
      return;
    }

    const refundVal = returnedItems.reduce((sum, item) => sum + (item.discountPrice || item.sellingPrice) * item.qty, 0);

    dispatch(processReturnOrExchange({
      orderId: returnOrder.id,
      returnedItems,
      refundAmount: refundVal,
      details: 'Refunded via POS Return desk'
    }));

    returnedItems.forEach(item => {
      dispatch(updateStock({
        productId: item.productId,
        changeQty: item.qty
      }));
    });

    alert(`Successfully processed return for invoice ${returnOrder.id}. Refund amount issued: ₹${refundVal}`);
    setReturnOrderId('');
    setReturnOrder(null);
    setPosTab('billing');
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(catalogSearch.toLowerCase()) ||
                          p.sku.toLowerCase().includes(catalogSearch.toLowerCase());
    const matchesCategory = activeCategory ? p.category === activeCategory : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col gap-5 h-full">
      
      {/* POS Toolbar Options Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/50 dark:border-slate-800 pb-4 flex-shrink-0 print:hidden">
        <div>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Register Station 01</span>
          <h2 className="text-sm font-black text-slate-900 dark:text-white tracking-wider uppercase">Point of Sale (POS)</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPosTab('billing')}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-200 cursor-pointer border ${
              posTab === 'billing' 
                ? 'bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] text-white border-transparent shadow-md shadow-blue-500/15' 
                : 'bg-white dark:bg-slate-900 text-slate-505 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-805'
            }`}
          >
            🛒 POS Billing
          </button>
          <button
            onClick={() => setPosTab('returns')}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-200 cursor-pointer border ${
              posTab === 'returns' 
                ? 'bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] text-white border-transparent shadow-md shadow-blue-500/15' 
                : 'bg-white dark:bg-slate-900 text-slate-505 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-805'
            }`}
          >
            🔄 Returns desk
          </button>
        </div>
      </div>

      {/* POS Columns Container */}
      <div className="flex-grow flex flex-col xl:flex-row gap-6">
        {posTab === 'billing' ? (
          <>
            {/* Left Side: Touch Catalog */}
            <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-5 space-y-4">
              
              {/* Catalog Top Filter Row */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 flex-shrink-0">
                <div className="relative w-full sm:max-w-xs">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    placeholder="Search catalog products..."
                    value={catalogSearch}
                    onChange={(e) => setCatalogSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50/70 dark:bg-slate-850/50 border border-slate-200/70 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] text-xs text-slate-800 dark:text-slate-200"
                  />
                </div>

                {/* Barcode Laser Input Simulator */}
                <form onSubmit={handleBarcodeScanSubmit} className="flex gap-2 w-full sm:w-auto">
                  <div className="relative w-full sm:w-44">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-405">🏷️</span>
                    <input
                      ref={barcodeInputRef}
                      type="text"
                      value={scannerVal}
                      onChange={(e) => setScannerVal(e.target.value)}
                      placeholder="Scan barcode..."
                      className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-slate-50/70 dark:bg-slate-850/50 border border-slate-200/70 dark:border-slate-800 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6]"
                    />
                  </div>
                  <button type="submit" className="px-5 py-2.5 bg-slate-900 dark:bg-slate-800 hover:bg-[#3B82F6] hover:text-white border border-transparent dark:border-slate-700 text-xs font-black uppercase tracking-widest rounded-xl transition duration-200 cursor-pointer shadow-xs active:scale-97">
                    Scan
                  </button>
                </form>
              </div>

              {/* Quick Category Chips */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar flex-shrink-0 border-b border-slate-100 dark:border-slate-850/80">
                <button
                  onClick={() => setActiveCategory('')}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition border cursor-pointer ${
                    !activeCategory 
                      ? 'bg-blue-500/5 dark:bg-blue-950/20 text-[#3B82F6] border-blue-500/20 dark:border-[#3B82F6]/10' 
                      : 'bg-slate-50 dark:bg-slate-800/40 text-slate-405 dark:text-slate-550 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  All Items
                </button>
                {categories.map(c => (
                  <button
                    key={c}
                    onClick={() => setActiveCategory(c)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition border cursor-pointer ${
                      activeCategory === c 
                        ? 'bg-blue-500/5 dark:bg-blue-950/20 text-[#3B82F6] border-blue-500/20 dark:border-[#3B82F6]/10' 
                        : 'bg-slate-50 dark:bg-slate-800/40 text-slate-405 dark:text-slate-550 border-transparent hover:bg-slate-100 dark:hover:bg-slate-805'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>

              {/* Products Grid */}
              <div className="flex-1 overflow-y-auto no-scrollbar scrollbar-none grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 pr-1">
                {filteredProducts.map((p) => {
                  const isOutOfStock = p.stockQuantity <= 0;
                  return (
                    <div
                      key={p.id}
                      onClick={() => !isOutOfStock && addToCart(p)}
                      className={`group bg-slate-50/40 dark:bg-slate-900/10 border border-slate-100 dark:border-slate-855 rounded-2xl p-3.5 flex flex-col justify-between hover:border-[#3B82F6]/30 dark:hover:border-slate-700 hover:shadow-lg hover:shadow-slate-100/50 dark:hover:shadow-none transition-all duration-300 cursor-pointer select-none relative ${
                        isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <div>
                        {/* Premium custom Vector Graphic placeholder based on category */}
                        <div className="w-full aspect-square rounded-xl bg-gradient-to-br from-[#3B82F6]/10 to-[#8B5CF6]/10 dark:from-[#3B82F6]/5 dark:to-[#8B5CF6]/5 flex items-center justify-center relative overflow-hidden mb-3.5 group-hover:scale-[1.02] transition-all duration-300">
                          {p.thumbnail ? (
                            <img src={p.thumbnail} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            getProductIcon(p.name)
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-[8px] font-black text-slate-400 dark:text-slate-505 uppercase tracking-widest">{p.brand}</span>
                          <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                            isOutOfStock 
                              ? 'bg-slate-500/10 text-slate-500 dark:text-slate-400' 
                              : 'bg-emerald-500/10 text-[#10B981] dark:text-[#10B981]'
                          }`}>
                            {isOutOfStock ? 'Out of Stock' : `${p.stockQuantity} Pcs`}
                          </span>
                        </div>
                        
                        <h4 className="font-extrabold text-xs text-slate-850 dark:text-slate-200 mt-2 line-clamp-2 leading-snug group-hover:text-[#3B82F6] transition-colors">
                          {p.name}
                        </h4>
                        <p className="text-[9px] text-slate-405 dark:text-slate-505 font-bold mt-1 uppercase tracking-wider">Size: {p.size} • {p.color}</p>
                      </div>

                      <div className="flex items-center justify-between mt-3.5 border-t border-slate-100 dark:border-slate-850 pt-2.5 flex-shrink-0">
                        <div>
                          <span className="text-xs font-black text-slate-900 dark:text-white">
                            ₹{p.discountPrice || p.sellingPrice}
                          </span>
                          {p.discountPrice && (
                            <span className="text-[9px] text-slate-400 line-through ml-1.5">₹{p.sellingPrice}</span>
                          )}
                        </div>
                        <span className="w-6 h-6 rounded-lg bg-white dark:bg-slate-855 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs font-black hover:bg-[#3B82F6] hover:border-transparent hover:text-white transition duration-200 cursor-pointer shadow-xs transform group-active:scale-95">
                          ＋
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Side: Billing Cart Workspace */}
            <div className="w-full xl:w-96 flex flex-col bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-5 space-y-4 flex-shrink-0">
              
              {/* Customer Lookup Profile Row */}
              <div className="space-y-2 border-b border-slate-100 dark:border-slate-850 pb-4 flex-shrink-0">
                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Customer CRM Lookup</div>
                
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">📱</span>
                  <input
                    type="text"
                    maxLength={10}
                    placeholder="Enter 10-digit mobile number..."
                    value={customerMobile}
                    onChange={(e) => handleCustomerLookup(e.target.value)}
                    className="w-full pl-8 pr-12 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-850/50 border border-slate-200/70 dark:border-slate-800 text-xs font-extrabold focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6]"
                  />
                  {selectedCustomer && (
                    <button onClick={() => { setSelectedCustomer(null); setCustomerMobile(''); setRedeemPoints(false); }} className="absolute right-3 top-3 text-[#3B82F6] text-[9px] font-black uppercase tracking-wider cursor-pointer">
                      Clear
                    </button>
                  )}
                </div>

                {selectedCustomer && (
                  <div className="p-3 bg-slate-50/70 dark:bg-slate-850/30 rounded-xl text-xs space-y-2 border border-slate-150 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-800 dark:text-slate-100">{selectedCustomer.name}</span>
                      <span className="text-[9px] font-black text-[#8B5CF6] bg-[#8B5CF6]/10 px-2 py-0.5 rounded-md border border-[#8B5CF6]/10">
                        ⭐ {selectedCustomer.loyaltyPoints} Points
                      </span>
                    </div>
                    
                    {selectedCustomer.loyaltyPoints > 0 && (
                      <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-400 dark:text-slate-505 mt-1 select-none text-[10px]">
                        <input
                          type="checkbox"
                          checked={redeemPoints}
                          onChange={(e) => setRedeemPoints(e.target.checked)}
                          className="rounded border-slate-300 dark:border-slate-700 accent-[#3B82F6]"
                        />
                        <span>Redeem points (Save ₹{Math.min(selectedCustomer.loyaltyPoints, subtotal - totalDiscount)})</span>
                      </label>
                    )}
                  </div>
                )}

                {showAddCustomerForm && (
                  <form onSubmit={handleCreateCustomer} className="p-3 bg-blue-500/5 dark:bg-blue-950/20 border border-[#3B82F6]/20 rounded-xl space-y-2.5">
                    <div className="text-[9px] font-black text-[#3B82F6] uppercase tracking-wider flex items-center gap-1">
                      <span>⚠️</span> New Walk-In Customer
                    </div>
                    <input
                      type="text"
                      placeholder="Enter Full Name"
                      required
                      value={newCustomerName}
                      onChange={(e) => setNewCustomerName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-855 border border-slate-200 dark:border-slate-800 text-xs font-bold"
                    />
                    <button type="submit" className="w-full py-2 bg-[#3B82F6] hover:bg-blue-600 text-white text-[9.5px] font-black uppercase tracking-widest rounded-lg transition duration-200 cursor-pointer shadow-xs active:scale-98">
                      Register Customer
                    </button>
                  </form>
                )}
              </div>

              {/* Cart Items List */}
              <div className="max-h-[300px] overflow-y-auto custom-scrollbar pr-2 space-y-3">
                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-between">
                  <span>Selected Garments</span>
                  <span className="text-slate-500 dark:text-slate-400 font-bold font-mono">( {cart.length} sku )</span>
                </div>
                
                {cart.length > 0 ? (
                  cart.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start gap-2.5 p-3 bg-slate-50/70 dark:bg-slate-850/20 rounded-xl hover:bg-slate-50/90 dark:hover:bg-slate-850/50 border border-slate-100/50 dark:border-slate-850/50 hover:border-slate-200 dark:hover:border-slate-700 transition">
                      <div className="min-w-0 flex-grow">
                        <h5 className="font-extrabold text-xs text-slate-850 dark:text-slate-100 truncate">{item.name}</h5>
                        <div className="text-[9px] font-bold text-slate-450 dark:text-slate-500 mt-0.5 uppercase tracking-wider">
                          Sz: {item.size} • Color: {item.color}
                        </div>
                        <div className="text-xs font-black text-slate-900 dark:text-white mt-1.5 font-mono">
                          ₹{item.discountPrice || item.sellingPrice}
                          <span className="text-[8px] font-black text-slate-400 dark:text-slate-555 ml-1.5 uppercase font-mono">GST {item.gstRate}%</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end justify-between self-stretch flex-shrink-0">
                        <button onClick={() => removeFromCart(idx)} className="text-slate-400 hover:text-slate-500 text-[10px] p-0.5 cursor-pointer" title="Remove">✕</button>
                        <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 px-1.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800">
                          <button onClick={() => updateCartQty(idx, -1)} className="w-4.5 h-4.5 rounded bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center font-bold text-xs cursor-pointer select-none">
                            -
                          </button>
                          <span className="font-black text-xs px-1 text-slate-800 dark:text-slate-200 font-mono">{item.qty}</span>
                          <button onClick={() => updateCartQty(idx, 1)} className="w-4.5 h-4.5 rounded bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center font-bold text-xs cursor-pointer select-none">
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-14 text-slate-400 dark:text-slate-500 font-bold text-xs border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center gap-2">
                    <span className="text-2xl filter grayscale dark:filter-none">👚</span>
                    <span>Cart is empty.<br />Click items in catalog to fill.</span>
                  </div>
                )}
              </div>

              {/* Suspended bills picker */}
              {heldBills.length > 0 && (
                <div className="border-t border-slate-100 dark:border-slate-850/80 pt-3 flex-shrink-0">
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Held Transactions ({heldBills.length})</div>
                  <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-none no-scrollbar">
                    {heldBills.map((hb) => (
                      <button
                        key={hb.id}
                        onClick={() => handleResumeBill(hb)}
                        className="px-3.5 py-1.5 bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 rounded-xl text-[10px] font-black whitespace-nowrap hover:bg-amber-550/20 cursor-pointer"
                      >
                        📂 {hb.customerName} (₹{hb.grandTotal})
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Cart Billing Summaries */}
              <div className="border-t border-slate-100 dark:border-slate-850 pt-4 space-y-3.5 text-xs text-slate-600 dark:text-slate-455 flex-shrink-0">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[8px] font-black text-slate-405 dark:text-slate-505 uppercase tracking-widest mb-1">Coupon Promo</label>
                    <form onSubmit={handleApplyCoupon} className="flex gap-1.5">
                      <input
                        type="text"
                        placeholder="WELCOME10"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-855 border border-slate-200 dark:border-slate-800 text-xs font-bold uppercase"
                      />
                      <button type="submit" className="px-3 py-1 bg-slate-900 dark:bg-slate-800 text-white rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-[#3B82F6] transition duration-200 cursor-pointer">Apply</button>
                    </form>
                  </div>
                  <div>
                    <label className="block text-[8px] font-black text-slate-405 dark:text-slate-505 uppercase tracking-widest mb-1">Flat Discount (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={discountPercent}
                      onChange={(e) => setDiscountPercent(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-855 border border-slate-200 dark:border-slate-800 text-xs text-center font-black"
                    />
                  </div>
                </div>

                {appliedCoupon && (
                  <div className="flex items-center justify-between p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[#10B981] dark:text-emerald-450 text-[10px] font-black">
                    <span>🎟️ Coupon: {appliedCoupon.code} Applied (-₹{couponDiscountVal})</span>
                    <button onClick={() => setAppliedCoupon(null)} className="text-slate-500 hover:text-[#3B82F6] cursor-pointer">✕</button>
                  </div>
                )}

                <div className="space-y-1.5 text-[11px]">
                  <div className="flex justify-between font-bold text-slate-500">
                    <span>Cart Subtotal</span>
                    <span className="text-slate-800 dark:text-slate-200 font-semibold font-mono">₹{subtotal}</span>
                  </div>
                  {(totalDiscount > 0 || loyaltyPointsRedeemVal > 0) && (
                    <div className="flex justify-between font-bold text-[#10B981]">
                      <span>Promo/Points Savings</span>
                      <span className="font-mono">-₹{totalDiscount + loyaltyPointsRedeemVal}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-slate-505">
                    <span>Applicable GST Tax</span>
                    <span className="text-slate-800 dark:text-slate-200 font-semibold font-mono">₹{gstTotalVal}</span>
                  </div>
                  <div className="flex justify-between font-black text-slate-900 dark:text-white border-t border-slate-100 dark:border-slate-850 pt-3 text-sm">
                    <span>GRAND TOTAL</span>
                    <span className="text-base font-black font-mono text-[#3B82F6]">₹{grandTotal}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={handleQuickGenerateBill}
                    disabled={cart.length === 0}
                    className="w-full py-3 bg-[#10B981] hover:bg-[#0D9488] text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-98"
                  >
                    ⚡ Generate Bill
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={handleHoldBill}
                      disabled={cart.length === 0}
                      className="py-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 hover:text-slate-900 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 text-[9.5px] font-black uppercase tracking-widest rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed border border-slate-200 dark:border-slate-700 cursor-pointer active:scale-98"
                    >
                      Hold Bill
                    </button>
                    <button
                      type="button"
                      onClick={handleOpenCheckout}
                      disabled={cart.length === 0}
                      className="py-3 bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] hover:from-[#2563EB] hover:to-[#7C3AED] text-white text-[9.5px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-98"
                    >
                      Pay POS Receipt (₹{grandTotal})
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Return & Exchange Tab Workspace */
          <div className="flex-grow bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-6 flex flex-col space-y-6 shadow-xs">
            <div className="border-b border-slate-100 dark:border-slate-855 pb-3.5">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Returns & Refund desk</span>
              <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider mt-0.5">
                Invoice Look Up & Refund Desk
              </h2>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-1">
                Lookup customer purchase receipts, select returned items, and restore inventory stock levels.
              </p>
            </div>

            <form onSubmit={handleLookupReturnOrder} className="flex items-end gap-3 max-w-md">
              <div className="flex-grow">
                <label className="block text-[9px] font-black text-slate-405 dark:text-slate-500 uppercase tracking-widest mb-1.5">Enter Invoice Reference ID *</label>
                <input
                  type="text"
                  required
                  value={returnOrderId}
                  onChange={(e) => setReturnOrderId(e.target.value)}
                  placeholder="e.g. ORD-20260701-123"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-855/50 border border-slate-200 dark:border-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] font-bold font-mono"
                />
              </div>
              <button type="submit" className="px-5 py-2.5 bg-slate-900 dark:bg-slate-800 hover:bg-[#3B82F6] hover:text-white border border-transparent dark:border-slate-700 font-black uppercase text-[10px] tracking-widest rounded-xl transition duration-200 cursor-pointer">
                Lookup
              </button>
            </form>

            {returnOrder && (
              <div className="p-5 bg-slate-50/70 dark:bg-slate-855/10 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 max-w-3xl space-y-5 text-xs text-slate-655 dark:text-slate-350">
                <div className="flex justify-between border-b border-slate-200/50 dark:border-slate-800 pb-3">
                  <div>
                    <div className="font-extrabold text-sm text-slate-900 dark:text-white font-mono">Order Ref: {returnOrder.id}</div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-semibold">{new Date(returnOrder.date).toLocaleString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-slate-900 dark:text-white text-sm font-mono font-bold">Total paid: ₹{returnOrder.total}</div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-semibold">Status: <span className="text-[#10B981] uppercase">{returnOrder.status}</span></div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="text-[9px] font-black text-slate-450 dark:text-slate-505 uppercase tracking-widest">Garments in Invoice (Select items to return)</div>
                  {returnOrder.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-xl shadow-xs">
                      <label className="flex items-center gap-3.5 cursor-pointer font-extrabold text-slate-855 dark:text-slate-200 font-sans">
                        <input
                          type="checkbox"
                          checked={!!itemsToReturn[item.productId]}
                          onChange={(e) => setItemsToReturn({
                            ...itemsToReturn,
                            [item.productId]: e.target.checked
                          })}
                          className="rounded border-slate-300 dark:border-slate-700 accent-[#3B82F6]"
                        />
                        <span>{item.name} (Size: {item.size} • Color: {item.color})</span>
                      </label>
                      <span className="font-black text-slate-700 dark:text-slate-300 font-mono">₹{item.discountPrice || item.sellingPrice} <span className="text-[9px] text-slate-400 ml-1">x{item.qty}</span></span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-3 border-t border-slate-200/50 dark:border-slate-800 pt-4 flex-shrink-0">
                  <button
                    type="button"
                    onClick={handleProcessReturn}
                    className="px-5 py-3 bg-[#3B82F6] hover:bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-md shadow-blue-500/10 hover:shadow-lg transition cursor-pointer"
                  >
                    Confirm Return & Process Refund
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Checkout Split Payment & UPI Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs print:hidden">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-5 md:p-8 space-y-5 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between border-b dark:border-slate-800 pb-4">
              <div>
                <span className="text-[9px] font-black text-slate-405 dark:text-slate-505 uppercase tracking-widest">Checkout counter</span>
                <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  POS Payments Reconciliation
                </h2>
              </div>
              <button onClick={() => setIsCheckoutOpen(false)} className="text-slate-400 hover:text-red-505 font-extrabold cursor-pointer">✕</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 text-xs text-slate-655 dark:text-slate-350">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black text-slate-400 dark:text-slate-505 uppercase tracking-widest">Payment Methods Split</span>
                  <button onClick={addSplit} className="text-[#3B82F6] text-[10px] font-black uppercase tracking-wider cursor-pointer">＋ Add Split Method</button>
                </div>

                <div className="space-y-3 max-h-[190px] overflow-y-auto pr-1 no-scrollbar">
                  {paymentSplits.map((p, idx) => (
                    <div key={idx} className="flex gap-2.5 items-center bg-slate-50 dark:bg-slate-850/50 p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl">
                      <select
                        value={p.method}
                        onChange={(e) => updateSplit(idx, 'method', e.target.value)}
                        className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold font-sans"
                      >
                        <option value="Cash">💵 Cash</option>
                        <option value="UPI">📱 UPI QR Scan</option>
                        <option value="Card">💳 Card Swipe</option>
                        <option value="Wallet">🛍️ Wallet</option>
                      </select>
                      <input
                        type="number"
                        value={p.amount}
                        onChange={(e) => updateSplit(idx, 'amount', e.target.value)}
                        placeholder="Amount"
                        className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-right font-black font-mono"
                      />
                      {paymentSplits.length > 1 && (
                        <button onClick={() => removeSplit(idx)} className="text-red-505 text-xs font-bold px-1 hover:text-[#3B82F6] cursor-pointer">✕</button>
                      )}
                    </div>
                  ))}
                </div>

                {paymentSplits.some(p => p.method === 'Cash') && (
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-850/50 rounded-xl space-y-2 border border-slate-200 dark:border-slate-800">
                    <label className="block text-[8px] font-black text-slate-400 dark:text-slate-505 uppercase tracking-widest">Cash Tendered Change Calculator</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Cash Handed (e.g. ₹500)"
                        value={cashGiven}
                        onChange={(e) => setCashGiven(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-black font-mono"
                      />
                      {cashGiven && Number(cashGiven) >= paymentSplits.find(p => p.method === 'Cash')?.amount && (
                        <div className="bg-emerald-500/10 px-3 py-2 rounded-xl border border-emerald-500/20 text-emerald-800 dark:text-emerald-350 font-black text-[9px] flex items-center justify-center whitespace-nowrap font-mono">
                          Change: ₹{Number(cashGiven) - paymentSplits.find(p => p.method === 'Cash')?.amount}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* UPI Instant QR Code Display Column */}
              <div className="flex flex-col items-center justify-center p-6 border rounded-2xl bg-slate-50 dark:bg-slate-850/20 text-center gap-4 border-slate-200 dark:border-slate-800 border-t-4 border-t-[#8B5CF6] dark:border-t-slate-805">
                <div className="text-[9px] font-black text-slate-405 dark:text-slate-505 uppercase tracking-widest">Dynamic Payment UPI QR</div>
                
                <div className="p-2.5 bg-white rounded-xl shadow-xs">
                  <QRCode
                    value={`upi://pay?pa=downtownapparels@icici&pn=Downtown%20Apparels&am=${grandTotal}&cu=INR`}
                    size={110}
                  />
                </div>
                
                <div className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold leading-relaxed font-sans">
                  Scan code using any UPI App. UPI ID: <span className="font-bold text-slate-700 dark:text-slate-350 block mt-0.5 font-mono select-all">downtownapparels@icici</span>
                </div>
              </div>
            </div>

            {/* Total Balance Sheet */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex justify-between items-center text-xs">
              <div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">GRAND TOTAL DUE</span>
                <span className="text-lg font-black text-[#3B82F6] font-mono">₹{grandTotal}</span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsCheckoutOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-655 dark:text-slate-450 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleFinalCheckout}
                  className="px-5 py-2.5 bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] text-white font-extrabold uppercase tracking-widest rounded-xl shadow-lg hover:opacity-95 transition cursor-pointer active:scale-98"
                >
                  Confirm Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3-inch Thermal Print Receipt Drawer */}
      {isReceiptOpen && latestOrderReceipt && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs print:p-0">
          <div className="bg-white text-slate-900 rounded-2xl w-full max-w-sm max-h-[90vh] overflow-y-auto shadow-2xl p-6 flex flex-col justify-between print:shadow-none print:max-h-none print:p-0">
            
            <style>{`
              @media print {
                body * {
                  visibility: hidden;
                }
                .thermal-receipt-layout, .thermal-receipt-layout * {
                  visibility: visible;
                }
                .thermal-receipt-layout {
                  position: absolute;
                  left: 0;
                  top: 0;
                  width: 76mm;
                  padding: 2mm;
                  font-family: monospace;
                }
                .print-hidden-receipt {
                  display: none !important;
                }
              }
            `}</style>

            {/* Thermal Receipt Paper */}
            <div className="thermal-receipt-layout p-4 bg-slate-50 border border-slate-200/60 rounded-xl font-mono text-[10px] space-y-4 text-slate-800 print:bg-white print:border-none print:p-0">
              <div className="text-center space-y-1">
                <h2 className="font-black text-xs uppercase tracking-widest text-slate-955">{storeSettings?.storeName || 'Downtown Apparels'}</h2>
                <p className="text-[8px] font-bold text-slate-505">{storeSettings?.storeAddress || 'Connaught Place, Delhi'}</p>
                <p className="text-[8px] font-bold text-slate-505">Tel: +91 {storeSettings?.phone || '98765 43210'} {storeSettings?.gstin ? `| GSTIN: ${storeSettings.gstin}` : ''}</p>
              </div>

              <div className="border-t border-dashed border-slate-300 pt-2 space-y-0.5 text-[8px] font-bold text-slate-505">
                <div>Invoice ID: {latestOrderReceipt.id}</div>
                <div>Date: {new Date(latestOrderReceipt.date).toLocaleString()}</div>
                <div>Customer Mobile: {latestOrderReceipt.customerMobile}</div>
              </div>

              <div className="border-t border-dashed border-slate-300 pt-2">
                <table className="w-full text-left border-collapse text-[8px]">
                  <thead>
                    <tr className="border-b border-dashed border-slate-300 font-black">
                      <th className="pb-1">Item Description</th>
                      <th className="pb-1 text-center">Qty</th>
                      <th className="pb-1 text-right">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {latestOrderReceipt.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-1">
                          <div>{item.name}</div>
                          <div className="text-[7px] text-slate-555">Sz:{item.size} / Cl:{item.color}</div>
                        </td>
                        <td className="py-1 text-center font-bold">{item.qty}</td>
                        <td className="py-1 text-right font-bold">₹{(item.discountPrice || item.sellingPrice) * item.qty}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="border-t border-dashed border-slate-300 pt-2 space-y-1 text-right text-[8px] font-bold">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{latestOrderReceipt.subtotal}</span>
                </div>
                {latestOrderReceipt.discount > 0 && (
                  <div className="flex justify-between text-[#10B981]">
                    <span>Discount:</span>
                    <span>-₹{latestOrderReceipt.discount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Tax (GST):</span>
                  <span>₹{latestOrderReceipt.gst}</span>
                </div>
                <div className="flex justify-between text-slate-955 font-black text-[9px] border-t border-dashed border-slate-300 pt-1.5">
                  <span>Grand Total:</span>
                  <span>₹{latestOrderReceipt.total}</span>
                </div>
              </div>

              <div className="border-t border-dashed border-slate-300 pt-2 space-y-0.5 text-[8px] font-bold">
                <div className="font-black text-slate-950">Payment Reconciliation:</div>
                {latestOrderReceipt.paymentMethod.map((pm, i) => (
                  <div key={i} className="flex justify-between">
                    <span>- {pm.method}:</span>
                    <span>₹{pm.amount}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-dashed border-slate-300 pt-2 text-center space-y-2">
                <div className="scale-75 -my-2.5 flex justify-center">
                  <Barcode value={latestOrderReceipt.id} height={30} showText={false} />
                </div>
                <div className="text-[7px] font-bold text-slate-505 tracking-wider">
                  THANK YOU FOR SHOPPING WITH US!<br />
                  Exchange within 7 days from purchase date.
                </div>
              </div>
            </div>

            {/* Receipt Modal options - hidden on print */}
            <div className="flex gap-3 mt-4 print-hidden-receipt">
              <button
                onClick={() => { setWaMobile(latestOrderReceipt.customerMobile); setIsWaOpen(true); }}
                className="flex-1 py-3 bg-[#10B981] hover:bg-emerald-700 text-white font-extrabold uppercase text-[9.5px] tracking-widest rounded-xl transition cursor-pointer shadow-xs"
              >
                💬 WhatsApp
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 py-3 bg-slate-900 text-white font-extrabold uppercase text-[9.5px] tracking-widest rounded-xl hover:bg-slate-950 transition cursor-pointer shadow-xs"
              >
                🖨️ Print
              </button>
              <button
                onClick={() => setIsReceiptOpen(false)}
                className="py-3 px-4 bg-slate-100 hover:bg-slate-200 font-bold rounded-xl text-[9.5px] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Message sharing simulation panel */}
      {isWaOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs print:hidden">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between border-b dark:border-slate-800 pb-3">
              <div>
                <span className="text-[9px] font-black text-slate-405 dark:text-slate-505 uppercase tracking-widest">Share receipt</span>
                <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider mt-0.5">
                  WhatsApp Messaging Simulator
                </h2>
              </div>
              <button onClick={() => setIsWaOpen(false)} className="text-slate-500 dark:text-slate-400 hover:text-[#3B82F6] cursor-pointer font-bold">✕</button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Recipient Mobile Number</label>
                <input
                  type="text"
                  value={waMobile}
                  onChange={(e) => setWaMobile(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-855/50 border border-slate-200 dark:border-slate-800 focus:outline-none font-bold"
                />
              </div>

              <div>
                <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5 font-mono">Message Text Preview</label>
                <textarea
                  readOnly
                  rows="6"
                  value={`🛍️ *Downtown Apparels Receipt* 🛍️\n\nDear Customer, thank you for shopping! Here are your invoice details:\n\n*Invoice ID:* ${latestOrderReceipt?.id}\n*Date:* ${new Date(latestOrderReceipt?.date).toLocaleDateString()}\n*Items Total:* ${latestOrderReceipt?.items.length} clothing item(s)\n*Total Paid:* ₹${latestOrderReceipt?.total}\n\nDownload digital invoice copy: https://clothingpos.com/inv/${latestOrderReceipt?.id}\n\nHave a great day!`}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-855/50 border border-slate-200 dark:border-slate-800 font-mono text-[9px] focus:outline-none select-all"
                />
              </div>

              <button
                onClick={() => {
                  alert(`[WhatsApp API Simulated] Invoice receipt message successfully dispatched to +91 ${waMobile}`);
                  setIsWaOpen(false);
                }}
                className="w-full py-3 bg-[#10B981] hover:bg-emerald-700 text-white font-extrabold uppercase tracking-widest text-[9.5px] rounded-xl shadow-lg transition cursor-pointer"
              >
                Send WhatsApp Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default POS;
