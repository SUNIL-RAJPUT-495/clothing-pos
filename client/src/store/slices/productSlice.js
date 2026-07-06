import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import Axios from '../../utils/Axios';
import SummaryApi from '../../common/SummaryApi';

// Helper: map MongoDB product schema to frontend-expected state structure
const mapApiProductToFrontend = (p) => {
  const defaultVar = p.variants?.[0] || {};
  return {
    id: p._id,
    name: p.productName,
    sku: defaultVar.sku || '',
    barcode: defaultVar.barcode || '',
    qrcode: defaultVar.qrCode || `https://clothingpos.com/prod/${defaultVar.barcode || 'N/A'}`,
    category: p.category?.name || (typeof p.category === 'object' ? p.category.name : p.category) || '',
    brand: p.brand?.name || (typeof p.brand === 'object' ? p.brand.name : p.brand) || '',
    size: defaultVar.size || 'M',
    color: defaultVar.color || '',
    fabric: p.fabric || '',
    purchasePrice: defaultVar.purchasePrice || 0,
    sellingPrice: defaultVar.sellingPrice || 0,
    discountPrice: defaultVar.discountPrice || undefined,
    gstRate: p.gst || 0,
    stockQuantity: p.totalStock !== undefined ? p.totalStock : (p.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) || 0),
    reorderLevel: defaultVar.reorderLevel || 5,
    thumbnail: p.thumbnail || '',
    variants: p.variants?.map(v => ({
      id: v._id,
      size: v.size,
      color: v.color,
      sku: v.sku,
      barcode: v.barcode,
      stockQuantity: v.stock || 0,
      reorderLevel: v.reorderLevel || 5
    })) || []
  };
};

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (_, { rejectWithValue }) => {
    try {
      const prodRes = await Axios({
        method: SummaryApi.getProduct.method,
        url: `${SummaryApi.getProduct.url}?limit=1000`
      });
      const brandRes = await Axios({
        method: SummaryApi.getBrands.method,
        url: SummaryApi.getBrands.url
      });
      const catRes = await Axios({
        method: SummaryApi.getCategories.method,
        url: SummaryApi.getCategories.url
      });

      return {
        products: prodRes.data.products || [],
        brands: brandRes.data.brands || [],
        categories: catRes.data.categories || []
      };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch catalog data');
    }
  }
);

export const addProduct = createAsyncThunk(
  'products/addProduct',
  async (productData, { getState, rejectWithValue }) => {
    try {
      const state = getState().products;
      const brandObj = state.rawBrands?.find(b => b.name.toLowerCase() === productData.brand.toLowerCase());
      const categoryObj = state.rawCategories?.find(c => c.name.toLowerCase() === productData.category.toLowerCase());

      const brandId = brandObj?._id || productData.brand;
      const categoryId = categoryObj?._id || productData.category;

      const formattedVariants = productData.variants?.length > 0 ? productData.variants.map(v => ({
        size: v.size,
        color: v.color,
        sku: v.sku,
        barcode: v.barcode,
        purchasePrice: Number(productData.purchasePrice),
        sellingPrice: Number(productData.sellingPrice),
        discountPrice: productData.discountPrice ? Number(productData.discountPrice) : 0,
        stock: Number(v.stockQuantity),
        reorderLevel: Number(v.reorderLevel)
      })) : [{
        size: productData.size,
        color: productData.color,
        sku: productData.sku,
        barcode: productData.barcode,
        purchasePrice: Number(productData.purchasePrice),
        sellingPrice: Number(productData.sellingPrice),
        discountPrice: productData.discountPrice ? Number(productData.discountPrice) : 0,
        stock: Number(productData.stockQuantity),
        reorderLevel: Number(productData.reorderLevel)
      }];

      const payload = {
        productName: productData.name,
        description: productData.description || '',
        brand: brandId,
        category: categoryId,
        fabric: productData.fabric,
        gst: Number(productData.gstRate),
        thumbnail: productData.thumbnail || '',
        variants: formattedVariants
      };

      const response = await Axios({
        method: SummaryApi.addProduct.method,
        url: SummaryApi.addProduct.url,
        data: payload
      });

      return response.data.product;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create garment');
    }
  }
);

