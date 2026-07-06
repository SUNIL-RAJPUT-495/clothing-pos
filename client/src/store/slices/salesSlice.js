import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import Axios from '../../utils/Axios';
import SummaryApi from '../../common/SummaryApi';

// Helper: map backend Cart/Order schema to frontend format
const mapApiOrderToFrontend = (o) => ({
  id: o.billNumber,
  date: o.createdAt,
  customerMobile: o.customerPhone || 'Walk-in',
  customerName: o.customerName || 'Guest Customer',
  items: o.items?.map(i => ({
    productId: i.product,
    variantId: i.variant,
    name: i.productName,
    qty: i.quantity,
    sellingPrice: i.sellingPrice,
    discountPrice: i.sellingPrice - i.discount,
    size: i.size,
    color: i.color,
    sku: i.sku
  })) || [],
  subtotal: o.subTotal || o.grandTotal,
  discount: o.discountAmount || 0,
  gst: o.gstAmount || 0,
  total: o.grandTotal,
  paymentMethod: [{ method: o.paymentMethod?.toUpperCase() || 'CASH', amount: o.grandTotal }],
  status: o.cartStatus === 'completed' ? 'Completed' : o.cartStatus === 'cancelled' ? 'Returned' : 'Pending',
  loyaltyPointsEarned: Math.floor(o.grandTotal / 100)
});

// Helper: map backend Held Cart to frontend format
const mapApiHeldBillToFrontend = (hb) => ({
  id: hb._id,
  billNumber: hb.billNumber,
  date: hb.createdAt,
  customerMobile: hb.customerPhone || 'Walk-In',
  customerName: hb.customerName || 'Guest Customer',
  items: hb.items?.map(i => ({
    productId: i.product,
    variantId: i.variant,
    name: i.productName,
    qty: i.quantity,
    sellingPrice: i.sellingPrice,
    discountPrice: i.sellingPrice - i.discount,
    size: i.size,
    color: i.color,
    sku: i.sku,
    gstRate: i.gst
  })) || [],
  subtotal: hb.subTotal || hb.grandTotal,
  grandTotal: hb.grandTotal
});

export const fetchOrders = createAsyncThunk(
  'sales/fetchOrders',
  async (_, { rejectWithValue }) => {
    try {
      const completedRes = await Axios({
        method: SummaryApi.getCompletedSales.method,
        url: SummaryApi.getCompletedSales.url
      });
      const heldRes = await Axios({
        method: SummaryApi.getHeldBills.method,
        url: SummaryApi.getHeldBills.url
      });
      return {
        orders: completedRes.data.orders || [],
        heldBills: heldRes.data.heldBills || []
      };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch sales database');
    }
  }
);

export const completeSale = createAsyncThunk(
  'sales/completeSale',
  async (orderPayload, { getState, rejectWithValue }) => {
    try {
      const productsState = getState().products.products;
      const items = orderPayload.items.map(item => {
        const originalProd = productsState.find(p => p.id === item.productId);
        const originalPurchasePrice = originalProd?.purchasePrice || item.sellingPrice;
        return {
          product: item.productId,
          variant: item.variantId,
          productName: item.name,
          size: item.size,
          color: item.color,
          sku: item.sku,
          barcode: item.sku,
          quantity: item.qty,
          purchasePrice: originalPurchasePrice,
          sellingPrice: item.sellingPrice,
          discount: item.sellingPrice - (item.discountPrice || item.sellingPrice),
          gst: item.gstRate || 0,
          total: (item.discountPrice || item.sellingPrice) * item.qty
        };
      });

      // Map paymentMethod array to singular method or mixed
      let mappedPaymentMethod = 'cash';
      if (orderPayload.paymentMethod && orderPayload.paymentMethod.length > 0) {
        if (orderPayload.paymentMethod.length > 1) {
          mappedPaymentMethod = 'mixed';
        } else {
          const method = orderPayload.paymentMethod[0].method.toLowerCase();
          if (['cash', 'card', 'upi', 'wallet'].includes(method)) {
            mappedPaymentMethod = method;
          }
        }
      }

      const payload = {
        billNumber: orderPayload.id,
        customerPhone: orderPayload.customerMobile !== 'Walk-in' ? orderPayload.customerMobile : '',
        customerName: orderPayload.customerName,
        items,
        subTotal: orderPayload.subtotal,
        discountAmount: orderPayload.discount,
        gstAmount: orderPayload.gst,
        grandTotal: orderPayload.total,
        paymentMethod: mappedPaymentMethod,
        paymentStatus: 'paid',
        cartStatus: 'completed',
        notes: `Points redeemed: ${orderPayload.loyaltyPointsRedeemed || 0}`
      };

      const response = await Axios({
        method: SummaryApi.createOrder.method,
        url: SummaryApi.createOrder.url,
        data: payload
      });

      return response.data.cart;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to complete checkout transaction');
    }
  }
);

