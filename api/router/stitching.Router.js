import { Router } from "express";
import {
  createStitchingOrder,
  updateStitchingOrder,
  getAllStitchingOrders,
  createTailor,
  getAllTailors,
} from "../controller/stitching.controller.js";
import { protect } from "../middleware/authMiddleware.js";

const stitchingRouter = Router();

stitchingRouter.post("/order", protect, createStitchingOrder);
stitchingRouter.put("/order/:id", protect, updateStitchingOrder);
stitchingRouter.get("/orders", protect, getAllStitchingOrders);
stitchingRouter.post("/tailors", protect, createTailor);
stitchingRouter.get("/tailors", protect, getAllTailors);

export default stitchingRouter;
