import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    storeName: {
      type: String,
      required: true,
      default: "My Clothing Boutique",
      trim: true,
    },
    storeAddress: {
      type: String,
      default: "123 Boutique Street, Fashion City",
      trim: true,
    },
    phone: {
      type: String,
      default: "9876543210",
      trim: true,
    },
    email: {
      type: String,
      default: "contact@boutique.com",
      trim: true,
      lowercase: true,
    },
    gstin: {
      type: String,
      default: "",
      trim: true,
    },
    imbGatewayEnabled: {
      type: Boolean,
      default: false,
    },
    imbGatewayToken: {
      type: String,
      default: "",
      trim: true,
    },
    shippingCharge: {
      type: Number,
      default: 100,
    },
    freeShippingThreshold: {
      type: Number,
      default: 2000,
    },
    allowStorePickup: {
      type: Boolean,
      default: true,
    },
    shippingCarrier: {
      type: String,
      default: "Local Courier",
      trim: true,
    },
    gstRate: {
      type: Number,
      default: 12,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Settings", settingsSchema);
