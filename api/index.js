import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { db } from "./config/DB.js";
import userRouter from "./router/user.Router.js";
import productRouter from "./router/product.Router.js";
import cartRouter from "./router/cart.Router.js";
import customerRouter from "./router/customer.Router.js";
import stitchingRouter from "./router/stitching.Router.js";
import inventoryRouter from "./router/inventory.Router.js";
import settingsRouter from "./router/settings.Router.js";

dotenv.config();

const app = express();

db()

// Middleware
app.use(cors({
  origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/user', userRouter)
app.use('/api/product', productRouter)
app.use('/api/cart', cartRouter)
app.use('/api/customer', customerRouter)
app.use('/api/stitching', stitchingRouter)
app.use('/api/inventory', inventoryRouter)
app.use('/api/settings', settingsRouter)


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});