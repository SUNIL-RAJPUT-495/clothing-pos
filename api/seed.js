import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "./modules/user.module.js";
import Brand from "./modules/brand.module.js";
import Category from "./modules/category.module.js";
import SubCategory from "./modules/subCategory.module.js";
import Product from "./modules/product.module.js";
import Customer from "./modules/customer.module.js";
import Tailor from "./modules/tailor.module.js";
import StitchingOrder from "./modules/stitching.module.js";
import Supplier from "./modules/supplier.module.js";
import Cart from "./modules/cart.module.js";
import Settings from "./modules/settings.module.js";


dotenv.config();

const seed = async () => {
  try {
    console.log("Connecting to database for seeding...");
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Database connected. Cleaning collections...");

    // Clear existing data
    await User.deleteMany({});
    await Brand.deleteMany({});
    await Category.deleteMany({});
    await SubCategory.deleteMany({});
    await Product.deleteMany({});
    await Customer.deleteMany({});
    await Tailor.deleteMany({});
    await StitchingOrder.deleteMany({});
    await Supplier.deleteMany({});
    await Cart.deleteMany({});
    await Settings.deleteMany({});


    console.log("Collections cleared. Seeding initial data...");

    // 1. Seed Cashier/Admin
    const hashedPassword = await bcrypt.hash("admin123", 12);
    const cashier = new User({
      username: "admin",
      password: hashedPassword,
      isOnline: false,
    });
    await cashier.save();
    console.log("Cashier created (username: admin, password: admin123)");

    // Seed Settings
    const settings = new Settings({
      storeName: "Classic Boutique",
      storeAddress: "123 Fashion Lane, Sector 17, Chandigarh",
      phone: "9876543210",
      email: "contact@classicboutique.com",
      gstin: "03AAAAA1111A1Z1",
      imbGatewayEnabled: false,
      imbGatewayToken: "",
      shippingCharge: 100,
      freeShippingThreshold: 2000,
      allowStorePickup: true,
      shippingCarrier: "Local Courier",
    });
    await settings.save();
    console.log("Store settings seeded.");


    // 2. Seed Brands
    const brandNames = ['Levis', 'Zara', 'BIBA', 'H&M', 'Nike', 'Van Heusen', 'Self Fabricated'];
    const brandDocs = [];
    for (const name of brandNames) {
      const brand = new Brand({ name });
      await brand.save();
      brandDocs.push(brand);
    }
    console.log(`${brandDocs.length} Brands seeded.`);

    // Helper to get brand ID by name
    const getBrandId = (name) => brandDocs.find(b => b.name === name)._id;

    // 3. Seed Categories
    const categoryNames = ['Menswear', 'Womenswear', 'Kids', 'Ethnic Wear', 'Winterwear', 'Accessories'];
    const categoryDocs = [];
    for (const name of categoryNames) {
      const category = new Category({ name });
      await category.save();
      categoryDocs.push(category);
    }
    console.log(`${categoryDocs.length} Categories seeded.`);

    // Helper to get category ID by name
    const getCategoryId = (name) => categoryDocs.find(c => c.name === name)._id;

    // 4. Seed Subcategories
    const subCategories = [
      { name: "Jeans", categoryName: "Menswear" },
      { name: "Shirt", categoryName: "Menswear" },
      { name: "Kurti", categoryName: "Womenswear" },
      { name: "T-Shirt", categoryName: "Womenswear" },
      { name: "Blazer", categoryName: "Menswear" },
    ];
    const subCategoryDocs = [];
    for (const sub of subCategories) {
      const catId = getCategoryId(sub.categoryName);
      const subCat = new SubCategory({ name: sub.name, category: catId });
      await subCat.save();
      subCategoryDocs.push(subCat);
    }
    console.log(`${subCategoryDocs.length} Subcategories seeded.`);

    // Helper to get subcategory ID
    const getSubCategoryId = (name) => subCategoryDocs.find(s => s.name === name)?._id;

    // 5. Seed Products
    const productsData = [
      {
        productName: 'Slim Fit Denim Jeans',
        description: 'Classic denim jeans with stretch comfort.',
        brandName: 'Levis',
        categoryName: 'Menswear',
        subCategoryName: 'Jeans',
        fabric: 'Denim',
        gender: 'men',
        gst: 12,
        hsnCode: '62034200',
        thumbnail: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80&w=200',
        variants: [
          { size: 'S', color: 'Indigo Blue', sku: 'DEN-JN-BL-S', barcode: '8901234002', purchasePrice: 850, sellingPrice: 1899, discountPrice: 1599, stock: 15, reorderLevel: 5 },
          { size: 'M', color: 'Indigo Blue', sku: 'DEN-JN-BL-M', barcode: '8901234001', purchasePrice: 850, sellingPrice: 1899, discountPrice: 1599, stock: 20, reorderLevel: 5 },
          { size: 'L', color: 'Indigo Blue', sku: 'DEN-JN-BL-L', barcode: '8901234003', purchasePrice: 850, sellingPrice: 1899, discountPrice: 1599, stock: 10, reorderLevel: 5 }
        ]
      },
      {
        productName: 'Linen Casual Shirt',
        description: 'Breathable linen shirt for hot summers.',
        brandName: 'Zara',
        categoryName: 'Menswear',
        subCategoryName: 'Shirt',
        fabric: 'Linen Blend',
        gender: 'men',
        gst: 5,
        hsnCode: '62052000',
        thumbnail: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=200',
        variants: [
          { size: 'M', color: 'Pure White', sku: 'LIN-SH-WT-M', barcode: '8901234005', purchasePrice: 600, sellingPrice: 1499, discountPrice: 1299, stock: 3, reorderLevel: 4 },
          { size: 'L', color: 'Pure White', sku: 'LIN-SH-WT-L', barcode: '8901234004', purchasePrice: 600, sellingPrice: 1499, discountPrice: 1299, stock: 5, reorderLevel: 8 }
        ]
      },
      {
        productName: 'Silk Embroidered Kurti',
        description: 'Traditional silk kurti with delicate gold embroidery.',
        brandName: 'BIBA',
        categoryName: 'Womenswear',
        subCategoryName: 'Kurti',
        fabric: 'Raw Silk',
        gender: 'women',
        gst: 12,
        hsnCode: '62041100',
        thumbnail: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=200',
        variants: [
          { size: 'S', color: 'Ruby Red', sku: 'SLK-KT-RD-S', barcode: '8901234006', purchasePrice: 1200, sellingPrice: 2999, discountPrice: 2499, stock: 12, reorderLevel: 3 },
          { size: 'M', color: 'Ruby Red', sku: 'SLK-KT-RD-M', barcode: '8901234007', purchasePrice: 1200, sellingPrice: 2999, discountPrice: 2499, stock: 10, reorderLevel: 3 },
          { size: 'L', color: 'Ruby Red', sku: 'SLK-KT-RD-L', barcode: '8901234008', purchasePrice: 1200, sellingPrice: 2999, discountPrice: 2499, stock: 10, reorderLevel: 3 }
        ]
      },
      {
        productName: 'Oversized Graphic Tee',
        description: 'Casual oversized graphic print cotton tee.',
        brandName: 'H&M',
        categoryName: 'Womenswear',
        subCategoryName: 'T-Shirt',
        fabric: '100% Cotton',
        gender: 'women',
        gst: 5,
        hsnCode: '61091000',
        thumbnail: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=200',
        variants: [
          { size: 'S', color: 'Coal Black', sku: 'COT-TS-BK-S', barcode: '8901234010', purchasePrice: 350, sellingPrice: 999, discountPrice: 799, stock: 15, reorderLevel: 5 },
          { size: 'M', color: 'Coal Black', sku: 'COT-TS-BK-M', barcode: '8901234011', purchasePrice: 350, sellingPrice: 999, discountPrice: 799, stock: 15, reorderLevel: 5 },
          { size: 'L', color: 'Coal Black', sku: 'COT-TS-BK-L', barcode: '8901234012', purchasePrice: 350, sellingPrice: 999, discountPrice: 799, stock: 15, reorderLevel: 5 },
          { size: 'XL', color: 'Coal Black', sku: 'COT-TS-BK-XL', barcode: '8901234009', purchasePrice: 350, sellingPrice: 999, discountPrice: 799, stock: 10, reorderLevel: 5 }
        ]
      },
      {
        productName: 'Premium Wool Blazer',
        description: 'Sleek formal blazer made of fine merino wool.',
        brandName: 'Zara',
        categoryName: 'Menswear',
        subCategoryName: 'Blazer',
        fabric: 'Merino Wool',
        gender: 'men',
        gst: 18,
        hsnCode: '62031100',
        thumbnail: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=200',
        variants: [
          { size: 'M', color: 'Charcoal Grey', sku: 'WOL-BZ-GR-M', barcode: '8901234014', purchasePrice: 2500, sellingPrice: 5999, discountPrice: 4999, stock: 1, reorderLevel: 2 },
          { size: 'L', color: 'Charcoal Grey', sku: 'WOL-BZ-GR-L', barcode: '8901234013', purchasePrice: 2500, sellingPrice: 5999, discountPrice: 4999, stock: 3, reorderLevel: 3 }
        ]
      }
    ];

    const productDocs = [];
    for (const p of productsData) {
      const prod = new Product({
        productName: p.productName,
        slug: p.productName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        description: p.description,
        brand: getBrandId(p.brandName),
        category: getCategoryId(p.categoryName),
        subCategory: getSubCategoryId(p.subCategoryName),
        fabric: p.fabric,
        gender: p.gender,
        gst: p.gst,
        hsnCode: p.hsnCode,
        thumbnail: p.thumbnail,
        variants: p.variants,
        status: true,
      });
      await prod.save();
      productDocs.push(prod);
    }
    console.log(`${productDocs.length} Products seeded.`);

    // 6. Seed Suppliers
    const suppliersData = [
      { name: 'Vardhman Fabrics', contactPerson: 'Amit Vardhman', phone: '9812345678', email: 'sales@vardhman.com', address: 'Ludhiana, Punjab', gstNumber: '03AAAAA1111A1Z1', outstandingBalance: 125000 },
      { name: 'Surat Textile Hub', contactPerson: 'Suresh Patel', phone: '9427182718', email: 'suresh@surathub.in', address: 'Ring Road, Surat, Gujarat', gstNumber: '24BBBBB2222B2Z2', outstandingBalance: 45000 },
      { name: 'Jaipur Block Prints', contactPerson: 'Pooja Sharma', phone: '9582736450', email: 'pooja@jaipurprints.com', address: 'Sanganer, Jaipur, Rajasthan', gstNumber: '08CCCCC3333C3Z3', outstandingBalance: 0 }
    ];
    const supplierDocs = [];
    for (const sup of suppliersData) {
      const supplier = new Supplier(sup);
      await supplier.save();
      supplierDocs.push(supplier);
    }
    console.log(`${supplierDocs.length} Suppliers seeded.`);

    // 7. Seed Tailors
    const tailorsData = [
      { name: 'Master Ramesh (Senior Tailor)', status: 'Active', specialties: ['Suits', 'Blazers', 'Formal Trousers'] },
      { name: 'Sukhdev Singh (Ethnic Specialist)', status: 'Active', specialties: ['Sherwanis', 'Kurta Pajama', 'Nehru Jackets'] },
      { name: 'Karan Kumar (Alteration Expert)', status: 'Active', specialties: ['Jeans tapering', 'Shirt fittings', 'Hemming'] }
    ];
    const tailorDocs = [];
    for (const t of tailorsData) {
      const tailor = new Tailor(t);
      await tailor.save();
      tailorDocs.push(tailor);
    }
    console.log(`${tailorDocs.length} Tailors seeded.`);

    // 8. Seed Customers
    const customersData = [
      {
        name: 'Rajesh Kumar',
        mobile: '9876543210',
        email: 'rajesh.kumar@gmail.com',
        address: 'H.No. 421, Sector 15, Chandigarh',
        loyaltyPoints: 350,
        creditLimit: 10000,
        currentCredit: 2500,
        birthday: '1988-07-02',
        anniversary: '2014-11-20',
        creditLedger: [
          { date: new Date('2026-06-18T10:00:00Z'), amount: 2500, type: 'Credit Sale', note: 'Bill #ORD-2026061801' }
        ]
      },
      {
        name: 'Simran Kaur',
        mobile: '9988776655',
        email: 'simran.kaur@yahoo.com',
        address: 'Plot 18, Phase 7, Mohali',
        loyaltyPoints: 120,
        creditLimit: 5000,
        currentCredit: 0,
        birthday: '1995-10-12',
        anniversary: '2021-02-14',
        creditLedger: []
      },
      {
        name: 'Vijay Sharma',
        mobile: '9811223344',
        email: 'vijay.sharma@outlook.com',
        address: 'Flat 203, Block B, Silver Oaks, Panchkula',
        loyaltyPoints: 75,
        creditLimit: 15000,
        currentCredit: 4500,
        birthday: '1990-07-15',
        anniversary: '2018-05-10',
        creditLedger: [
          { date: new Date('2026-06-25T15:20:00Z'), amount: 4500, type: 'Credit Sale', note: 'Bill #ORD-2026062502' }
        ]
      }
    ];
    const customerDocs = [];
    for (const c of customersData) {
      const customer = new Customer(c);
      await customer.save();
      customerDocs.push(customer);
    }
    console.log(`${customerDocs.length} Customers seeded.`);

    // Helper to get customer ID by mobile
    const getCustomerIdByMobile = (mobile) => customerDocs.find(c => c.mobile === mobile)?._id;

    // 9. Seed Stitching Orders
    const stitchingOrdersData = [
      {
        id: 'ST-1001',
        customerName: 'Rajesh Kumar',
        customerMobile: '9876543210',
        orderType: 'Alteration',
        items: 'Slim Fit Denim Jeans Fitting',
        measurements: {
          waist: '32',
          length: '30',
          hip: '38',
          inseam: '28',
          thigh: '22',
          bottomWidth: '6.5'
        },
        tailorId: tailorDocs[2]._id,
        tailorName: tailorDocs[2].name,
        deliveryDate: '2026-07-03',
        charges: 250,
        status: 'In Progress',
        notes: 'Shorten length by 2 inches and taper from knee to ankle.'
      },
      {
        id: 'ST-1002',
        customerName: 'Vijay Sharma',
        customerMobile: '9811223344',
        orderType: 'Custom Stitching',
        items: 'Wedding Silk Kurta & Pajama Set',
        measurements: {
          chest: '40',
          waist: '36',
          length: '42',
          sleeve: '25',
          shoulder: '18',
          neck: '16',
          hip: '42'
        },
        tailorId: tailorDocs[1]._id,
        tailorName: tailorDocs[1].name,
        deliveryDate: '2026-07-08',
        charges: 1800,
        status: 'Pending',
        notes: 'Stitch using Jaipuri block print silk. Add side pockets.'
      },
      {
        id: 'ST-1003',
        customerName: 'Simran Kaur',
        customerMobile: '9988776655',
        orderType: 'Alteration',
        items: 'Embroidery Silk Kurti Side Fittings',
        measurements: {
          chest: '34',
          waist: '28',
          hip: '36',
          sleeve: '18'
        },
        tailorId: tailorDocs[0]._id,
        tailorName: tailorDocs[0].name,
        deliveryDate: '2026-06-29',
        charges: 150,
        status: 'Ready for Delivery',
        notes: 'Tighten 1.5 inches at the bust and waist.'
      }
    ];

    for (const ord of stitchingOrdersData) {
      const order = new StitchingOrder(ord);
      await order.save();
    }
    console.log(`${stitchingOrdersData.length} Stitching Orders seeded.`);

    // 10. Seed Sales / Completed Carts
    const completedSalesData = [
      {
        billNumber: 'ORD-2026070101',
        cashier: cashier._id,
        customer: getCustomerIdByMobile('9876543210'),
        customerName: 'Rajesh Kumar',
        customerPhone: '9876543210',
        customerEmail: 'rajesh.kumar@gmail.com',
        items: [
          {
            product: productDocs[0]._id,
            variant: productDocs[0].variants[1]._id,
            productName: productDocs[0].productName,
            brand: 'Levis',
            category: 'Menswear',
            size: 'M',
            color: 'Indigo Blue',
            sku: 'DEN-JN-BL-M',
            barcode: '8901234001',
            quantity: 1,
            purchasePrice: 850,
            sellingPrice: 1899,
            discount: 300, // sellingPrice - discountPrice
            gst: 12,
            total: 1599,
          },
          {
            product: productDocs[1]._id,
            variant: productDocs[1].variants[1]._id,
            productName: productDocs[1].productName,
            brand: 'Zara',
            category: 'Menswear',
            size: 'L',
            color: 'Pure White',
            sku: 'LIN-SH-WT-L',
            barcode: '8901234004',
            quantity: 2,
            purchasePrice: 600,
            sellingPrice: 1499,
            discount: 200,
            gst: 5,
            total: 2598,
          }
        ],
        subTotal: 4197,
        discountAmount: 700, // 300 + 400
        gstAmount: 480,
        grandTotal: 4477,
        paymentMethod: 'upi',
        paymentStatus: 'paid',
        cartStatus: 'completed',
        notes: 'Pre-seeded transaction'
      },
      {
        billNumber: 'ORD-2026070102',
        cashier: cashier._id,
        customer: getCustomerIdByMobile('9988776655'),
        customerName: 'Simran Kaur',
        customerPhone: '9988776655',
        customerEmail: 'simran.kaur@yahoo.com',
        items: [
          {
            product: productDocs[2]._id,
            variant: productDocs[2].variants[0]._id,
            productName: productDocs[2].productName,
            brand: 'BIBA',
            category: 'Womenswear',
            size: 'S',
            color: 'Ruby Red',
            sku: 'SLK-KT-RD-S',
            barcode: '8901234006',
            quantity: 1,
            purchasePrice: 1200,
            sellingPrice: 2999,
            discount: 500,
            gst: 12,
            total: 2499,
          }
        ],
        subTotal: 2499,
        discountAmount: 500,
        gstAmount: 300,
        grandTotal: 2799,
        paymentMethod: 'card',
        paymentStatus: 'paid',
        cartStatus: 'completed',
        notes: 'Pre-seeded transaction'
      }
    ];

    for (const c of completedSalesData) {
      const cart = new Cart(c);
      await cart.save();
    }
    console.log(`${completedSalesData.length} Sale Bills seeded.`);

    console.log("Database seeded successfully!");
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    mongoose.connection.close();
    process.exit(1);
  }
};

seed();
