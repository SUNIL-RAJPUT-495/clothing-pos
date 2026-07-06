import mongoose from "mongoose";

const stockAdjustmentSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      default: Date.now,
    },
    type: {
      type: String,
      enum: ["Stock In", "Damaged Stock", "Stock Transfer", "Adjustment"],
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    variantSku: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      default: "",
    },
    user: {
      type: String,
      default: "Admin",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("StockAdjustment", stockAdjustmentSchema);
