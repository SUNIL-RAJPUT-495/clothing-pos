import Cart from "../modules/cart.module.js";
import Product from "../modules/product.module.js";
import Customer from "../modules/customer.module.js";

// Helper: Deduct stock when a bill is completed
const handleStockDeduction = async (items) => {
  for (const item of items) {
    const product = await Product.findById(item.product);
    if (product) {
      // Find variant by variant ID or SKU
      const vIdx = product.variants.findIndex(
        (v) =>
          v._id?.toString() === item.variant?.toString() ||
          v.sku.toUpperCase() === item.sku?.toUpperCase()
      );

      if (vIdx !== -1) {
        // Reduce stock (ensure it doesn't go below 0)
        product.variants[vIdx].stock = Math.max(0, product.variants[vIdx].stock - item.quantity);
        await product.save();
      }
    }
  }
};

// Helper: Revert stock (add back) when a bill is cancelled or items returned
const handleStockRestoration = async (items) => {
  for (const item of items) {
    const product = await Product.findById(item.product);
    if (product) {
      const vIdx = product.variants.findIndex(
        (v) =>
          v._id?.toString() === item.variant?.toString() ||
          v.sku.toUpperCase() === item.sku?.toUpperCase()
      );

      if (vIdx !== -1) {
        product.variants[vIdx].stock += item.quantity;
        await product.save();
      }
    }
  }
};

// Helper: Update Customer Loyalty & Credit
const handleCustomerBillingImpact = async (customerPhone, grandTotal, paymentStatus, billNumber) => {
  if (!customerPhone) return;

  const customer = await Customer.findOne({ mobile: customerPhone });
  if (!customer) return;

  // Add Loyalty Points (e.g. 1 point for every 100 INR spent)
  const earnedPoints = Math.floor(grandTotal / 100);
  if (earnedPoints > 0) {
    customer.loyaltyPoints += earnedPoints;
  }

  // Handle Credit Debt if paymentStatus is pending (Credit Sale)
  if (paymentStatus === "pending") {
    customer.currentCredit = Math.min(
      customer.creditLimit,
      customer.currentCredit + grandTotal
    );
    customer.creditLedger.unshift({
      date: new Date(),
      amount: grandTotal,
      type: "Credit Sale",
      note: `Outstanding bill #${billNumber}`,
    });
  } else if (paymentStatus === "partial") {
    // If partial, assume customer paid half and took rest on credit (for POS simplicity)
    const creditAmount = Math.round(grandTotal / 2);
    customer.currentCredit = Math.min(
      customer.creditLimit,
      customer.currentCredit + creditAmount
    );
    customer.creditLedger.unshift({
      date: new Date(),
      amount: creditAmount,
      type: "Credit Sale",
      note: `Partial payment credit on bill #${billNumber}`,
    });
  }

  await customer.save();
};


