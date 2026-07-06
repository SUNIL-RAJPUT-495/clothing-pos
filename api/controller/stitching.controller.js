import StitchingOrder from "../modules/stitching.module.js";
import Tailor from "../modules/tailor.module.js";

// Create Stitching Order
export const createStitchingOrder = async (req, res) => {
  try {
    const {
      customerName,
      customerMobile,
      orderType,
      items,
      measurements,
      tailorId,
      deliveryDate,
      charges,
      notes,
    } = req.body;

    if (!customerName || !customerMobile || !orderType || !items || !deliveryDate || charges === undefined) {
      return res.status(400).json({
        success: false,
        message: "Customer details, order type, items, delivery date, and charges are required.",
      });
    }

    // Resolve tailor name
    let tailorName = "";
    if (tailorId) {
      const tailor = await Tailor.findById(tailorId);
      if (tailor) {
        tailorName = tailor.name;
      }
    }

    // Generate a unique order ID: ST-XXXX
    let id = `ST-${Math.floor(1000 + Math.random() * 9000)}`;
    let exists = await StitchingOrder.findOne({ id });
    while (exists) {
      id = `ST-${Math.floor(1000 + Math.random() * 9000)}`;
      exists = await StitchingOrder.findOne({ id });
    }

    const newOrder = new StitchingOrder({
      id,
      customerName,
      customerMobile,
      orderType,
      items,
      measurements: measurements || {},
      tailorId,
      tailorName,
      deliveryDate,
      charges: Number(charges),
      status: "Pending",
      notes: notes || "",
    });

    await newOrder.save();

    return res.status(201).json({
      success: true,
      message: "Stitching order created successfully",
      order: newOrder,
    });
  } catch (error) {
    console.error("Create Stitching Order Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Update Stitching Order Details / Status
export const updateStitchingOrder = async (req, res) => {
  try {
    const { id } = req.params; // ST-XXXX order id or DB _id
    const { status, measurements, tailorId, deliveryDate, charges, notes, items } = req.body;

    // Search by both custom id and mongo _id
    const order = await StitchingOrder.findOne({
      $or: [{ id: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Stitching order not found.",
      });
    }

    if (status !== undefined) order.status = status;
    if (measurements !== undefined) order.measurements = measurements;
    if (deliveryDate !== undefined) order.deliveryDate = deliveryDate;
    if (charges !== undefined) order.charges = Number(charges);
    if (notes !== undefined) order.notes = notes;
    if (items !== undefined) order.items = items;

    if (tailorId !== undefined && tailorId !== order.tailorId?.toString()) {
      if (tailorId) {
        const tailor = await Tailor.findById(tailorId);
        if (tailor) {
          order.tailorId = tailorId;
          order.tailorName = tailor.name;
        }
      } else {
        order.tailorId = null;
        order.tailorName = "";
      }
    }

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Stitching order updated successfully",
      order,
    });
  } catch (error) {
    console.error("Update Stitching Order Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Get All Stitching Orders
export const getAllStitchingOrders = async (req, res) => {
  try {
    const orders = await StitchingOrder.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Get All Stitching Orders Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Create Tailor
export const createTailor = async (req, res) => {
  try {
    const { name, specialties, status } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Tailor name is required.",
      });
    }

    const newTailor = new Tailor({
      name,
      specialties: specialties || [],
      status: status || "Active",
    });

    await newTailor.save();

    return res.status(201).json({
      success: true,
      message: "Tailor created successfully",
      tailor: newTailor,
    });
  } catch (error) {
    console.error("Create Tailor Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Get All Tailors
export const getAllTailors = async (req, res) => {
  try {
    const tailors = await Tailor.find().sort({ name: 1 });

    return res.status(200).json({
      success: true,
      count: tailors.length,
      tailors,
    });
  } catch (error) {
    console.error("Get All Tailors Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
