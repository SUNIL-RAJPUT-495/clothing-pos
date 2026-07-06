import mongoose from "mongoose";

const creditLedgerSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      default: Date.now,
    },
    amount: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ["Credit Sale", "Payment Received", "Adjustment"],
      required: true,
    },
    note: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    mobile: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },
    address: {
      type: String,
      default: "",
    },
    loyaltyPoints: {
      type: Number,
      default: 0,
      min: 0,
    },
    creditLimit: {
      type: Number,
      default: 5000,
      min: 0,
    },
    currentCredit: {
      type: Number,
      default: 0,
      min: 0,
    },
    birthday: {
      type: String,
      default: "",
    },
    anniversary: {
      type: String,
      default: "",
    },
    creditLedger: {
      type: [creditLedgerSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Customer", customerSchema);
