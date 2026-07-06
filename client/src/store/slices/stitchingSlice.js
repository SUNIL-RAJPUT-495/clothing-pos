import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import Axios from '../../utils/Axios';
import SummaryApi from '../../common/SummaryApi';

// Helper: map API tailor schema to frontend state structure
const mapApiTailorToFrontend = (t) => ({
  id: t._id,
  name: t.name,
  status: t.status || 'Active',
  specialties: t.specialties || []
});

// Helper: map API stitching order to frontend state structure
const mapApiOrderToFrontend = (o) => ({
  id: o.id,
  _id: o._id,
  customerName: o.customerName,
  customerMobile: o.customerMobile,
  orderType: o.orderType,
  items: o.items,
  measurements: o.measurements || {},
  tailorId: o.tailorId || '',
  tailorName: o.tailorName || '',
  deliveryDate: o.deliveryDate ? o.deliveryDate.split('T')[0] : '',
  charges: o.charges || 0,
  status: o.status || 'Pending',
  notes: o.notes || ''
});

export const fetchStitchingOrders = createAsyncThunk(
  'stitching/fetchStitchingOrders',
  async (_, { rejectWithValue }) => {
    try {
      const ordersRes = await Axios({
        method: SummaryApi.getAllStitchingOrders.method,
        url: SummaryApi.getAllStitchingOrders.url
      });
      const tailorsRes = await Axios({
        method: SummaryApi.getAllTailors.method,
        url: SummaryApi.getAllTailors.url
      });
      return {
        orders: ordersRes.data.orders || [],
        tailors: tailorsRes.data.tailors || []
      };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch stitching data');
    }
  }
);

export const addStitchingOrder = createAsyncThunk(
  'stitching/addStitchingOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await Axios({
        method: SummaryApi.createStitchingOrder.method,
        url: SummaryApi.createStitchingOrder.url,
        data: {
          customerName: orderData.customerName,
          customerMobile: orderData.customerMobile,
          orderType: orderData.orderType,
          items: orderData.items,
          measurements: orderData.measurements,
          tailorId: orderData.tailorId || undefined,
          deliveryDate: orderData.deliveryDate,
          charges: Number(orderData.charges),
          notes: orderData.notes
        }
      });
      return response.data.order;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create stitching order');
    }
  }
);

export const updateStitchingStatus = createAsyncThunk(
  'stitching/updateStitchingStatus',
  async ({ orderId, status }, { rejectWithValue }) => {
    try {
      const response = await Axios({
        method: SummaryApi.updateStitchingOrder.method,
        url: SummaryApi.updateStitchingOrder.url.replace(':id', orderId),
        data: { status }
      });
      return response.data.order;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update order status');
    }
  }
);

export const editStitchingOrder = createAsyncThunk(
  'stitching/editStitchingOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      const id = orderData.id;
      const response = await Axios({
        method: SummaryApi.updateStitchingOrder.method,
        url: SummaryApi.updateStitchingOrder.url.replace(':id', id),
        data: {
          orderType: orderData.orderType,
          items: orderData.items,
          measurements: orderData.measurements,
          tailorId: orderData.tailorId || undefined,
          deliveryDate: orderData.deliveryDate,
          charges: Number(orderData.charges),
          notes: orderData.notes,
          status: orderData.status
        }
      });
      return response.data.order;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update stitching order details');
    }
  }
);

export const addTailor = createAsyncThunk(
  'stitching/addTailor',
  async (tailorData, { rejectWithValue }) => {
    try {
      const response = await Axios({
        method: SummaryApi.createTailor.method,
        url: SummaryApi.createTailor.url,
        data: tailorData
      });
      return response.data.tailor;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create tailor profile');
    }
  }
);

const initialState = {
  stitchingOrders: [],
  tailors: [],
  loading: false,
  error: null
};

const stitchingSlice = createSlice({
  name: 'stitching',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Stitching
      .addCase(fetchStitchingOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStitchingOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.stitchingOrders = action.payload.orders.map(o => mapApiOrderToFrontend(o));
        state.tailors = action.payload.tailors.map(t => mapApiTailorToFrontend(t));
      })
      .addCase(fetchStitchingOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add Order
      .addCase(addStitchingOrder.fulfilled, (state, action) => {
        state.stitchingOrders.unshift(mapApiOrderToFrontend(action.payload));
      })
      // Update Status
      .addCase(updateStitchingStatus.fulfilled, (state, action) => {
        const mapped = mapApiOrderToFrontend(action.payload);
        const idx = state.stitchingOrders.findIndex(o => o.id === mapped.id);
        if (idx !== -1) {
          state.stitchingOrders[idx] = mapped;
        }
      })
      // Edit Order
      .addCase(editStitchingOrder.fulfilled, (state, action) => {
        const mapped = mapApiOrderToFrontend(action.payload);
        const idx = state.stitchingOrders.findIndex(o => o.id === mapped.id);
        if (idx !== -1) {
          state.stitchingOrders[idx] = mapped;
        }
      })
      // Add Tailor
      .addCase(addTailor.fulfilled, (state, action) => {
        state.tailors.push(mapApiTailorToFrontend(action.payload));
      });
  }
});

export default stitchingSlice.reducer;
