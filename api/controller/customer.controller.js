import Customer from "../modules/customer.module.js";

// Create Customer
export const createCustomer = async (req, res) => {
  try {
    const { name, mobile, email, address, creditLimit, birthday, anniversary } = req.body;

    if (!name || !mobile) {
      return res.status(400).json({
        success: false,
        message: "Customer name and mobile number are required.",
      });
    }

    const existingCustomer = await Customer.findOne({ mobile });
    if (existingCustomer) {
      return res.status(400).json({
        success: false,
        message: "Customer with this mobile number already exists.",
      });
    }

    const newCustomer = new Customer({
      name,
      mobile,
      email,
      address,
      creditLimit: creditLimit !== undefined ? Number(creditLimit) : 5000,
      birthday,
      anniversary,
    });

    await newCustomer.save();

    return res.status(201).json({
      success: true,
      message: "Customer created successfully",
      customer: newCustomer,
    });
  } catch (error) {
    console.error("Create Customer Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Get All Customers
export const getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: customers.length,
      customers,
    });
  } catch (error) {
    console.error("Get All Customers Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Get Customer by Phone
export const getCustomerByPhone = async (req, res) => {
  try {
    const { phone } = req.params;
    const customer = await Customer.findOne({ mobile: phone });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found.",
      });
    }

    return res.status(200).json({
      success: true,
      customer,
    });
  } catch (error) {
    console.error("Get Customer By Phone Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Update Customer details
export const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, mobile, email, address, creditLimit, birthday, anniversary } = req.body;

    const customer = await Customer.findById(id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    if (mobile && mobile !== customer.mobile) {
      const existing = await Customer.findOne({ mobile, _id: { $ne: id } });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: "Another customer is already registered with this mobile number.",
        });
      }
      customer.mobile = mobile;
    }

    if (name !== undefined) customer.name = name;
    if (email !== undefined) customer.email = email;
    if (address !== undefined) customer.address = address;
    if (creditLimit !== undefined) customer.creditLimit = Number(creditLimit);
    if (birthday !== undefined) customer.birthday = birthday;
    if (anniversary !== undefined) customer.anniversary = anniversary;

    await customer.save();

    return res.status(200).json({
      success: true,
      message: "Customer updated successfully",
      customer,
    });
  } catch (error) {
    console.error("Update Customer Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Delete Customer
export const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await Customer.findByIdAndDelete(id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Customer deleted successfully",
    });
  } catch (error) {
    console.error("Delete Customer Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Adjust Loyalty Points
export const adjustLoyaltyPoints = async (req, res) => {
  try {
    const { mobile, points, operation } = req.body; // operation: "add" or "deduct"

    if (!mobile || points === undefined) {
      return res.status(400).json({
        success: false,
        message: "Mobile and points are required.",
      });
    }

    const customer = await Customer.findOne({ mobile });
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found.",
      });
    }

    const pointsNum = Number(points);
    if (operation === "add") {
      customer.loyaltyPoints += pointsNum;
    } else if (operation === "deduct") {
      customer.loyaltyPoints = Math.max(0, customer.loyaltyPoints - pointsNum);
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid operation. Must be 'add' or 'deduct'.",
      });
    }

    await customer.save();

    return res.status(200).json({
      success: true,
      message: `Loyalty points adjusted successfully`,
      customer,
    });
  } catch (error) {
    console.error("Adjust Loyalty Points Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Adjust Customer Credit Ledger
export const adjustCustomerCredit = async (req, res) => {
  try {
    const { mobile, amount, type, note } = req.body; // amount can be positive (add debt) or negative (pay back debt)

    if (!mobile || amount === undefined) {
      return res.status(400).json({
        success: false,
        message: "Mobile and amount are required.",
      });
    }

    const customer = await Customer.findOne({ mobile });
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found.",
      });
    }

    const amountNum = Number(amount);
    
    // Check if adding debt exceeds credit limit
    if (amountNum > 0 && (customer.currentCredit + amountNum > customer.creditLimit)) {
      return res.status(400).json({
        success: false,
        message: `Transaction exceeds customer's credit limit of ₹${customer.creditLimit}. Current debt is ₹${customer.currentCredit}.`,
      });
    }

    customer.currentCredit = Math.max(0, customer.currentCredit + amountNum);

    customer.creditLedger.unshift({
      date: new Date(),
      amount: Math.abs(amountNum),
      type: type || (amountNum > 0 ? "Credit Sale" : "Payment Received"),
      note: note || "",
    });

    await customer.save();

    return res.status(200).json({
      success: true,
      message: "Customer credit updated successfully",
      customer,
    });
  } catch (error) {
    console.error("Adjust Customer Credit Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