export const holdBill = createAsyncThunk(
  'sales/holdBill',
  async (holdPayload, { getState, rejectWithValue }) => {
    try {
      const productsState = getState().products.products;
      const items = holdPayload.items.map(item => {
        const originalProd = productsState.find(p => p.id === item.productId);
        const originalPurchasePrice = originalProd?.purchasePrice || item.sellingPrice;
        return {
          product: item.productId,
          variant: item.variantId,
          productName: item.name,
          size: item.size,
          color: item.color,
          sku: item.sku,
          barcode: item.sku,
          quantity: item.qty,
          purchasePrice: originalPurchasePrice,
          sellingPrice: item.sellingPrice,
          discount: item.sellingPrice - (item.discountPrice || item.sellingPrice),
          gst: item.gstRate || 0,
          total: (item.discountPrice || item.sellingPrice) * item.qty
        };
      });

      const payload = {
        customerPhone: holdPayload.customerMobile !== 'Walk-In' ? holdPayload.customerMobile : '',
        customerName: holdPayload.customerName,
        items,
        subTotal: holdPayload.subtotal,
        grandTotal: holdPayload.grandTotal,
        paymentStatus: 'pending',
        cartStatus: 'hold',
        notes: 'Suspended bill'
      };

      const response = await Axios({
        method: SummaryApi.createOrder.method,
        url: SummaryApi.createOrder.url,
        data: payload
      });

      return response.data.cart;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to hold bill');
    }
  }
);

export const resumeBill = createAsyncThunk(
  'sales/resumeBill',
  async (heldBillId, { rejectWithValue }) => {
    try {
      // Discard/Delete the held bill from backend DB once resumed in POS workspace
      await Axios({
        method: SummaryApi.deleteCart.method,
        url: SummaryApi.deleteCart.url.replace(':id', heldBillId)
      });
      return heldBillId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to resume held bill');
    }
  }
);

export const deleteHeldBill = createAsyncThunk(
  'sales/deleteHeldBill',
  async (heldBillId, { rejectWithValue }) => {
    try {
      await Axios({
        method: SummaryApi.deleteCart.method,
        url: SummaryApi.deleteCart.url.replace(':id', heldBillId)
      });
      return heldBillId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to discard held bill');
    }
  }
);

export const processReturnOrExchange = createAsyncThunk(
  'sales/processReturnOrExchange',
  async ({ orderId, returnedItems, refundAmount, details }, { rejectWithValue }) => {
    try {
      // Format returned items
      const formattedReturnedItems = returnedItems.map(item => ({
        product: item.productId,
        variant: item.variantId || item.productId, // fallback if variantId is missing
        sku: item.sku,
        quantity: item.qty
      }));

      const response = await Axios({
        method: SummaryApi.processReturn.method,
        url: SummaryApi.processReturn.url,
        data: {
          billNumber: orderId,
          returnedItems: formattedReturnedItems,
          refundAmount: Number(refundAmount),
          details
        }
      });
      return response.data.cart;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to process return');
    }
  }
);

const initialCoupons = [
  { code: 'FESTIVE10', type: 'percentage', value: 10, minPurchase: 1000, description: '10% off on orders above ₹1,000' },
  { code: 'FLAT200', type: 'fixed', value: 200, minPurchase: 1500, description: '₹200 flat off on orders above ₹1,500' },
  { code: 'SUPER500', type: 'fixed', value: 500, minPurchase: 4000, description: '₹500 flat off on orders above ₹4,000' }
];

const initialState = {
  orders: [],
  heldBills: [],
  coupons: initialCoupons,
  loading: false,
  error: null
};

const salesSlice = createSlice({
  name: 'sales',
  initialState,
  reducers: {
    addCoupon: (state, action) => {
      state.coupons.push(action.payload);
    },
    deleteCoupon: (state, action) => {
      state.coupons = state.coupons.filter(c => c.code !== action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Orders
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.orders.map(o => mapApiOrderToFrontend(o));
        state.heldBills = action.payload.heldBills.map(hb => mapApiHeldBillToFrontend(hb));
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Complete Sale
      .addCase(completeSale.fulfilled, (state, action) => {
        state.orders.push(mapApiOrderToFrontend(action.payload));
      })
      // Hold Bill
      .addCase(holdBill.fulfilled, (state, action) => {
        state.heldBills.push(mapApiHeldBillToFrontend(action.payload));
      })
      // Resume Bill
      .addCase(resumeBill.fulfilled, (state, action) => {
        state.heldBills = state.heldBills.filter(hb => hb.id !== action.payload);
      })
      // Delete Held Bill
      .addCase(deleteHeldBill.fulfilled, (state, action) => {
        state.heldBills = state.heldBills.filter(hb => hb.id !== action.payload);
      })
      // Return Sale
      .addCase(processReturnOrExchange.fulfilled, (state, action) => {
        const mapped = mapApiOrderToFrontend(action.payload);
        const idx = state.orders.findIndex(o => o.id === mapped.id);
        if (idx !== -1) {
          state.orders[idx] = mapped;
        }
      });
  }
});

export const { addCoupon, deleteCoupon } = salesSlice.actions;
export default salesSlice.reducer;
