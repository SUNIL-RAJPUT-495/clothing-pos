import Settings from "../modules/settings.module.js";

// Get Store Settings (inserts a default if none exists)
export const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = new Settings({
        storeName: "My Clothing Boutique",
        storeAddress: "123 Boutique Street, Fashion City",
        phone: "9876543210",
        email: "contact@boutique.com",
        gstin: "",
        imbGatewayEnabled: false,
        imbGatewayToken: "",
        shippingCharge: 100,
        freeShippingThreshold: 2000,
        allowStorePickup: true,
        shippingCarrier: "Local Courier",
        gstRate: 12,
      });
      await settings.save();
    }

    return res.status(200).json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error("Get Settings Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Update Store Settings
export const updateSettings = async (req, res) => {
  try {
    const { storeName, storeAddress, phone, email, gstin, imbGatewayEnabled, imbGatewayToken, shippingCharge, freeShippingThreshold, allowStorePickup, shippingCarrier, gstRate } = req.body;

    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings({});
    }

    if (storeName !== undefined) settings.storeName = storeName;
    if (storeAddress !== undefined) settings.storeAddress = storeAddress;
    if (phone !== undefined) settings.phone = phone;
    if (email !== undefined) settings.email = email;
    if (gstin !== undefined) settings.gstin = gstin;
    if (imbGatewayEnabled !== undefined) settings.imbGatewayEnabled = imbGatewayEnabled;
    if (imbGatewayToken !== undefined) settings.imbGatewayToken = imbGatewayToken;
    if (shippingCharge !== undefined) settings.shippingCharge = Number(shippingCharge);
    if (freeShippingThreshold !== undefined) settings.freeShippingThreshold = Number(freeShippingThreshold);
    if (allowStorePickup !== undefined) settings.allowStorePickup = allowStorePickup;
    if (shippingCarrier !== undefined) settings.shippingCarrier = shippingCarrier;
    if (gstRate !== undefined) settings.gstRate = Number(gstRate);

    await settings.save();

    return res.status(200).json({
      success: true,
      message: "Store settings updated successfully",
      settings,
    });
  } catch (error) {
    console.error("Update Settings Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
