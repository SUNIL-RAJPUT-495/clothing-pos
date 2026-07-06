import { Router } from "express";
import {
  createCustomer,
  getAllCustomers,
  getCustomerByPhone,
  updateCustomer,
  deleteCustomer,
  adjustLoyaltyPoints,
  adjustCustomerCredit,
} from "../controller/customer.controller.js";
import { protect } from "../middleware/authMiddleware.js";

const customerRouter = Router();

customerRouter.post("/", protect, createCustomer);
customerRouter.get("/", protect, getAllCustomers);
customerRouter.get("/phone/:phone", protect, getCustomerByPhone);
customerRouter.put("/:id", protect, updateCustomer);
customerRouter.delete("/:id", protect, deleteCustomer);
customerRouter.post("/loyalty", protect, adjustLoyaltyPoints);
customerRouter.post("/credit", protect, adjustCustomerCredit);

export default customerRouter;
