import { Router } from "express";
import {
  createSupplier,
  updateSupplier,
  getAllSuppliers,
  deleteSupplier,
  adjustSupplierBalance,
  createStockAdjustment,
  getAllStockAdjustments,
  createPurchaseOrder,
  updatePurchaseOrderStatus,
  getAllPurchaseOrders,
} from "../controller/inventory.controller.js";
import { protect } from "../middleware/authMiddleware.js";

const inventoryRouter = Router();

// Suppliers
inventoryRouter.post("/supplier", protect, createSupplier);
inventoryRouter.put("/supplier/:id", protect, updateSupplier);
inventoryRouter.get("/suppliers", protect, getAllSuppliers);
inventoryRouter.delete("/supplier/:id", protect, deleteSupplier);
inventoryRouter.post("/supplier/balance", protect, adjustSupplierBalance);

// Stock Adjustments
inventoryRouter.post("/adjustment", protect, createStockAdjustment);
inventoryRouter.get("/adjustments", protect, getAllStockAdjustments);

// Purchase Orders
inventoryRouter.post("/po", protect, createPurchaseOrder);
inventoryRouter.put("/po/:id", protect, updatePurchaseOrderStatus);
inventoryRouter.get("/pos", protect, getAllPurchaseOrders);

export default inventoryRouter;
