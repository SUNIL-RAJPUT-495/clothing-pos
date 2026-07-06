import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addProduct, editProduct, deleteProduct } from '../store/slices/productSlice';
import Barcode from '../utils/barcode';
import QRCode from '../utils/qrcode';
import { useNavigate } from 'react-router-dom';

export const Products = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { products, categories, brands } = useSelector((s) => s.products);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [stockFilter, setStockFilter] = useState('all'); // all, low

  // Form Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form Fields
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [size, setSize] = useState('M');
  const [color, setColor] = useState('');
  const [fabric, setFabric] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [gstRate, setGstRate] = useState('0');
  const [stockQuantity, setStockQuantity] = useState('');
  const [reorderLevel, setReorderLevel] = useState('');

  // Image Upload State & Handler
  const [thumbnail, setThumbnail] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'clothing');
    formData.append('api_key', import.meta.env.VITE_CLOUDINARY_API_KEY || '617216914673364');

    try {
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dzd6alqhr';
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      if (data.secure_url) {
        setThumbnail(data.secure_url);
      } else {
        alert('Image upload failed: ' + (data.error?.message || 'unknown error'));
      }
    } catch (err) {
      console.error(err);
      alert('Network error during image upload.');
    } finally {
      setUploadingImage(false);
    }
  };

  // Product Variants list in Form
  const [formVariants, setFormVariants] = useState([]);
  const [varSize, setVarSize] = useState('M');
  const [varColor, setVarColor] = useState('');
  const [varSku, setVarSku] = useState('');
  const [varBarcode, setVarBarcode] = useState('');
  const [varStock, setVarStock] = useState('10');
  const [varReorder, setVarReorder] = useState('3');

  // Preview Drawer/Modal States
  const [previewProduct, setPreviewProduct] = useState(null);

  const resetForm = () => {
    setName('');
    setSku('');
    setBarcode('');
    setCategory(categories[0] || '');
    setBrand(brands[0] || '');
    setSize('M');
    setColor('');
    setFabric('');
    setPurchasePrice('');
    setSellingPrice('');
    setDiscountPrice('');
    setGstRate('0');
    setStockQuantity('20');
    setReorderLevel('5');
    setThumbnail('');
    setFormVariants([]);
    setEditMode(false);
    setEditingId(null);
  };

  const handleOpenAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p) => {
    setName(p.name);
    setSku(p.sku);
    setBarcode(p.barcode || '');
    setCategory(p.category);
    setBrand(p.brand);
    setSize(p.size);
    setColor(p.color);
    setFabric(p.fabric);
    setPurchasePrice(p.purchasePrice);
    setSellingPrice(p.sellingPrice);
    setDiscountPrice(p.discountPrice || '');
    setGstRate(p.gstRate ? p.gstRate.toString() : '0');
    setStockQuantity(p.stockQuantity);
    setReorderLevel(p.reorderLevel);
    setThumbnail(p.thumbnail || '');
    setFormVariants(p.variants || []);
    setEditMode(true);
    setEditingId(p.id);
    setIsModalOpen(true);
  };

  const handleAddVariant = () => {
    if (!varColor.trim()) {
      alert('Please enter a Variant Color first.');
      return;
    }
    const computedSku = varSku.trim() || `${sku || 'PROD'}-${varColor.trim().substring(0,2).toUpperCase()}-${varSize}`;
    const computedBarcode = varBarcode || `890${Math.floor(1000000 + Math.random() * 9000000)}`;
    
    setFormVariants([
      ...formVariants,
      {
        id: `v_form_${Date.now()}`,
        size: varSize,
        color: varColor.trim(),
        sku: computedSku,
        barcode: computedBarcode,
        stockQuantity: Number(varStock),
        reorderLevel: Number(varReorder)
      }
    ]);
    setVarColor('');
    setVarSku('');
    setVarBarcode('');
  };

  const handleRemoveVariant = (vid) => {
    setFormVariants(formVariants.filter(v => v.id !== vid));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const finalBarcode = barcode || `890${Math.floor(1000000 + Math.random() * 9000000)}`;
    const finalSku = sku || `${name.substring(0,3).toUpperCase()}-${size}-${Date.now().toString().slice(-4)}`;

    const productData = {
      id: editMode ? editingId : `prod_${Date.now()}`,
      name,
      sku: finalSku,
      barcode: finalBarcode,
      qrcode: `https://clothingpos.com/prod/${finalBarcode}`,
      category,
      brand,
      size,
      color,
      fabric,
      purchasePrice: Number(purchasePrice),
      sellingPrice: Number(sellingPrice),
      discountPrice: discountPrice ? Number(discountPrice) : undefined,
      gstRate: Number(gstRate),
      stockQuantity: formVariants.length > 0 
        ? formVariants.reduce((sum, v) => sum + v.stockQuantity, 0)
        : Number(stockQuantity),
      reorderLevel: Number(reorderLevel),
      thumbnail,
      variants: formVariants
    };

    if (editMode) {
      dispatch(editProduct(productData));
    } else {
      dispatch(addProduct(productData));
    }
    
    setIsModalOpen(false);
    resetForm();
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      dispatch(deleteProduct(id));
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.barcode.includes(searchTerm);
    const matchesCategory = selectedCategory ? p.category === selectedCategory : true;
    const matchesBrand = selectedBrand ? p.brand === selectedBrand : true;
    const matchesStock = stockFilter === 'low' ? p.stockQuantity <= p.reorderLevel : true;
    
    return matchesSearch && matchesCategory && matchesBrand && matchesStock;
  });

  return (
    <div className="space-y-6">
      
      {/* Search and Filters Header */}
      <div className="bg-white dark:bg-slate-800/80 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-3">
          <input
            type="text"
            placeholder="Search by SKU, Barcode, or Title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/30 border border-slate-200/60 dark:border-slate-700 focus:outline-none focus:border-[#3B82F6] text-xs text-slate-850 dark:text-slate-205"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/30 border border-slate-200/60 dark:border-slate-700 focus:outline-none focus:border-[#3B82F6] text-xs text-slate-500 dark:text-slate-400 font-bold"
          >
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/30 border border-slate-200/60 dark:border-slate-700 focus:outline-none focus:border-[#3B82F6] text-xs text-slate-500 dark:text-slate-400 font-bold"
          >
            <option value="">All Brands</option>
            {brands.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/30 border border-slate-200/60 dark:border-slate-700 focus:outline-none focus:border-[#3B82F6] text-xs text-slate-500 dark:text-slate-400 font-bold"
          >
            <option value="all">All Stocks</option>
            <option value="low">⚠️ Low Stock Alerts</option>
          </select>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] text-white font-extrabold uppercase tracking-widest text-xs shadow-md shadow-blue-500/10 hover:opacity-95 transition flex items-center justify-center gap-2 self-start md:self-auto cursor-pointer"
        >
          ➕ Add Garment
        </button>
      </div>

      {/* Catalog Table */}
      <div className="bg-white dark:bg-slate-800/85 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-900/20 border-b border-slate-100 dark:border-slate-800 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                <th className="p-4">Garment Details</th>
                <th className="p-4">SKU / Code</th>
                <th className="p-4">Category / Brand</th>
                <th className="p-4">Fabric / Variants</th>
                <th className="p-4 text-right">Pricing (INR)</th>
                <th className="p-4 text-center">Current stock</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/50 dark:divide-slate-800/50 text-xs">
              {filteredProducts.map((p) => {
                const isLow = p.stockQuantity <= p.reorderLevel;
                return (
                  <tr key={p.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-750/10 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-900/40 border dark:border-transparent flex items-center justify-center overflow-hidden">
                          {p.thumbnail ? (
                            <img src={p.thumbnail} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-lg">👚</span>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-slate-850 dark:text-slate-200 text-sm">{p.name}</div>
                          <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Size: {p.size} | Color: {p.color}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-[9px] text-slate-500">
                      <div>SKU: {p.sku}</div>
                      <div className="mt-1 text-slate-400 select-all font-bold">BAR: {p.barcode}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-800 dark:text-slate-300">{p.category}</div>
                      <div className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest mt-0.5">{p.brand}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-slate-650 dark:text-slate-400">{p.fabric}</div>
                      <span className="text-[8px] font-black text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 border dark:border-transparent px-2 py-0.5 rounded-lg mt-1.5 inline-block">
                        {p.variants?.length || 0} Variants
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="font-black text-slate-900 dark:text-white">
                        ₹{p.discountPrice || p.sellingPrice}
                      </div>
                      {p.discountPrice && (
                        <div className="text-[9px] text-slate-400 line-through">₹{p.sellingPrice}</div>
                      )}
                      <div className="text-[9px] text-slate-400 font-bold mt-0.5">Cost: ₹{p.purchasePrice}</div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="inline-block">
                        <span className={`px-2.5 py-0.5 rounded-full font-black text-[9px] uppercase tracking-wider ${
                          isLow 
                            ? 'bg-slate-500/10 text-[#8B5CF6]' 
                            : 'bg-emerald-500/10 text-emerald-600'
                        }`}>
                          {p.stockQuantity} Pcs
                        </span>
                        {isLow && (
                          <div className="text-[8px] text-[#8B5CF6] font-black mt-1 uppercase tracking-wider animate-pulse">Low Stock (Min:{p.reorderLevel})</div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setPreviewProduct(p)}
                          className="p-1.5 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-slate-500 transition border dark:border-transparent"
                          title="Generate Barcode / QR Label"
                        >
                          🏷️
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(p)}
                          className="p-1.5 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-blue-500 transition border dark:border-transparent"
                          title="Edit Garment"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-1.5 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-slate-500 transition border dark:border-transparent"
                          title="Remove Product"
                        >
                          🗑️
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

      {/* Add/Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 dark:border-slate-700 p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">
                {editMode ? 'Edit Product Catalog' : 'Add New Product'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 dark:text-slate-500 hover:text-slate-500 text-lg">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Product Thumbnail Image Upload */}
              <div className="p-4 bg-slate-50/70 dark:bg-slate-900/20 border border-slate-200/50 dark:border-slate-800 rounded-2xl flex flex-col sm:flex-row items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-inner">
                  {thumbnail ? (
                    <img src={thumbnail} alt="Garment Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl">👚</span>
                  )}
                </div>
                <div className="flex-1 space-y-1 text-xs w-full">
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">Garment Thumbnail Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    className="block w-full text-[10px] text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[9px] file:font-black file:uppercase file:tracking-wider file:bg-[#3B82F6]/10 file:text-[#3B82F6] hover:file:bg-[#3B82F6]/20 cursor-pointer"
                  />
                  {uploadingImage && <p className="text-[10px] text-[#3B82F6] font-extrabold animate-pulse">Uploading to Cloudinary...</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Classic Linen Shirt"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/30 border border-slate-200/60 dark:border-slate-700 focus:outline-none focus:border-[#3B82F6] text-xs text-slate-800 dark:text-slate-150"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Base SKU Code</label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="LIN-SHT-WT"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/30 border border-slate-200/60 dark:border-slate-700 focus:outline-none focus:border-[#3B82F6] text-xs text-slate-800 dark:text-slate-150"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Barcode ID (UPC/EAN)</label>
                  <input
                    type="text"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    placeholder="Auto-generates if blank"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/30 border border-slate-200/60 dark:border-slate-700 focus:outline-none focus:border-[#3B82F6] text-xs text-slate-800 dark:text-slate-150 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/30 border border-slate-200/60 dark:border-slate-700 focus:outline-none focus:border-[#3B82F6] text-xs text-slate-500 dark:text-slate-450 font-bold"
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Brand</label>
                  <select
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/30 border border-slate-200/60 dark:border-slate-700 focus:outline-none focus:border-[#3B82F6] text-xs text-slate-500 dark:text-slate-450 font-bold"
                  >
                    {brands.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Base Size</label>
                  <select
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/30 border border-slate-200/60 dark:border-slate-700 focus:outline-none focus:border-[#3B82F6] text-xs text-slate-500 dark:text-slate-450 font-bold"
                  >
                    {['XS', 'S', 'M', 'L', 'XL', 'XXL', '38', '40', '42', '44'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Base Color</label>
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="Eggshell White"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/30 border border-slate-200/60 dark:border-slate-700 focus:outline-none focus:border-[#3B82F6] text-xs text-slate-800 dark:text-slate-150"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Fabric</label>
                  <input
                    type="text"
                    value={fabric}
                    onChange={(e) => setFabric(e.target.value)}
                    placeholder="100% Cotton"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/30 border border-slate-200/60 dark:border-slate-700 focus:outline-none focus:border-[#3B82F6] text-xs text-slate-800 dark:text-slate-150"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Purchase Cost (₹) *</label>
                  <input
                    type="number"
                    required
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(e.target.value)}
                    placeholder="500"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/30 border border-slate-200/60 dark:border-slate-700 focus:outline-none focus:border-[#3B82F6] text-xs text-slate-800 dark:text-slate-150 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Selling Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
                    placeholder="1200"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/30 border border-slate-200/60 dark:border-slate-700 focus:outline-none focus:border-[#3B82F6] text-xs text-slate-800 dark:text-slate-150 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Offer Price (₹)</label>
                  <input
                    type="number"
                    value={discountPrice}
                    onChange={(e) => setDiscountPrice(e.target.value)}
                    placeholder="999"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/30 border border-slate-200/60 dark:border-slate-700 focus:outline-none focus:border-[#3B82F6] text-xs text-slate-800 dark:text-slate-150 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Min Reorder Level</label>
                  <input
                    type="number"
                    value={reorderLevel}
                    onChange={(e) => setReorderLevel(e.target.value)}
                    placeholder="5"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/30 border border-slate-200/60 dark:border-slate-700 focus:outline-none focus:border-[#3B82F6] text-xs text-slate-800 dark:text-slate-150 font-bold"
                  />
                </div>
              </div>

              {formVariants.length === 0 && (
                <div className="w-full max-w-xs bg-slate-50 dark:bg-slate-900/20 p-4 border dark:border-slate-800 rounded-2xl">
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Base Product Stock Quantity</label>
                  <input
                    type="number"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value)}
                    placeholder="20"
                    className="w-full px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 focus:outline-none focus:border-[#3B82F6] text-xs text-slate-800 dark:text-slate-150 font-bold"
                  />
                </div>
              )}

              {/* Multiple Variants Configuration */}
              <div className="border-t dark:border-slate-800 pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest">Garment Variants Configuration</h3>
                  <span className="text-[10px] text-slate-400 font-bold bg-slate-50 dark:bg-slate-900 border dark:border-slate-800 px-2 py-0.5 rounded-lg">
                    {formVariants.length} Variants
                  </span>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-900/20 border dark:border-slate-800 rounded-2xl grid grid-cols-1 sm:grid-cols-6 gap-3 items-end">
                  <div>
                    <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Variant Size</label>
                    <select
                      value={varSize}
                      onChange={(e) => setVarSize(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg bg-white dark:bg-slate-800 border dark:border-slate-700 focus:outline-none text-xs font-bold text-slate-800 dark:text-slate-150"
                    >
                      {['XS', 'S', 'M', 'L', 'XL', 'XXL', '38', '40', '42', '44'].map(s => (
                        <option key={s} value={s} className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-150">{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Variant Color *</label>
                    <input
                      type="text"
                      placeholder="Navy Blue"
                      value={varColor}
                      onChange={(e) => setVarColor(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg bg-white dark:bg-slate-800 border dark:border-slate-700 focus:outline-none text-xs text-slate-800 dark:text-slate-150"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Variant SKU</label>
                    <input
                      type="text"
                      placeholder="Optional"
                      value={varSku}
                      onChange={(e) => setVarSku(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg bg-white dark:bg-slate-800 border dark:border-slate-700 focus:outline-none text-xs font-mono text-slate-800 dark:text-slate-150"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Stock</label>
                    <input
                      type="number"
                      value={varStock}
                      onChange={(e) => setVarStock(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg bg-white dark:bg-slate-800 border dark:border-slate-700 focus:outline-none text-xs font-bold text-slate-800 dark:text-slate-150"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Reorder</label>
                    <input
                      type="number"
                      value={varReorder}
                      onChange={(e) => setVarReorder(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg bg-white dark:bg-slate-800 border dark:border-slate-700 focus:outline-none text-xs font-bold text-slate-800 dark:text-slate-150"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddVariant}
                    className="w-full py-1.5 bg-slate-850 hover:bg-slate-900 text-white font-extrabold text-xs rounded-lg transition cursor-pointer"
                  >
                    ＋ Add
                  </button>
                </div>

                {formVariants.length > 0 && (
                  <div className="border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
                    <table className="w-full text-left border-collapse text-[10px]">
                      <thead className="bg-slate-50 dark:bg-slate-900/30 text-slate-400 font-extrabold uppercase tracking-widest">
                        <tr>
                          <th className="p-2.5 pl-4">Size</th>
                          <th className="p-2.5">Color</th>
                          <th className="p-2.5">Variant SKU</th>
                          <th className="p-2.5">Barcode ID</th>
                          <th className="p-2.5 text-center">Stock</th>
                          <th className="p-2.5 text-center">Delete</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                        {formVariants.map((v, i) => (
                          <tr key={v.id || i} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/10">
                            <td className="p-2.5 pl-4 font-black">{v.size}</td>
                            <td className="p-2.5 font-bold text-slate-650 dark:text-slate-300">{v.color}</td>
                            <td className="p-2.5 font-mono text-slate-500">{v.sku}</td>
                            <td className="p-2.5 font-mono text-slate-500">{v.barcode}</td>
                            <td className="p-2.5 text-center font-black text-slate-850 dark:text-slate-200">{v.stockQuantity} Pcs</td>
                            <td className="p-2.5 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveVariant(v.id)}
                                className="text-slate-500 hover:text-red-750 font-bold"
                              >
                                ✕
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 border-t dark:border-slate-800 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-750 text-slate-650 font-bold rounded-xl text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] text-white font-extrabold uppercase tracking-widest text-xs rounded-xl shadow-lg hover:opacity-95 transition"
                >
                  {editMode ? 'Save Changes' : 'Confirm & Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sticker Label Preview Modal */}
      {previewProduct && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md shadow-2xl border border-slate-100 dark:border-slate-750 p-6 space-y-6">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">
                Sticker Label Generator
              </h2>
              <button onClick={() => setPreviewProduct(null)} className="text-slate-400 dark:text-slate-500 hover:text-slate-500">✕</button>
            </div>

            <div className="space-y-6">
              <div className="text-center">
                <h3 className="font-black text-slate-800 dark:text-white uppercase text-sm tracking-wider">{previewProduct.name}</h3>
                <p className="text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-wider">
                  Brand: {previewProduct.brand} | Size: {previewProduct.size} | Fabric: {previewProduct.fabric}
                </p>
                <div className="text-xs font-black text-slate-950 dark:text-white mt-1">
                  M.R.P: ₹{previewProduct.discountPrice || previewProduct.sellingPrice}
                </div>
              </div>

              <div className="p-6 bg-slate-50 border rounded-2xl flex flex-col items-center gap-6 select-all border-dashed">
                <div className="w-full">
                  <div className="text-[7px] font-black uppercase text-slate-400 tracking-widest mb-2 text-center">1D Code-39 Barcode</div>
                  <Barcode value={previewProduct.barcode} height={40} />
                </div>
                <div className="h-px w-full bg-slate-200" />
                <div>
                  <div className="text-[7px] font-black uppercase text-slate-400 tracking-widest mb-2 text-center">2D QR Code</div>
                  <QRCode value={previewProduct.qrcode} size={80} />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => window.print()}
                  className="flex-1 py-3 bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] text-white font-extrabold uppercase tracking-widest text-[10px] rounded-xl shadow-lg transition cursor-pointer"
                >
                  🖨️ Print Sticker
                </button>
                <button
                  onClick={() => navigate('/admin/barcode', { state: { product: previewProduct } })}
                  className="flex-1 py-3 bg-slate-850 hover:bg-slate-900 text-white font-extrabold uppercase tracking-widest text-[10px] rounded-xl transition cursor-pointer"
                >
                  🚀 Bulk Print Stickers
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
