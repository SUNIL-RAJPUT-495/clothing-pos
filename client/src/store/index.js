import { configureStore } from '@reduxjs/toolkit';
import themeReducer from './slices/themeSlice';
import productReducer from './slices/productSlice';
import salesReducer from './slices/salesSlice';
import inventoryReducer from './slices/inventorySlice';
import customerReducer from './slices/customerSlice';
import stitchingReducer from './slices/stitchingSlice';

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    products: productReducer,
    sales: salesReducer,
    inventory: inventoryReducer,
    customers: customerReducer,
    stitching: stitchingReducer,
  },
});

