import Supplier from "../modules/supplier.module.js";
import StockAdjustment from "../modules/stockAdjustment.module.js";
import PurchaseOrder from "../modules/purchaseOrder.module.js";
import Product from "../modules/product.module.js";

// SUPPLIER CONTROLLERS

// Create Supplier
export const createSupplier = async (req, res) => {
  try {
    const { name, contactPerson, phone, email, address, gstNumber, outstandingBalance } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Supplier name is required.",
      });
    }

    const newSupplier = new Supplier({
      name,
      contactPerson: contactPerson || "",
      phone: phone || "",
      email: email || "",
      address: address || "",
      gstNumber: gstNumber || "",
      outstandingBalance: outstandingBalance !== undefined ? Number(outstandingBalance) : 0,
    });

    await newSupplier.save();

    return res.status(201).json({
      success: true,
      message: "Supplier created successfully",
      supplier: newSupplier,
    });
  } catch (error) {
    console.error("Create Supplier Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Update Supplier
export const updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, contactPerson, phone, email, address, gstNumber, outstandingBalance } = req.body;

    const supplier = await Supplier.findById(id);
    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found",
      });
    }

    if (name !== undefined) supplier.name = name;
    if (contactPerson !== undefined) supplier.contactPerson = contactPerson;
    if (phone !== undefined) supplier.phone = phone;
    if (email !== undefined) supplier.email = email;
    if (address !== undefined) supplier.address = address;
    if (gstNumber !== undefined) supplier.gstNumber = gstNumber;
    if (outstandingBalance !== undefined) supplier.outstandingBalance = Number(outstandingBalance);

    await supplier.save();

    return res.status(200).json({
      success: true,
      message: "Supplier updated successfully",
      supplier,
    });
  } catch (error) {
    console.error("Update Supplier Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Get All Suppliers
export const getAllSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      count: suppliers.length,
      suppliers,
    });
  } catch (error) {
    console.error("Get All Suppliers Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Delete Supplier
export const deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const supplier = await Supplier.findByIdAndDelete(id);
    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Supplier deleted successfully",
    });
  } catch (error) {
    console.error("Delete Supplier Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Adjust Supplier Balance
export const adjustSupplierBalance = async (req, res) => {
  try {
    const { supplierId, changeAmount } = req.body;

    if (!supplierId || changeAmount === undefined) {
      return res.status(400).json({
        success: false,
        message: "Supplier ID and changeAmount are required.",
      });
    }

    const supplier = await Supplier.findById(supplierId);
    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found",
      });
    }

    supplier.outstandingBalance = Math.max(0, supplier.outstandingBalance + Number(changeAmount));
    await supplier.save();

    return res.status(200).json({
      success: true,
      message: "Supplier outstanding balance updated",
      supplier,
    });
  } catch (error) {
    console.error("Adjust Supplier Balance Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};


// STOCK ADJUSTMENT CONTROLLERS

// Create Stock Adjustment
export const createStockAdjustment = async (req, res) => {
  try {
    const { type, productId, variantSku, quantity, reason, user } = req.body;

    if (!type || !productId || !variantSku || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: "Type, productId, variantSku, and quantity are required.",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    // Find the variant
    const variantIndex = product.variants.findIndex(
      (v) => v.sku.toUpperCase() === variantSku.toUpperCase()
    );

    if (variantIndex === -1) {
      return res.status(404).json({
        success: false,
        message: `Variant SKU '${variantSku}' not found in this product.`,
      });
    }

    const adjustQty = Number(quantity);
    const variant = product.variants[variantIndex];

    // Adjust variant stock based on type
    // type: "Stock In" (add), "Damaged Stock" (subtract), "Stock Transfer" (subtract), "Adjustment" (arbitrary add/sub)
    let finalChange = adjustQty;
    if (type === "Damaged Stock" || type === "Stock Transfer") {
      finalChange = -Math.abs(adjustQty);
    }

    variant.stock = Math.max(0, variant.stock + finalChange);
    
    // Save product (pre-save updates totalStock)
    await product.save();

    const adjustment = new StockAdjustment({
      type,
      productId,
      productName: product.productName,
      variantSku: variant.sku,
      quantity: adjustQty,
      reason: reason || "",
      user: user || "Admin",
    });

    await adjustment.save();

    return res.status(201).json({
      success: true,
      message: "Stock adjustment recorded successfully",
      adjustment,
      product,
    });
  } catch (error) {
    console.error("Create Stock Adjustment Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Get All Stock Adjustments
export const getAllStockAdjustments = async (req, res) => {
  try {
    const adjustments = await StockAdjustment.find().sort({ date: -1 });
    return res.status(200).json({
      success: true,
      count: adjustments.length,
      adjustments,
    });
  } catch (error) {
    console.error("Get All Adjustments Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};


// PURCHASE ORDER CONTROLLERS

// Create Purchase Order
export const createPurchaseOrder = async (req, res) => {
  try {
    const { supplierId, items, subtotal, gst, total, paymentStatus } = req.body;

    if (!supplierId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Supplier ID and items array are required.",
      });
    }

    const supplier = await Supplier.findById(supplierId);
    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found",
      });
    }

    // Generate PO ID: PO-YYYYMMDD-XXXX
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    let id = `PO-${dateStr}-${Math.floor(100 + Math.random() * 900)}`;
    let exists = await PurchaseOrder.findOne({ id });
    while (exists) {
      id = `PO-${dateStr}-${Math.floor(100 + Math.random() * 900)}`;
      exists = await PurchaseOrder.findOne({ id });
    }

    const calcSubtotal = subtotal !== undefined ? Number(subtotal) : items.reduce((sum, item) => sum + (item.costPrice * item.quantity), 0);
    const calcGst = gst !== undefined ? Number(gst) : Math.round(calcSubtotal * 0.12);
    const calcTotal = total !== undefined ? Number(total) : calcSubtotal + calcGst;

    const outstandingDues = paymentStatus === "Paid" ? 0 : paymentStatus === "Partial" ? Math.round(calcTotal / 2) : calcTotal;

    const newPO = new PurchaseOrder({
      id,
      supplierId,
      supplierName: supplier.name,
      items,
      subtotal: calcSubtotal,
      gst: calcGst,
      total: calcTotal,
      status: "Sent",
      paymentStatus: paymentStatus || "Pending",
      outstandingDues,
    });

    await newPO.save();

    // Adjust supplier outstanding balance if PO has dues
    if (outstandingDues > 0) {
      supplier.outstandingBalance += outstandingDues;
      await supplier.save();
    }

    return res.status(201).json({
      success: true,
      message: "Purchase order created successfully",
      purchaseOrder: newPO,
    });
  } catch (error) {
    console.error("Create Purchase Order Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Update Purchase Order Status
export const updatePurchaseOrderStatus = async (req, res) => {
  try {
    const { id } = req.params; // custom id or DB _id
    const { status, paymentStatus, outstandingDues } = req.body;

    const po = await PurchaseOrder.findOne({
      $or: [{ id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    });

    if (!po) {
      return res.status(404).json({
        success: false,
        message: "Purchase order not found",
      });
    }

    const previousStatus = po.status;
    const previousDues = po.outstandingDues;

    if (status !== undefined) po.status = status;
    if (paymentStatus !== undefined) po.paymentStatus = paymentStatus;
    if (outstandingDues !== undefined) po.outstandingDues = Number(outstandingDues);

    await po.save();

    // 1. Handle Supplier balance change if dues modified
    if (outstandingDues !== undefined && Number(outstandingDues) !== previousDues) {
      const supplier = await Supplier.findById(po.supplierId);
      if (supplier) {
        const diff = Number(outstandingDues) - previousDues;
        supplier.outstandingBalance = Math.max(0, supplier.outstandingBalance + diff);
        await supplier.save();
      }
    }

    // 2. Handle stock ingestion if status changes to "Received"
    if (status === "Received" && previousStatus !== "Received") {
      // Loop through items and add to stock
      for (const item of po.items) {
        // Find product containing this variant SKU
        const product = await Product.findOne({ "variants.sku": item.sku.toUpperCase() });
        if (product) {
          const vIdx = product.variants.findIndex(v => v.sku.toUpperCase() === item.sku.toUpperCase());
          if (vIdx !== -1) {
            product.variants[vIdx].stock += item.quantity;
            await product.save();
          }
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: "Purchase order updated successfully",
      purchaseOrder: po,
    });
  } catch (error) {
    console.error("Update PO Status Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Get All Purchase Orders
export const getAllPurchaseOrders = async (req, res) => {
  try {
    const pos = await PurchaseOrder.find().sort({ date: -1 });
    return res.status(200).json({
      success: true,
      count: pos.length,
      purchaseOrders: pos,
    });
  } catch (error) {
    console.error("Get All POs Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