// Create or Save Cart (Checkout / Hold Bill)
export const addToCart = async (req, res) => {
  try {
    const {
      billNumber,
      customer: customerId,
      customerName,
      customerPhone,
      customerEmail,
      items,
      subTotal,
      discountAmount,
      gstAmount,
      grandTotal,
      paymentMethod,
      paymentStatus,
      cartStatus,
      notes,
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart must contain at least one item.",
      });
    }

    // Resolve Cashier ID from token middleware
    const cashierId = req.user?.id;
    if (!cashierId) {
      return res.status(401).json({
        success: false,
        message: "Cashier authentication required.",
      });
    }

    // Generate unique bill number if not present
    let finalBillNumber = billNumber;
    if (!finalBillNumber) {
      const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      finalBillNumber = `ORD-${todayStr}-${Math.floor(1000 + Math.random() * 9000)}`;
      let exists = await Cart.findOne({ billNumber: finalBillNumber });
      while (exists) {
        finalBillNumber = `ORD-${todayStr}-${Math.floor(1000 + Math.random() * 9000)}`;
        exists = await Cart.findOne({ billNumber: finalBillNumber });
      }
    }

    // Double check if customer ID can be resolved by phone if not passed
    let resolvedCustomerId = customerId;
    if (!resolvedCustomerId && customerPhone) {
      const dbCust = await Customer.findOne({ mobile: customerPhone });
      if (dbCust) {
        resolvedCustomerId = dbCust._id;
      }
    }

    const calculatedTotalItems = items.length;
    const calculatedTotalQty = items.reduce((sum, item) => sum + item.quantity, 0);

    const newCart = new Cart({
      billNumber: finalBillNumber,
      cashier: cashierId,
      customer: resolvedCustomerId || null,
      customerName: customerName || "Walk-in Customer",
      customerPhone: customerPhone || "",
      customerEmail: customerEmail || "",
      items,
      totalItems: calculatedTotalItems,
      totalQuantity: calculatedTotalQty,
      subTotal: subTotal !== undefined ? Number(subTotal) : grandTotal,
      discountAmount: discountAmount !== undefined ? Number(discountAmount) : 0,
      gstAmount: gstAmount !== undefined ? Number(gstAmount) : 0,
      grandTotal: Number(grandTotal),
      paymentMethod: paymentMethod || "cash",
      paymentStatus: paymentStatus || "pending",
      cartStatus: cartStatus || "active",
      notes: notes || "",
    });

    await newCart.save();

    // Side-effects on sale completion
    if (cartStatus === "completed") {
      await handleStockDeduction(items);
      await handleCustomerBillingImpact(customerPhone, grandTotal, paymentStatus, finalBillNumber);
    }

    return res.status(201).json({
      success: true,
      message: cartStatus === "completed" ? "Sale completed successfully" : "Bill saved successfully",
      cart: newCart,
    });
  } catch (error) {
    console.error("Save Cart Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Get All Held Bills (Suspended Carts)
export const getHeldBills = async (req, res) => {
  try {
    const heldCarts = await Cart.find({ cartStatus: "hold" })
      .populate("cashier", "username")
      .sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,
      count: heldCarts.length,
      heldBills: heldCarts,
    });
  } catch (error) {
    console.error("Get Held Bills Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Get All Completed Sales (Orders History)
export const getCompletedSales = async (req, res) => {
  try {
    const completedSales = await Cart.find({ cartStatus: "completed" })
      .populate("cashier", "username")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: completedSales.length,
      orders: completedSales,
    });
  } catch (error) {
    console.error("Get Completed Sales Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Get Bill details by Bill Number
export const getCartByBillNumber = async (req, res) => {
  try {
    const { billNumber } = req.params;
    const cart = await Cart.findOne({ billNumber })
      .populate("cashier", "username")
      .populate("customer");

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Bill not found.",
      });
    }

    return res.status(200).json({
      success: true,
      cart,
    });
  } catch (error) {
    console.error("Get Cart By Bill Number Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Update Cart Status (e.g. complete a held bill)
export const updateCartStatus = async (req, res) => {
  try {
    const { id } = req.params; // DB _id or billNumber
    const { cartStatus, paymentStatus, paymentMethod } = req.body;

    const cart = await Cart.findOne({
      $or: [{ billNumber: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart/Bill not found.",
      });
    }

    const previousStatus = cart.cartStatus;

    if (cartStatus !== undefined) cart.cartStatus = cartStatus;
    if (paymentStatus !== undefined) cart.paymentStatus = paymentStatus;
    if (paymentMethod !== undefined) cart.paymentMethod = paymentMethod;

    await cart.save();

    // Trigger stock deduction and customer impact if status changes from hold to completed
    if (cartStatus === "completed" && previousStatus !== "completed") {
      await handleStockDeduction(cart.items);
      await handleCustomerBillingImpact(
        cart.customerPhone,
        cart.grandTotal,
        cart.paymentStatus,
        cart.billNumber
      );
    }

    return res.status(200).json({
      success: true,
      message: "Cart status updated successfully",
      cart,
    });
  } catch (error) {
    console.error("Update Cart Status Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Delete/Cancel a Held Bill
export const deleteCart = async (req, res) => {
  try {
    const { id } = req.params;

    const cart = await Cart.findById(id);
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart/Bill not found",
      });
    }

    // Revert stock if it was completed (though deletion is usually for held bills)
    if (cart.cartStatus === "completed") {
      await handleStockRestoration(cart.items);
    }

    await Cart.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Bill discarded successfully.",
    });
  } catch (error) {
    console.error("Discard Bill Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Return or Exchange items
export const processReturnOrExchange = async (req, res) => {
  try {
    const { billNumber, returnedItems, refundAmount, details } = req.body;

    if (!billNumber || !returnedItems || !Array.isArray(returnedItems)) {
      return res.status(400).json({
        success: false,
        message: "Bill number and items to return are required.",
      });
    }

    const cart = await Cart.findOne({ billNumber });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Order/Bill not found.",
      });
    }

    // Set cart status to cancelled or add return metadata to notes
    cart.cartStatus = "cancelled";
    cart.notes = `${cart.notes} | Items returned on ${new Date().toLocaleDateString()}: ${details || "Customer Return"}. Refunded ₹${refundAmount || 0}`;
    await cart.save();

    // Restore stock of returned items
    // Form of returnedItems: array of { product, variant, quantity, sku }
    await handleStockRestoration(returnedItems);

    // If customer has credit dues, subtract refund amount from credit
    if (cart.customerPhone) {
      const customer = await Customer.findOne({ mobile: cart.customerPhone });
      if (customer && customer.currentCredit > 0 && refundAmount) {
        customer.currentCredit = Math.max(0, customer.currentCredit - Number(refundAmount));
        customer.creditLedger.unshift({
          date: new Date(),
          amount: Number(refundAmount),
          type: "Adjustment",
          note: `Refund adjustment on returned items for bill #${billNumber}`,
        });
        await customer.save();
      }
    }

    return res.status(200).json({
      success: true,
      message: "Return processed successfully. Inventory replenished.",
      cart,
    });
  } catch (error) {
    console.error("Process Return Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Get Payment Stats (Aggregation of UPI and Cash sales)
export const getPaymentStats = async (req, res) => {
  try {
    const stats = await Cart.aggregate([
      { $match: { cartStatus: "completed" } },
      {
        $group: {
          _id: "$paymentMethod",
          totalAmount: { $sum: "$grandTotal" },
          count: { $sum: 1 },
        },
      },
    ]);

    // Format response values
    const formattedStats = {
      cash: 0,
      upi: 0,
      card: 0,
      wallet: 0,
      mixed: 0,
    };

    stats.forEach((stat) => {
      const method = stat._id?.toLowerCase();
      if (formattedStats[method] !== undefined) {
        formattedStats[method] = stat.totalAmount;
      }
    });

    return res.status(200).json({
      success: true,
      stats: formattedStats,
    });
  } catch (error) {
    console.error("Get Payment Stats Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

