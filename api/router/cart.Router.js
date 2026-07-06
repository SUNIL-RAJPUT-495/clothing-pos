import { Router } from "express";
import {
  addToCart,
  getHeldBills,
  getCompletedSales,
  getCartByBillNumber,
  updateCartStatus,
  deleteCart,
  processReturnOrExchange,
  getPaymentStats,
} from "../controller/cart.controller.js";
import { protect } from "../middleware/authMiddleware.js";

const cartRouter = Router();

cartRouter.post("/addToCart", protect, addToCart);
cartRouter.get("/payment-stats", protect, getPaymentStats);
cartRouter.get("/held", protect, getHeldBills);
cartRouter.get("/completed", protect, getCompletedSales);
cartRouter.get("/bill/:billNumber", protect, getCartByBillNumber);
cartRouter.put("/status/:id", protect, updateCartStatus);
cartRouter.delete("/:id", protect, deleteCart);
cartRouter.post("/return", protect, processReturnOrExchange);

export default cartRouter;