import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import Barcode from '../utils/barcode';
import QRCode from '../utils/qrcode';

export const BarcodeSystem = () => {
  const location = useLocation();
  const { products } = useSelector((s) => s.products);

  // States
  const [selectedProductId, setSelectedProductId] = useState('');
  const [printQty, setPrintQty] = useState(10);
  const [selectedVariants, setSelectedVariants] = useState({}); // { variantId: true/false }
  const [variantQty, setVariantQty] = useState({}); // { variantId: qty }
  const [labelStoreName, setLabelStoreName] = useState('DOWNTOWN APPARELS');
  const [showQr, setShowQr] = useState(true);
  const [showPrice, setShowPrice] = useState(true);

  // Scanner Simulator States
  const [scannerInput, setScannerInput] = useState('');
  const [scannedProduct, setScannedProduct] = useState(null);
  const [scannedVariant, setScannedVariant] = useState(null);

  const selectedProduct = products.find(p => p.id === selectedProductId);

  // Load from location state if passed from Products screen
  useEffect(() => {
    if (location.state?.product) {
      setSelectedProductId(location.state.product.id);
      // Preselect all variants
      if (location.state.product.variants) {
        const initialVars = {};
        const initialQtys = {};
        location.state.product.variants.forEach(v => {
          initialVars[v.id] = true;
          initialQtys[v.id] = 5;
        });
        setSelectedVariants(initialVars);
        setVariantQty(initialQtys);
      }
    }
  }, [location.state]);

  // Handle barcode scanner simulated input (reads key sequences like a real scanner keyboard wedge)
  const handleScannerSubmit = (e) => {
    e.preventDefault();
    if (!scannerInput) return;

    // Search product or variant by barcode
    let foundProd = null;
    let foundVar = null;

    for (const p of products) {
      if (p.barcode === scannerInput) {
        foundProd = p;
        break;
      }
      if (p.variants) {
        const v = p.variants.find(vt => vt.barcode === scannerInput);
        if (v) {
          foundProd = p;
          foundVar = v;
          break;
        }
      }
    }

    if (foundProd) {
      setScannedProduct(foundProd);
      setScannedVariant(foundVar);
    } else {
      alert(`No product found with barcode/SKU: "${scannerInput}"`);
      setScannedProduct(null);
      setScannedVariant(null);
    }
    setScannerInput('');
  };

  // Compile list of stickers to generate
  const getStickersToPrint = () => {
    if (!selectedProduct) return [];
    
    const stickers = [];
    const basePrice = selectedProduct.discountPrice || selectedProduct.sellingPrice;

    // If product has variants, compile variant selections
    if (selectedProduct.variants && selectedProduct.variants.length > 0) {
      selectedProduct.variants.forEach(v => {
        if (selectedVariants[v.id]) {
          const qty = Number(variantQty[v.id]) || 0;
          for (let i = 0; i < qty; i++) {
            stickers.push({
              name: selectedProduct.name,
              sku: v.sku,
              barcode: v.barcode,
              qrcode: `https://clothingpos.com/prod/${v.barcode}`,
              brand: selectedProduct.brand,
              size: v.size,
              color: v.color,
              price: basePrice
            });
          }
        }
      });
    } else {
      // Print base product stickers
      for (let i = 0; i < printQty; i++) {
        stickers.push({
          name: selectedProduct.name,
          sku: selectedProduct.sku,
          barcode: selectedProduct.barcode,
          qrcode: selectedProduct.qrcode,
          brand: selectedProduct.brand,
          size: selectedProduct.size,
          color: selectedProduct.color,
          price: basePrice
        });
      }
    }
    return stickers;
  };

  const stickers = getStickersToPrint();

  return (
    <div className="space-y-8 print:p-0">
      {/* Configuration & Controls - Hidden on Print */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 print:hidden">
        {/* Bulk Sticker Settings Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200/85 dark:border-slate-700 shadow-sm space-y-4">
          <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
            Sticker Configuration
          </h2>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Select Garment SKU</label>
              <select
                value={selectedProductId}
                onChange={(e) => {
                  setSelectedProductId(e.target.value);
                  setSelectedVariants({});
                  setVariantQty({});
                }}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-650 focus:outline-none focus:border-[#3B82F6] text-slate-600 dark:text-slate-350"
              >
                <option value="">-- Choose Product --</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Outlet / Retailer Header</label>
              <input
                type="text"
                value={labelStoreName}
                onChange={(e) => setLabelStoreName(e.target.value)}
                placeholder="DOWNTOWN APPARELS"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 focus:outline-none text-slate-850 dark:text-slate-150 font-bold"
              />
            </div>

            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-600 dark:text-slate-400">
                <input
                  type="checkbox"
                  checked={showQr}
                  onChange={(e) => setShowQr(e.target.checked)}
                  className="rounded border-slate-300 accent-[#3B82F6]"
                />
                Show QR Code
              </label>
              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-600 dark:text-slate-400">
                <input
                  type="checkbox"
                  checked={showPrice}
                  onChange={(e) => setShowPrice(e.target.checked)}
                  className="rounded border-slate-300 accent-[#3B82F6]"
                />
                Show Price Tag
              </label>
            </div>
          </div>
        </div>

        {/* Variant Picker & Print Qtys */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200/85 dark:border-slate-700 shadow-sm space-y-4">
          <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
            Sticker Quantities
          </h2>

          {selectedProduct ? (
            <div className="space-y-4 text-xs">
              {selectedProduct.variants && selectedProduct.variants.length > 0 ? (
                <div className="space-y-3">
                  <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Generate for Specific Variants:</div>
                  <div className="max-h-[160px] overflow-y-auto pr-1 no-scrollbar space-y-2">
                    {selectedProduct.variants.map(v => (
                      <div key={v.id} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-700/40 rounded-xl border border-slate-100 dark:border-slate-700">
                        <label className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-200 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!!selectedVariants[v.id]}
                            onChange={(e) => setSelectedVariants({
                              ...selectedVariants,
                              [v.id]: e.target.checked
                            })}
                            className="rounded border-slate-300 accent-[#3B82F6]"
                          />
                          Size: {v.size} / {v.color}
                        </label>
                        {selectedVariants[v.id] && (
                          <input
                            type="number"
                            min="1"
                            value={variantQty[v.id] || 5}
                            onChange={(e) => setVariantQty({
                              ...variantQty,
                              [v.id]: e.target.value
                            })}
                            className="w-16 px-2 py-1 rounded bg-white dark:bg-slate-700 border text-center font-bold"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Number of Stickers to print</label>
                  <input
                    type="number"
                    min="1"
                    value={printQty}
                    onChange={(e) => setPrintQty(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 focus:outline-none font-bold"
                  />
                </div>
              )}

              <button
                onClick={() => window.print()}
                className="w-full py-3 bg-[#3B82F6] text-white font-extrabold uppercase tracking-widest text-xs rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-600 transition cursor-pointer"
              >
                🖨️ Print Label Sheet ({stickers.length} Stickers)
              </button>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400 font-semibold text-xs">
              👈 Choose a garment to start generating sticker sheets.
            </div>
          )}
        </div>

        {/* Barcode Scanner Simulator */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200/85 dark:border-slate-700 shadow-sm space-y-4">
          <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
            Scanner Support (Simulation)
          </h2>
          <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
            Scan physical barcodes to fetch product properties immediately. Input the simulated barcode ID (e.g. `8901234001`) below and hit Enter.
          </p>

          <form onSubmit={handleScannerSubmit} className="space-y-4">
            <div className="relative">
              <input
                type="text"
                value={scannerInput}
                onChange={(e) => setScannerInput(e.target.value)}
                placeholder="Simulate Laser Scan (e.g., 8901234001)"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-650 focus:outline-none focus:border-[#3B82F6] text-xs font-mono"
              />
              <span className="absolute left-3.5 top-3.5 text-xs text-slate-400">🔍</span>
            </div>

            {/* Display scanned results */}
            {scannedProduct && (
              <div className="p-3 bg-slate-50/50 dark:bg-rose-950/20 border border-red-100 dark:border-red-900/40 rounded-xl space-y-2">
                <div className="text-[10px] font-extrabold text-[#3B82F6] uppercase tracking-wider">🎯 Scanned Product Found</div>
                <div className="text-xs">
                  <div className="font-bold text-slate-850 dark:text-slate-100">{scannedProduct.name}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    SKU: {scannedVariant ? scannedVariant.sku : scannedProduct.sku}
                  </div>
                  {scannedVariant && (
                    <div className="text-[10px] text-slate-400 font-semibold">
                      Size: {scannedVariant.size} | Color: {scannedVariant.color}
                    </div>
                  )}
                  <div className="text-xs font-black text-slate-900 dark:text-white mt-1.5">
                    Price: ₹{scannedProduct.discountPrice || scannedProduct.sellingPrice}
                  </div>
                  <div className="text-[10px] font-black text-emerald-600 mt-1">
                    Stock Availability: {scannedVariant ? scannedVariant.stockQuantity : scannedProduct.stockQuantity} Pieces
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Printable Sheet Area */}
      {stickers.length > 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/85 dark:border-slate-800 shadow-sm print:shadow-none print:border-none print:p-0">
          <div className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-4 print:hidden">Sticker Sheet Preview</div>
          
          {/* Print specific CSS override using styled tags */}
          <style>{`
            @media print {
              body * {
                visibility: hidden;
              }
              .printable-sticker-sheet, .printable-sticker-sheet * {
                visibility: visible;
              }
              .printable-sticker-sheet {
                position: absolute;
                left: 0;
                top: 0;
                width: 210mm; /* A4 size widths */
                padding: 10mm;
              }
              header, sidebar, footer, button, .print\\:hidden {
                display: none !important;
              }
            }
          `}</style>

          <div className="printable-sticker-sheet grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {stickers.map((st, index) => (
              <div
                key={index}
                className="bg-white text-slate-900 border border-slate-300 p-3 rounded-lg flex flex-col items-center justify-between text-center min-h-[190px] shadow-xs select-all text-xs"
              >
                {/* Store Header */}
                <div className="text-[8px] font-black tracking-wider text-red-600 border-b border-dashed border-slate-200 pb-1.5 w-full uppercase">
                  {labelStoreName}
                </div>

                {/* Name */}
                <div className="font-extrabold text-[10px] text-slate-800 uppercase mt-1 leading-tight line-clamp-2 w-full">
                  {st.name}
                </div>

                {/* Attributes */}
                <div className="text-[8px] font-bold text-slate-400 mt-0.5 uppercase tracking-wide">
                  Brand: {st.brand} | Size: {st.size} | Color: {st.color}
                </div>

                {/* Barcode SVG */}
                <div className="w-full my-1.5 px-1.5">
                  <Barcode value={st.barcode} height={35} showText={false} />
                  <span className="text-[8px] font-mono tracking-widest text-slate-500 block mt-0.5">
                    {st.sku}
                  </span>
                </div>

                {/* QR Code + Price Row */}
                <div className="flex items-center justify-between w-full border-t border-dashed border-slate-200 pt-1.5 mt-1">
                  {showQr ? (
                    <div className="scale-75 -ml-1">
                      <QRCode value={st.qrcode} size={40} />
                    </div>
                  ) : (
                    <div className="text-[7px] font-mono font-bold text-slate-400">
                      Code: {st.barcode}
                    </div>
                  )}

                  {showPrice && (
                    <div className="text-right">
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">M.R.P.</span>
                      <span className="text-xs font-black text-slate-900">₹{st.price}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 border rounded-2xl py-12 text-center text-slate-400 font-semibold text-xs print:hidden">
          🏷️ Select a product above to generate a preview and print sheet.
        </div>
      )}
    </div>
  );
};

export default BarcodeSystem;
