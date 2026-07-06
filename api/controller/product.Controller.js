import Product from "../modules/product.module.js";
import Brand from "../modules/brand.module.js";
import Category from "../modules/category.module.js";
import SubCategory from "../modules/subCategory.module.js";

export const creatProduct = async (req, res) => {
  try {
    const {
      productName,
      description,
      brand,
      category,
      subCategory,
      fabric,
      gender,
      gst,
      hsnCode,
      tags,
      thumbnail,
      images,
      variants,
      featured,
      trending,
      bestseller,
      newArrival,
      status,
      seo,
    } = req.body;

    // 1. Validate required product-level fields
    if (!productName || !brand || !category) {
      return res.status(400).json({
        success: false,
        message: "Product name, brand, and category are required fields.",
      });
    }

    // 2. Validate variants if provided
    if (variants && Array.isArray(variants)) {
      for (const variant of variants) {
        const { size, color, sku, barcode, purchasePrice, sellingPrice } = variant;
        if (!size || !color || !sku || !barcode || purchasePrice === undefined || sellingPrice === undefined) {
          return res.status(400).json({
            success: false,
            message: "Each variant must have size, color, sku, barcode, purchasePrice, and sellingPrice.",
          });
        }

        // Check if SKU already exists in other products
        const existingSku = await Product.findOne({ "variants.sku": sku.toUpperCase() });
        if (existingSku) {
          return res.status(400).json({
            success: false,
            message: `Variant SKU '${sku}' already exists.`,
          });
        }

        // Check if barcode already exists in other products
        const existingBarcode = await Product.findOne({ "variants.barcode": barcode });
        if (existingBarcode) {
          return res.status(400).json({
            success: false,
            message: `Variant Barcode '${barcode}' already exists.`,
          });
        }
      }
    }

    // 3. Generate unique slug from productName
    let slug = productName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    // Check if slug is unique, if not, append a unique suffix
    let isSlugExists = await Product.findOne({ slug });
    if (isSlugExists) {
      slug = `${slug}-${Date.now()}`;
    }

    // 4. Create new product
    const newProduct = new Product({
      productName,
      slug,
      description,
      brand,
      category,
      subCategory,
      fabric,
      gender,
      gst,
      hsnCode,
      tags,
      thumbnail,
      images,
      variants,
      featured,
      trending,
      bestseller,
      newArrival,
      status,
      seo,
    });

    await newProduct.save();

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product: newProduct,
    });
  } catch (error) {
    console.error("Create Product Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      productName,
      description,
      brand,
      category,
      subCategory,
      fabric,
      gender,
      gst,
      hsnCode,
      tags,
      thumbnail,
      images,
      variants,
      featured,
      trending,
      bestseller,
      newArrival,
      status,
      seo,
    } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Validate required product-level fields if provided
    if (productName !== undefined && !productName) {
      return res.status(400).json({
        success: false,
        message: "Product name cannot be empty.",
      });
    }
    if (brand !== undefined && !brand) {
      return res.status(400).json({
        success: false,
        message: "Brand cannot be empty.",
      });
    }
    if (category !== undefined && !category) {
      return res.status(400).json({
        success: false,
        message: "Category cannot be empty.",
      });
    }

    // Validate variants if provided
    if (variants !== undefined) {
      if (!Array.isArray(variants)) {
        return res.status(400).json({
          success: false,
          message: "Variants must be an array.",
        });
      }
      for (const variant of variants) {
        const { size, color, sku, barcode, purchasePrice, sellingPrice } = variant;
        if (!size || !color || !sku || !barcode || purchasePrice === undefined || sellingPrice === undefined) {
          return res.status(400).json({
            success: false,
            message: "Each variant must have size, color, sku, barcode, purchasePrice, and sellingPrice.",
          });
        }

        // Check if SKU already exists in other products
        const existingSku = await Product.findOne({
          _id: { $ne: id },
          "variants.sku": sku.toUpperCase(),
        });
        if (existingSku) {
          return res.status(400).json({
            success: false,
            message: `Variant SKU '${sku}' already exists in another product.`,
          });
        }

        // Check if barcode already exists in other products
        const existingBarcode = await Product.findOne({
          _id: { $ne: id },
          "variants.barcode": barcode,
        });
        if (existingBarcode) {
          return res.status(400).json({
            success: false,
            message: `Variant Barcode '${barcode}' already exists in another product.`,
          });
        }
      }
      product.variants = variants;
    }

    // Generate slug if productName changed
    if (productName !== undefined && productName !== product.productName) {
      let slug = productName
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

      let isSlugExists = await Product.findOne({ slug, _id: { $ne: id } });
      if (isSlugExists) {
        slug = `${slug}-${Date.now()}`;
      }
      product.slug = slug;
      product.productName = productName;
    }

    if (description !== undefined) product.description = description;
    if (brand !== undefined) product.brand = brand;
    if (category !== undefined) product.category = category;
    if (subCategory !== undefined) product.subCategory = subCategory;
    if (fabric !== undefined) product.fabric = fabric;
    if (gender !== undefined) product.gender = gender;
    if (gst !== undefined) product.gst = gst;
    if (hsnCode !== undefined) product.hsnCode = hsnCode;
    if (tags !== undefined) product.tags = tags;
    if (thumbnail !== undefined) product.thumbnail = thumbnail;
    if (images !== undefined) product.images = images;
    if (featured !== undefined) product.featured = featured;
    if (trending !== undefined) product.trending = trending;
    if (bestseller !== undefined) product.bestseller = bestseller;
    if (newArrival !== undefined) product.newArrival = newArrival;
    if (status !== undefined) product.status = status;
    if (seo !== undefined) product.seo = seo;

    await product.save();

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("Update Product Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete Product Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const getAllProduct = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, brand, gender, status, search } = req.query;

    const queryObj = {};

    if (category) queryObj.category = category;
    if (brand) queryObj.brand = brand;
    if (gender) queryObj.gender = gender;
    if (status !== undefined) queryObj.status = status === "true";

    if (search) {
      queryObj.$or = [
        { productName: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
        { "variants.sku": { $regex: search, $options: "i" } },
        { "variants.barcode": { $regex: search, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const products = await Product.find(queryObj)
      .populate("brand")
      .populate("category")
      .populate("subCategory")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const totalProducts = await Product.countDocuments(queryObj);

    return res.status(200).json({
      success: true,
      count: products.length,
      totalPages: Math.ceil(totalProducts / Number(limit)),
      currentPage: Number(page),
      totalProducts,
      products,
    });
  } catch (error) {
    console.error("Get All Products Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id)
      .populate("brand")
      .populate("category")
      .populate("subCategory");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Get Product By ID Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const getProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const product = await Product.findOne({ slug })
      .populate("brand")
      .populate("category")
      .populate("subCategory");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Get Product By Slug Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const searchProduct = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const products = await Product.find({
      $or: [
        { productName: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { tags: { $regex: query, $options: "i" } },
        { "variants.sku": { $regex: query, $options: "i" } },
        { "variants.barcode": { $regex: query, $options: "i" } },
      ],
    })
      .populate("brand")
      .populate("category")
      .populate("subCategory")
      .limit(20);

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Search Product Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Brands
export const createBrand = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: "Brand name is required." });
    }
    const existing = await Brand.findOne({ name: { $regex: new RegExp(`^${name.trim()}$`, "i") } });
    if (existing) {
      return res.status(400).json({ success: false, message: "Brand already exists." });
    }
    const newBrand = new Brand({ name: name.trim() });
    await newBrand.save();
    return res.status(201).json({ success: true, message: "Brand created successfully", brand: newBrand });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getBrands = async (req, res) => {
  try {
    const brands = await Brand.find().sort({ name: 1 });
    return res.status(200).json({ success: true, brands });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Categories
export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: "Category name is required." });
    }
    const existing = await Category.findOne({ name: { $regex: new RegExp(`^${name.trim()}$`, "i") } });
    if (existing) {
      return res.status(400).json({ success: false, message: "Category already exists." });
    }
    const newCategory = new Category({ name: name.trim() });
    await newCategory.save();
    return res.status(201).json({ success: true, message: "Category created successfully", category: newCategory });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    return res.status(200).json({ success: true, categories });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// SubCategories
export const createSubCategory = async (req, res) => {
  try {
    const { name, categoryId } = req.body;
    if (!name || !categoryId) {
      return res.status(400).json({ success: false, message: "SubCategory name and Category ID are required." });
    }
    const existing = await SubCategory.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
      category: categoryId
    });
    if (existing) {
      return res.status(400).json({ success: false, message: "SubCategory already exists under this category." });
    }
    const newSubCategory = new SubCategory({ name: name.trim(), category: categoryId });
    await newSubCategory.save();
    return res.status(201).json({ success: true, message: "SubCategory created successfully", subCategory: newSubCategory });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getSubCategories = async (req, res) => {
  try {
    const { categoryId } = req.query;
    const filter = categoryId ? { category: categoryId } : {};
    const subCategories = await SubCategory.find(filter).populate("category").sort({ name: 1 });
    return res.status(200).json({ success: true, subCategories });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};