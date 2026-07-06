export const baseURL = "http://localhost:5000";

const SummaryApi = {
  // Authentication
  AdminLogin: {
    url: "/api/user/login",
    method: "post"
  },
  updatePassword: {
    url: "/api/user/update-password",
    method: "put"
  },

  // Customer Management
  createCustomer: {
    url: "/api/customer",
    method: "post"
  },
  getAllCustomers: {
    url: "/api/customer",
    method: "get"
  },
  getCustomerByPhone: {
    url: "/api/customer/phone/:phone",
    method: "get"
  },
  updateCustomer: {
    url: "/api/customer/:id",
    method: "put"
  },
  deleteCustomer: {
    url: "/api/customer/:id",
    method: "delete"
  },
  adjustCustomerLoyalty: {
    url: "/api/customer/loyalty",
    method: "post"
  },
  adjustCustomerCredit: {
    url: "/api/customer/credit",
    method: "post"
  },

  // Product Catalog
  addProduct: {
    url: "/api/product/create",
    method: "post"
  },
  updateProduct: {
    url: "/api/product/update/:id",
    method: "put"
  },
  deleteProduct: {
    url: "/api/product/delete/:id",
    method: "delete"
  },
  getProduct: {
    url: "/api/product",
    method: "get"
  },
  searchProduct: {
    url: "/api/product/search",
    method: "get"
  },
  getProductById: {
    url: "/api/product/id/:id",
    method: "get"
  },
  getProductBySlug: {
    url: "/api/product/slug/:slug",
    method: "get"
  },

  // Brand Management
  getBrands: {
    url: "/api/product/brands",
    method: "get"
  },
  createBrand: {
    url: "/api/product/brands",
    method: "post"
  },

  getCategories: {
    url: "/api/product/categories",
    method: "get"
  },
  createCategory: {
    url: "/api/product/categories",
    method: "post"
  },

  getSubCategories: {
    url: "/api/product/subcategories",
    method: "get"
  },
  createSubCategory: {
    url: "/api/product/subcategories",
    method: "post"
  },

  createOrder: {
    url: "/api/cart/addToCart",
    method: "post"
  },
  getPaymentStats: {
    url: "/api/cart/payment-stats",
    method: "get"
  },
  getHeldBills: {
    url: "/api/cart/held",
    method: "get"
  },
  getCompletedSales: {
    url: "/api/cart/completed",
    method: "get"
  },
  getCartByBillNumber: {
    url: "/api/cart/bill/:billNumber",
    method: "get"
  },
  updateCartStatus: {
    url: "/api/cart/status/:id",
    method: "put"
  },
  deleteCart: {
    url: "/api/cart/:id",
    method: "delete"
  },
  processReturn: {
    url: "/api/cart/return",
    method: "post"
  },

  createSupplier: {
    url: "/api/inventory/supplier",
    method: "post"
  },
  updateSupplier: {
    url: "/api/inventory/supplier/:id",
    method: "put"
  },
  getAllSuppliers: {
    url: "/api/inventory/suppliers",
    method: "get"
  },
  deleteSupplier: {
    url: "/api/inventory/supplier/:id",
    method: "delete"
  },
  adjustSupplierBalance: {
    url: "/api/inventory/supplier/balance",
    method: "post"
  },
  createStockAdjustment: {
    url: "/api/inventory/adjustment",
    method: "post"
  },
  getAllStockAdjustments: {
    url: "/api/inventory/adjustments",
    method: "get"
  },
  createPurchaseOrder: {
    url: "/api/inventory/po",
    method: "post"
  },
  updatePurchaseOrderStatus: {
    url: "/api/inventory/po/:id",
    method: "put"
  },
  getAllPurchaseOrders: {
    url: "/api/inventory/pos",
    method: "get"
  },

  // Stitching & Alteration Module
  createStitchingOrder: {
    url: "/api/stitching/order",
    method: "post"
  },
  updateStitchingOrder: {
    url: "/api/stitching/order/:id",
    method: "put"
  },
  getAllStitchingOrders: {
    url: "/api/stitching/orders",
    method: "get"
  },
  createTailor: {
    url: "/api/stitching/tailors",
    method: "post"
  },
  getAllTailors: {
    url: "/api/stitching/tailors",
    method: "get"
  },

  // Settings
  getSettings: {
    url: "/api/settings",
    method: "get"
  },
  updateSettings: {
    url: "/api/settings",
    method: "put"
  }
};

export default SummaryApi;
