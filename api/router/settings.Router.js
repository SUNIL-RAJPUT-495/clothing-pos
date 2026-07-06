import { Router } from "express";
import { getSettings, updateSettings } from "../controller/settings.controller.js";
import { protect } from "../middleware/authMiddleware.js";

const settingsRouter = Router();

settingsRouter.get("/", getSettings);
settingsRouter.put("/", protect, updateSettings);

export default settingsRouter;
