import React from 'react'
import { Provider } from 'react-redux'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { store } from './store'
import AdminLayout from './layout/AdminLayout'
import ProtectedRoute from './hookes/ProtectedRoute'
import Login from './auth/Login'

// Import implemented pages
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import BarcodeSystem from './pages/BarcodeSystem'
import POS from './pages/POS'
import Inventory from './pages/Inventory'
import Customers from './pages/Customers'
import Stitching from './pages/Stitching'
import Purchases from './pages/Purchases'
import Reports from './pages/Reports'
import WhatsAppSimulator from './pages/WhatsAppSimulator'
import Settings from './pages/Settings'
import Payments from './pages/Payments'
import Shipping from './pages/Shipping'

// Reusable placeholder page for demo / construction
const PlaceholderPage = ({ title }) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200/85 dark:border-slate-700 p-8 min-h-[400px] flex flex-col justify-center items-center text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-red-950/30 flex items-center justify-center text-2xl mb-4 text-[#3B82F6]">
        ⚙️
      </div>
      <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-widest mb-2">
        {title} Component
      </h2>
      <p className="text-slate-500 dark:text-slate-400 max-w-md text-sm font-semibold">
        This view is under development. Redux store and routing are fully configured and functional.
      </p>
    </div>
  )
}

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/admin/login" element={<Login />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />

              {/* Catalog Routes */}
              <Route path="products" element={<Products />} />
              <Route path="products/upload" element={<PlaceholderPage title="Upload Product" />} />
              <Route path="categories" element={<PlaceholderPage title="Categories Management" />} />
              <Route path="subcategories" element={<PlaceholderPage title="Sub-Categories Management" />} />
              <Route path="brands" element={<PlaceholderPage title="Brands Management" />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="barcode" element={<BarcodeSystem />} />

              {/* POS Checkout Route */}
              <Route path="pos" element={<POS />} />

              {/* Stitching Module */}
              <Route path="stitching" element={<Stitching />} />

              {/* Purchase management */}
              <Route path="purchases" element={<Purchases />} />

              {/* Orders Routes */}
              <Route path="orders" element={<PlaceholderPage title="Orders Management" />} />
              <Route path="returns" element={<PlaceholderPage title="Returns Management" />} />
              <Route path="refunds" element={<PlaceholderPage title="Refunds Management" />} />

              {/* Customers Routes */}
              <Route path="users" element={<Customers />} />
              <Route path="reviews" element={<PlaceholderPage title="Reviews Management" />} />

              {/* Marketing Routes */}
              <Route path="coupons" element={<PlaceholderPage title="Coupons Management" />} />
              <Route path="banners" element={<PlaceholderPage title="Banners Management" />} />
              <Route path="offers" element={<PlaceholderPage title="Offers Management" />} />

              {/* Reports & Analytics */}
              <Route path="reports" element={<Reports />} />

              {/* WhatsApp Integration Simulator */}
              <Route path="whatsapp" element={<WhatsAppSimulator />} />

              {/* Settings */}
              <Route path="settings" element={<Settings />} />
              <Route path="shipping" element={<Shipping />} />
              <Route path="payments" element={<Payments />} />

              {/* Other admin paths */}
              <Route path="cms" element={<PlaceholderPage title="CMS Management" />} />
              <Route path="profile" element={<PlaceholderPage title="Admin Profile" />} />
            </Route>
          </Route>

          {/* Catch-all Redirect */}
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Routes>

      </BrowserRouter>
    </Provider >
  )
}

export default App