export const editProduct = createAsyncThunk(
  'products/editProduct',
  async (productData, { getState, rejectWithValue }) => {
    try {
      const state = getState().products;
      const brandObj = state.rawBrands?.find(b => b.name.toLowerCase() === productData.brand.toLowerCase());
      const categoryObj = state.rawCategories?.find(c => c.name.toLowerCase() === productData.category.toLowerCase());

      const brandId = brandObj?._id || productData.brand;
      const categoryId = categoryObj?._id || productData.category;

      const formattedVariants = productData.variants?.length > 0 ? productData.variants.map(v => ({
        size: v.size,
        color: v.color,
        sku: v.sku,
        barcode: v.barcode,
        purchasePrice: Number(productData.purchasePrice),
        sellingPrice: Number(productData.sellingPrice),
        discountPrice: productData.discountPrice ? Number(productData.discountPrice) : 0,
        stock: Number(v.stockQuantity || 0),
        reorderLevel: Number(v.reorderLevel || 5)
      })) : [{
        size: productData.size,
        color: productData.color,
        sku: productData.sku,
        barcode: productData.barcode,
        purchasePrice: Number(productData.purchasePrice),
        sellingPrice: Number(productData.sellingPrice),
        discountPrice: productData.discountPrice ? Number(productData.discountPrice) : 0,
        stock: Number(productData.stockQuantity || 0),
        reorderLevel: Number(productData.reorderLevel || 5)
      }];

      const payload = {
        productName: productData.name,
        description: productData.description || '',
        brand: brandId,
        category: categoryId,
        fabric: productData.fabric,
        gst: Number(productData.gstRate),
        thumbnail: productData.thumbnail || '',
        variants: formattedVariants
      };

      const response = await Axios({
        method: SummaryApi.updateProduct.method,
        url: SummaryApi.updateProduct.url.replace(':id', productData.id),
        data: payload
      });

      return response.data.product;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update garment');
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (productId, { rejectWithValue }) => {
    try {
      await Axios({
        method: SummaryApi.deleteProduct.method,
        url: SummaryApi.deleteProduct.url.replace(':id', productId)
      });
      return productId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete garment');
    }
  }
);

export const addCategory = createAsyncThunk(
  'products/addCategory',
  async (categoryName, { rejectWithValue }) => {
    try {
      const response = await Axios({
        method: SummaryApi.createCategory.method,
        url: SummaryApi.createCategory.url,
        data: { name: categoryName }
      });
      return response.data.category;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to add category');
    }
  }
);

export const addBrand = createAsyncThunk(
  'products/addBrand',
  async (brandName, { rejectWithValue }) => {
    try {
      const response = await Axios({
        method: SummaryApi.createBrand.method,
        url: SummaryApi.createBrand.url,
        data: { name: brandName }
      });
      return response.data.brand;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to add brand');
    }
  }
);

const initialCategories = ['Menswear', 'Womenswear', 'Kids', 'Ethnic Wear', 'Winterwear', 'Accessories'];
const initialBrands = ['Levis', 'Zara', 'BIBA', 'H&M', 'Nike', 'Van Heusen', 'Self Fabricated'];

const initialState = {
  products: [],
  categories: initialCategories,
  brands: initialBrands,
  rawCategories: [], // full Category docs
  rawBrands: [],     // full Brand docs
  loading: false,
  error: null
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    updateStock: (state, action) => {
      const { productId, variantId, changeQty } = action.payload;
      const product = state.products.find(p => p.id === productId);
      if (product) {
        product.stockQuantity = Math.max(0, product.stockQuantity + changeQty);
        if (variantId && product.variants) {
          const variant = product.variants.find(v => v.id === variantId);
          if (variant) {
            variant.stockQuantity = Math.max(0, variant.stockQuantity + changeQty);
          }
        }
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.rawBrands = action.payload.brands;
        state.rawCategories = action.payload.categories;
        state.brands = action.payload.brands.map(b => b.name);
        state.categories = action.payload.categories.map(c => c.name);
        state.products = action.payload.products.map(p => mapApiProductToFrontend(p));
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add Product
      .addCase(addProduct.fulfilled, (state, action) => {
        state.products.push(mapApiProductToFrontend(action.payload));
      })
      // Edit Product
      .addCase(editProduct.fulfilled, (state, action) => {
        const mapped = mapApiProductToFrontend(action.payload);
        const idx = state.products.findIndex(p => p.id === mapped.id);
        if (idx !== -1) {
          state.products[idx] = mapped;
        }
      })
      // Delete Product
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.products = state.products.filter(p => p.id !== action.payload);
      })
      // Add Category
      .addCase(addCategory.fulfilled, (state, action) => {
        state.rawCategories.push(action.payload);
        if (!state.categories.includes(action.payload.name)) {
          state.categories.push(action.payload.name);
        }
      })
      // Add Brand
      .addCase(addBrand.fulfilled, (state, action) => {
        state.rawBrands.push(action.payload);
        if (!state.brands.includes(action.payload.name)) {
          state.brands.push(action.payload.name);
        }
      });
  }
});

export const { updateStock } = productSlice.actions;
export default productSlice.reducer;
