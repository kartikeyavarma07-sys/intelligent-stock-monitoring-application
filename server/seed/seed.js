/**
 * Seed script - populates realistic sample data so the dashboard, inventory,
 * and replenishment engine are meaningful immediately after setup (Section 24).
 *
 * Run with: npm run seed --prefix server
 */
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");

const User = require("../models/User");
const Supplier = require("../models/Supplier");
const Product = require("../models/Product");
const Sale = require("../models/Sale");
const InventoryTransaction = require("../models/InventoryTransaction");

const ANALYSIS_DAYS = 45; // spread sales across 45 days so the 30-day window has good coverage

const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];
const round2 = (n) => Math.round(n * 100) / 100;

const run = async () => {
  await connectDB();
  console.log("Clearing existing data...");
  await Promise.all([
    User.deleteMany({}),
    Supplier.deleteMany({}),
    Product.deleteMany({}),
    Sale.deleteMany({}),
    InventoryTransaction.deleteMany({}),
  ]);

  // ---------- Users ----------
  console.log("Creating users...");
  const admin = await User.create({ name: "Aarav Shah", email: "admin@stocksystem.com", password: "admin123", role: "admin" });
  const staff = await User.create({ name: "Priya Nair", email: "staff@stocksystem.com", password: "staff123", role: "staff" });

  // ---------- Suppliers ----------
  console.log("Creating suppliers...");
  const supplierData = [
    { name: "TechDistributors Pvt Ltd", contactPerson: "Rohan Mehta", phone: "9876500001", email: "sales@techdist.com", address: "MIDC, Andheri, Mumbai", leadTimeDays: 4 },
    { name: "Global Electronics Supply", contactPerson: "Sneha Kulkarni", phone: "9876500002", email: "orders@globalelec.com", address: "Peenya Industrial Area, Bengaluru", leadTimeDays: 7 },
    { name: "Prime Office Essentials", contactPerson: "Vikram Rao", phone: "9876500003", email: "info@primeoffice.com", address: "Sector 18, Noida", leadTimeDays: 3 },
    { name: "Sunrise Packaging & Supplies", contactPerson: "Anjali Verma", phone: "9876500004", email: "contact@sunrisepack.com", address: "GIDC, Ahmedabad", leadTimeDays: 5 },
    { name: "Metro Wholesale Traders", contactPerson: "Karan Singh", phone: "9876500005", email: "metro@wholesale.com", address: "Wadala Truck Terminal, Mumbai", leadTimeDays: 6 },
  ];
  const suppliers = await Supplier.insertMany(supplierData);

  // ---------- Products ----------
  console.log("Creating products...");
  const productDefs = [
    // [name, category, price, costPrice, minimumStock, reorderQty, unit, supplierIdx, initialStock]
    ["Wireless Mouse", "Computer Accessories", 599, 380, 20, 40, "pcs", 0, 8],
    ["Mechanical Keyboard", "Computer Accessories", 2499, 1650, 10, 20, "pcs", 0, 5],
    ["USB-C Cable 1m", "Cables", 199, 95, 50, 100, "pcs", 1, 60],
    ["HDMI Cable 2m", "Cables", 349, 180, 30, 60, "pcs", 1, 22],
    ["27-inch Monitor", "Displays", 15999, 12500, 8, 15, "pcs", 1, 3],
    ["Laptop Stand", "Computer Accessories", 899, 520, 15, 30, "pcs", 0, 18],
    ["Webcam 1080p", "Computer Accessories", 1799, 1150, 12, 24, "pcs", 0, 2],
    ["Bluetooth Speaker", "Audio", 1499, 950, 15, 25, "pcs", 1, 14],
    ["Noise Cancelling Headphones", "Audio", 4999, 3400, 8, 15, "pcs", 1, 6],
    ["A4 Copier Paper (Ream)", "Office Supplies", 299, 210, 40, 80, "pcs", 2, 55],
    ["Ballpoint Pens (Box of 10)", "Office Supplies", 120, 65, 30, 60, "box", 2, 35],
    ["Sticky Notes Pack", "Office Supplies", 89, 45, 25, 50, "pack", 2, 4],
    ["Stapler Heavy Duty", "Office Supplies", 349, 210, 15, 30, "pcs", 2, 12],
    ["Whiteboard Markers (Set of 4)", "Office Supplies", 149, 80, 20, 40, "set", 2, 3],
    ["Corrugated Boxes Medium", "Packaging", 45, 22, 100, 200, "pcs", 3, 130],
    ["Bubble Wrap Roll", "Packaging", 599, 380, 20, 40, "roll", 3, 9],
    ["Packing Tape (6 Rolls)", "Packaging", 299, 165, 25, 50, "pack", 3, 20],
    ["Shipping Labels (100pk)", "Packaging", 199, 110, 30, 60, "pack", 3, 33],
    ["Power Bank 10000mAh", "Electronics", 1299, 850, 20, 40, "pcs", 4, 16],
    ["External Hard Drive 1TB", "Electronics", 3999, 3100, 10, 20, "pcs", 4, 1],
    ["USB Flash Drive 64GB", "Electronics", 649, 400, 25, 50, "pcs", 4, 28],
    ["Desk Organizer", "Office Supplies", 449, 260, 12, 24, "pcs", 2, 10],
  ];

  const products = [];
  for (const [name, category, price, costPrice, minimumStock, reorderQuantity, unit, supplierIdx, initialStock] of productDefs) {
    const sku = name.slice(0, 3).toUpperCase() + "-" + randInt(1000, 9999);
    const product = await Product.create({
      name,
      sku,
      category,
      description: `${name} - quality product sourced from ${suppliers[supplierIdx].name}`,
      price,
      costPrice,
      currentStock: initialStock,
      minimumStock,
      reorderQuantity,
      unit,
      supplier: suppliers[supplierIdx]._id,
      lastRestockedAt: new Date(Date.now() - randInt(1, 20) * 24 * 60 * 60 * 1000),
    });
    products.push(product);
  }

  // ---------- Historical sales across ANALYSIS_DAYS days ----------
  console.log(`Generating historical sales over the last ${ANALYSIS_DAYS} days...`);

  // Assign a "velocity" to each product so the replenishment engine has fast/medium/slow movers
  const velocityMap = {};
  products.forEach((p, idx) => {
    if (idx % 4 === 0) velocityMap[p._id] = "fast"; // ~1 in 4 products fast-moving
    else if (idx % 4 === 1) velocityMap[p._id] = "medium";
    else velocityMap[p._id] = "slow";
  });

  let invoiceCounter = 1;
  let saleCount = 0;

  for (let dayOffset = ANALYSIS_DAYS; dayOffset >= 0; dayOffset--) {
    const day = new Date();
    day.setDate(day.getDate() - dayOffset);

    // 1-3 sales transactions per day
    const salesToday = randInt(1, 3);
    for (let s = 0; s < salesToday; s++) {
      const itemCount = randInt(1, 4);
      const chosenProducts = new Set();
      while (chosenProducts.size < itemCount) {
        chosenProducts.add(randChoice(products));
      }

      const items = [];
      let subtotal = 0;

      for (const product of chosenProducts) {
        const velocity = velocityMap[product._id];
        let qty;
        if (velocity === "fast") qty = randInt(2, 6);
        else if (velocity === "medium") qty = randInt(1, 3);
        else qty = randInt(1, 2);

        const lineTotal = product.price * qty;
        subtotal += lineTotal;
        items.push({
          product: product._id,
          name: product.name,
          sku: product.sku,
          price: product.price,
          quantity: qty,
          lineTotal,
        });
      }

      const discount = Math.random() < 0.2 ? round2(subtotal * 0.05) : 0;
      const tax = round2(subtotal * 0.05);
      const total = round2(subtotal - discount + tax);
      const saleTime = new Date(day);
      saleTime.setHours(randInt(9, 19), randInt(0, 59), 0, 0);

      const invoiceNumber = `INV-${saleTime.toISOString().slice(0, 10).replace(/-/g, "")}-${String(invoiceCounter++).padStart(4, "0")}`;

      const sale = await Sale.create({
        invoiceNumber,
        customerName: randChoice(["Walk-in Customer", "Rahul Traders", "Sunrise Cafe", "Nova Enterprises", "Walk-in Customer"]),
        items,
        subtotal: round2(subtotal),
        discount,
        tax,
        total,
        paymentMethod: randChoice(["CASH", "UPI", "CARD"]),
        createdBy: randChoice([admin._id, staff._id]),
        createdAt: saleTime,
      });

      // Record matching inventory transactions (do NOT re-decrement live stock here for
      // past days beyond what's reflected in each product's current stock baseline;
      // we log history for demand analysis, and set final currentStock explicitly below).
      for (const item of items) {
        await InventoryTransaction.create({
          product: item.product,
          transactionType: "SALE",
          quantity: -item.quantity,
          previousStock: 0, // historical snapshot fields are informational for seed data
          newStock: 0,
          referenceId: sale._id,
          referenceModel: "Sale",
          note: `Sale ${invoiceNumber}`,
          createdBy: sale.createdBy,
          createdAt: saleTime,
        });
      }
      saleCount++;
    }
  }

  console.log(`Created ${saleCount} sales transactions.`);
  console.log("\n--- SEED COMPLETE ---");
  console.log(`Products: ${products.length}`);
  console.log(`Suppliers: ${suppliers.length}`);
  console.log(`Sales: ${saleCount}`);
  console.log("\nDemo login credentials:");
  console.log("  Admin -> email: admin@stocksystem.com | password: admin123");
  console.log("  Staff -> email: staff@stocksystem.com | password: staff123");

  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
