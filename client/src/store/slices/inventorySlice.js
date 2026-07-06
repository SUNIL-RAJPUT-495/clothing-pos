import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import Axios from '../../utils/Axios';
import SummaryApi from '../../common/SummaryApi';

// Helper: map backend supplier schema to frontend format
const mapApiSupplierToFrontend = (s) => ({
  id: s._id,
  name: s.name,
  contactPerson: s.contactPerson || '',
  phone: s.phone || '',
  email: s.email || '',
  address: s.address || '',
  gstNumber: s.gstNumber || '',
  outstandingBalance: s.outstandingBalance || 0
});

// Helper: map backend stock adjustment to frontend format
const mapApiAdjustmentToFrontend = (a) => ({
  id: a._id,
  date: a.date,
  type: a.type,
  productId: a.productId,
  productName: a.productName,
  variantSku: a.variantSku,
  quantity: a.quantity,
  reason: a.reason || '',
  user: a.user || 'Admin'
});

// Helper: map backend purchase order to frontend format
const mapApiPOToFrontend = (p) => ({
  id: p.id,
  _id: p._id,
  date: p.date,
  supplierId: p.supplierId,
  supplierName: p.supplierName,
  items: p.items?.map(i => ({
    sku: i.sku,
    name: i.name,
    costPrice: i.costPrice,
    quantity: i.quantity
  })) || [],
  subtotal: p.subtotal,
  gst: p.gst,
  total: p.total,
  status: p.status || 'Sent',
  paymentStatus: p.paymentStatus || 'Pending',
  outstandingDues: p.outstandingDues || 0
});

export const fetchInventory = createAsyncThunk(
  'inventory/fetchInventory',
  async (_, { rejectWithValue }) => {
    try {
      const suppliersRes = await Axios({
        method: SummaryApi.getAllSuppliers.method,
        url: SummaryApi.getAllSuppliers.url
      });
      const adjustmentsRes = await Axios({
        method: SummaryApi.getAllStockAdjustments.method,
        url: SummaryApi.getAllStockAdjustments.url
      });
      const posRes = await Axios({
        method: SummaryApi.getAllPurchaseOrders.method,
        url: SummaryApi.getAllPurchaseOrders.url
      });

      return {
        suppliers: suppliersRes.data.suppliers || [],
        stockAdjustments: adjustmentsRes.data.adjustments || [],
        purchaseOrders: posRes.data.purchaseOrders || []
      };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch inventory data');
    }
  }
);

export const addSupplier = createAsyncThunk(
  'inventory/addSupplier',
  async (supplierData, { rejectWithValue }) => {
    try {
      const response = await Axios({
        method: SummaryApi.createSupplier.method,
        url: SummaryApi.createSupplier.url,
        data: supplierData
      });
      return response.data.supplier;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to add supplier');
    }
  }
);

export const editSupplier = createAsyncThunk(
  'inventory/editSupplier',
  async (supplierData, { rejectWithValue }) => {
    try {
      const response = await Axios({
        method: SummaryApi.updateSupplier.method,
        url: SummaryApi.updateSupplier.url.replace(':id', supplierData.id),
        data: supplierData
      });
      return response.data.supplier;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update supplier');
    }
  }
);

export const deleteSupplier = createAsyncThunk(
  'inventory/deleteSupplier',
  async (supplierId, { rejectWithValue }) => {
    try {
      await Axios({
        method: SummaryApi.deleteSupplier.method,
        url: SummaryApi.deleteSupplier.url.replace(':id', supplierId)
      });
      return supplierId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete supplier');
    }
  }
);

export const addStockAdjustment = createAsyncThunk(
  'inventory/addStockAdjustment',
  async (adjustmentData, { rejectWithValue }) => {
    try {
      const response = await Axios({
        method: SummaryApi.createStockAdjustment.method,
        url: SummaryApi.createStockAdjustment.url,
        data: adjustmentData
      });
      return response.data.adjustment;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to record stock adjustment');
    }
  }
);

