import { Router } from "express";
import {
  creatProduct,
  updateProduct,
  deleteProduct,
  getAllProduct,
  getProductById,
  getProductBySlug,
  searchProduct,
  createBrand,
  getBrands,
  createCategory,
  getCategories,
  createSubCategory,
  getSubCategories,
} from "../controller/product.Controller.js";
import { protect } from "../middleware/authMiddleware.js";

const productRouter = Router();

// Brand Routes
productRouter.post("/brands", protect, createBrand);
productRouter.get("/brands", getBrands);

// Category Routes
productRouter.post("/categories", protect, createCategory);
productRouter.get("/categories", getCategories);

// Subcategory Routes
productRouter.post("/subcategories", protect, createSubCategory);
productRouter.get("/subcategories", getSubCategories);

// Product Catalog Routes
productRouter.post("/create", protect, creatProduct);
productRouter.put("/update/:id", protect, updateProduct);
productRouter.delete("/delete/:id", protect, deleteProduct);
productRouter.get("/", getAllProduct);
productRouter.get("/search", searchProduct);
productRouter.get("/id/:id", getProductById);
productRouter.get("/slug/:slug", getProductBySlug);

export default productRouter;
