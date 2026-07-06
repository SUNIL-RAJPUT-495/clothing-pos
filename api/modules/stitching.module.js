import mongoose from "mongoose";

const stitchingSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    customerMobile: {
      type: String,
      required: true,
      trim: true,
    },
    orderType: {
      type: String,
      enum: ["Alteration", "Custom Stitching"],
      required: true,
    },
    items: {
      type: String,
      required: true,
      trim: true,
    },
    measurements: {
      type: Map,
      of: String,
      default: {},
    },
    tailorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tailor",
      required: true,
    },
    tailorName: {
      type: String,
      required: true,
    },
    deliveryDate: {
      type: String,
      required: true,
    },
    charges: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Ready for Delivery", "Delivered", "Cancelled"],
      default: "Pending",
    },
    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("StitchingOrder", stitchingSchema);