export const createPurchaseOrder = createAsyncThunk(
  'inventory/createPurchaseOrder',
  async (poData, { rejectWithValue }) => {
    try {
      const response = await Axios({
        method: SummaryApi.createPurchaseOrder.method,
        url: SummaryApi.createPurchaseOrder.url,
        data: poData
      });
      return response.data.purchaseOrder;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create purchase order');
    }
  }
);

export const updatePurchaseOrderStatus = createAsyncThunk(
  'inventory/updatePurchaseOrderStatus',
  async ({ poId, status, paymentStatus, outstandingDues }, { rejectWithValue }) => {
    try {
      const response = await Axios({
        method: SummaryApi.updatePurchaseOrderStatus.method,
        url: SummaryApi.updatePurchaseOrderStatus.url.replace(':id', poId),
        data: { status, paymentStatus, outstandingDues }
      });
      return response.data.purchaseOrder;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update PO status');
    }
  }
);

export const adjustSupplierBalance = createAsyncThunk(
  'inventory/adjustSupplierBalance',
  async ({ supplierId, changeAmount }, { rejectWithValue }) => {
    try {
      const response = await Axios({
        method: SummaryApi.adjustSupplierBalance.method,
        url: SummaryApi.adjustSupplierBalance.url,
        data: { supplierId, changeAmount }
      });
      return response.data.supplier;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to adjust supplier balance');
    }
  }
);

const initialState = {
  suppliers: [],
  stockAdjustments: [],
  purchaseOrders: [],
  loading: false,
  error: null
};

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Inventory
      .addCase(fetchInventory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInventory.fulfilled, (state, action) => {
        state.loading = false;
        state.suppliers = action.payload.suppliers.map(s => mapApiSupplierToFrontend(s));
        state.stockAdjustments = action.payload.stockAdjustments.map(a => mapApiAdjustmentToFrontend(a));
        state.purchaseOrders = action.payload.purchaseOrders.map(p => mapApiPOToFrontend(p));
      })
      .addCase(fetchInventory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add Supplier
      .addCase(addSupplier.fulfilled, (state, action) => {
        state.suppliers.push(mapApiSupplierToFrontend(action.payload));
      })
      // Edit Supplier
      .addCase(editSupplier.fulfilled, (state, action) => {
        const mapped = mapApiSupplierToFrontend(action.payload);
        const idx = state.suppliers.findIndex(s => s.id === mapped.id);
        if (idx !== -1) {
          state.suppliers[idx] = mapped;
        }
      })
      // Delete Supplier
      .addCase(deleteSupplier.fulfilled, (state, action) => {
        state.suppliers = state.suppliers.filter(s => s.id !== action.payload);
      })
      // Add Stock Adjustment
      .addCase(addStockAdjustment.fulfilled, (state, action) => {
        state.stockAdjustments.unshift(mapApiAdjustmentToFrontend(action.payload));
      })
      // Create PO
      .addCase(createPurchaseOrder.fulfilled, (state, action) => {
        state.purchaseOrders.unshift(mapApiPOToFrontend(action.payload));
      })
      // Update PO Status
      .addCase(updatePurchaseOrderStatus.fulfilled, (state, action) => {
        const mapped = mapApiPOToFrontend(action.payload);
        const idx = state.purchaseOrders.findIndex(p => p.id === mapped.id);
        if (idx !== -1) {
          state.purchaseOrders[idx] = mapped;
        }
      })
      // Adjust Supplier Balance
      .addCase(adjustSupplierBalance.fulfilled, (state, action) => {
        const mapped = mapApiSupplierToFrontend(action.payload);
        const idx = state.suppliers.findIndex(s => s.id === mapped.id);
        if (idx !== -1) {
          state.suppliers[idx] = mapped;
        }
      });
  }
});

export default inventorySlice.reducer;
