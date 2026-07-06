
import mongoose from "mongoose";

const variantSchema = new mongoose.Schema(
  {
    size: {
      type: String,
      required: true,
      trim: true,
    },

    color: {
      type: String,
      required: true,
      trim: true,
    },

    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    barcode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    qrCode: {
      type: String,
      default: "",
    },

    purchasePrice: {
      type: Number,
      required: true,
      min: 0,
    },

    sellingPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    discountPrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    stock: {
      type: Number,
      default: 0,
      min: 0,
    },

    reorderLevel: {
      type: Number,
      default: 5,
      min: 0,
    },

    images: {
      type: [String],
      default: [],
    },

    status: {
      type: Boolean,
      default: true,
    },
  },
  {
    _id: true,
  }
);

const productSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true,
    },

    description: {
      type: String,
      default: "",
    },

    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    subCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCategory",
    },

    fabric: {
      type: String,
      default: "",
    },

    gender: {
      type: String,
      enum: ["men", "women", "kids", "unisex"],
      default: "unisex",
    },

    gst: {
      type: Number,
      default: 0,
    },

    hsnCode: {
      type: String,
      default: "",
    },

    tags: {
      type: [String],
      default: [],
    },

    thumbnail: {
      type: String,
      default: "",
    },

    images: {
      type: [String],
      default: [],
    },

    variants: {
      type: [variantSchema],
      default: [],
    },

    totalStock: {
      type: Number,
      default: 0,
    },

    featured: {
      type: Boolean,
      default: false,
    },

    trending: {
      type: Boolean,
      default: false,
    },

    bestseller: {
      type: Boolean,
      default: false,
    },

    newArrival: {
      type: Boolean,
      default: false,
    },

    status: {
      type: Boolean,
      default: true,
    },

    seo: {
      metaTitle: String,
      metaDescription: String,
      metaKeywords: [String],
    },
  },
  {
    timestamps: true,
  }
);

productSchema.pre("save", function () {
  this.totalStock = this.variants.reduce(
    (total, variant) => total + variant.stock,
    0
  );
});

productSchema.index({
  productName: "text",
  description: "text",
  tags: "text",
});

export default mongoose.model("Product", productSchema);
