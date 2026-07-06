import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import Axios from '../../utils/Axios';
import SummaryApi from '../../common/SummaryApi';

// Helper: map MongoDB customer schema to frontend state structure
const mapApiCustomerToFrontend = (c) => ({
  id: c._id,
  name: c.name,
  mobile: c.mobile,
  email: c.email || '',
  address: c.address || '',
  loyaltyPoints: c.loyaltyPoints || 0,
  creditLimit: c.creditLimit || 5000,
  currentCredit: c.currentCredit || 0,
  birthday: c.birthday || '',
  anniversary: c.anniversary || '',
  creditLedger: c.creditLedger?.map(entry => ({
    date: entry.date,
    amount: entry.amount,
    type: entry.type,
    note: entry.note || ''
  })) || []
});

export const fetchCustomers = createAsyncThunk(
  'customers/fetchCustomers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await Axios({
        method: SummaryApi.getAllCustomers.method,
        url: SummaryApi.getAllCustomers.url
      });
      return response.data.customers || [];
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch customers');
    }
  }
);

export const addCustomer = createAsyncThunk(
  'customers/addCustomer',
  async (customerData, { rejectWithValue }) => {
    try {
      const response = await Axios({
        method: SummaryApi.createCustomer.method,
        url: SummaryApi.createCustomer.url,
        data: customerData
      });
      return response.data.customer;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to register customer');
    }
  }
);

export const editCustomer = createAsyncThunk(
  'customers/editCustomer',
  async (customerData, { rejectWithValue }) => {
    try {
      const response = await Axios({
        method: SummaryApi.updateCustomer.method,
        url: SummaryApi.updateCustomer.url.replace(':id', customerData.id),
        data: customerData
      });
      return response.data.customer;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update customer details');
    }
  }
);

export const deleteCustomer = createAsyncThunk(
  'customers/deleteCustomer',
  async (customerId, { rejectWithValue }) => {
    try {
      await Axios({
        method: SummaryApi.deleteCustomer.method,
        url: SummaryApi.deleteCustomer.url.replace(':id', customerId)
      });
      return customerId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete customer');
    }
  }
);

export const addLoyaltyPoints = createAsyncThunk(
  'customers/addLoyaltyPoints',
  async ({ mobile, points }, { rejectWithValue }) => {
    try {
      const response = await Axios({
        method: SummaryApi.adjustCustomerLoyalty.method,
        url: SummaryApi.adjustCustomerLoyalty.url,
        data: { mobile, points, operation: 'add' }
      });
      return response.data.customer;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to adjust loyalty points');
    }
  }
);

export const deductLoyaltyPoints = createAsyncThunk(
  'customers/deductLoyaltyPoints',
  async ({ mobile, points }, { rejectWithValue }) => {
    try {
      const response = await Axios({
        method: SummaryApi.adjustCustomerLoyalty.method,
        url: SummaryApi.adjustCustomerLoyalty.url,
        data: { mobile, points, operation: 'deduct' }
      });
      return response.data.customer;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to adjust loyalty points');
    }
  }
);

export const adjustCustomerCredit = createAsyncThunk(
  'customers/adjustCustomerCredit',
  async ({ mobile, amount, type, note }, { rejectWithValue }) => {
    try {
      const response = await Axios({
        method: SummaryApi.adjustCustomerCredit.method,
        url: SummaryApi.adjustCustomerCredit.url,
        data: { mobile, amount, type, note }
      });
      return response.data.customer;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to adjust customer credit');
    }
  }
);

const initialState = {
  customers: [],
  loading: false,
  error: null
};

const customerSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Customers
      .addCase(fetchCustomers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.loading = false;
        state.customers = action.payload.map(c => mapApiCustomerToFrontend(c));
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add Customer
      .addCase(addCustomer.fulfilled, (state, action) => {
        const mapped = mapApiCustomerToFrontend(action.payload);
        const exists = state.customers.find(c => c.mobile === mapped.mobile);
        if (!exists) {
          state.customers.push(mapped);
        }
      })
      // Edit Customer
      .addCase(editCustomer.fulfilled, (state, action) => {
        const mapped = mapApiCustomerToFrontend(action.payload);
        const idx = state.customers.findIndex(c => c.id === mapped.id);
        if (idx !== -1) {
          state.customers[idx] = mapped;
        }
      })
      // Delete Customer
      .addCase(deleteCustomer.fulfilled, (state, action) => {
        state.customers = state.customers.filter(c => c.id !== action.payload);
      })
      // Add Loyalty
      .addCase(addLoyaltyPoints.fulfilled, (state, action) => {
        const mapped = mapApiCustomerToFrontend(action.payload);
        const idx = state.customers.findIndex(c => c.id === mapped.id);
        if (idx !== -1) {
          state.customers[idx] = mapped;
        }
      })
      // Deduct Loyalty
      .addCase(deductLoyaltyPoints.fulfilled, (state, action) => {
        const mapped = mapApiCustomerToFrontend(action.payload);
        const idx = state.customers.findIndex(c => c.id === mapped.id);
        if (idx !== -1) {
          state.customers[idx] = mapped;
        }
      })
      // Adjust Credit
      .addCase(adjustCustomerCredit.fulfilled, (state, action) => {
        const mapped = mapApiCustomerToFrontend(action.payload);
        const idx = state.customers.findIndex(c => c.id === mapped.id);
        if (idx !== -1) {
          state.customers[idx] = mapped;
        }
      });
  }
});

export default customerSlice.reducer;
