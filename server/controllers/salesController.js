const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const Sale = require("../models/Sale");
const Product = require("../models/Product");
const { applyStockChange } = require("../services/stockService");

const generateInvoiceNumber = async () => {
  const count = await Sale.countDocuments();
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `INV-${datePart}-${String(count + 1).padStart(4, "0")}`;
};

// @desc    Create a sale (billing). Validates stock, records sale, decrements inventory.
// @route   POST /api/sales
// @body    { customerName, items: [{ productId, quantity }], discount, tax, paymentMethod }
const createSale = asyncHandler(async (req, res) => {
  const { customerName, items, discount = 0, tax = 0, paymentMethod } = req.body;

  if (!items || items.length === 0) {
    res.status(400);
    throw new Error("At least one item is required to create a sale");
  }
  if (!paymentMethod) {
    res.status(400);
    throw new Error("Payment method is required");
  }

  // Resolve products and validate stock BEFORE mutating anything
  const resolvedItems = [];
  let subtotal = 0;

  for (const item of items) {
    if (!item.productId || !item.quantity || item.quantity <= 0) {
      res.status(400);
      throw new Error("Each item requires a valid productId and quantity > 0");
    }
    const product = await Product.findById(item.productId);
    if (!product || !product.isActive) {
      res.status(404);
      throw new Error(`Product not found: ${item.productId}`);
    }
    if (product.currentStock < item.quantity) {
      res.status(400);
      throw new Error(`Insufficient stock for "${product.name}". Available: ${product.currentStock}`);
    }
    const lineTotal = product.price * item.quantity;
    subtotal += lineTotal;
    resolvedItems.push({
      product: product._id,
      name: product.name,
      sku: product.sku,
      price: product.price,
      quantity: item.quantity,
      lineTotal,
    });
  }

  const total = Math.max(0, subtotal - Number(discount) + Number(tax));
  const invoiceNumber = await generateInvoiceNumber();

  const sale = await Sale.create({
    invoiceNumber,
    customerName: customerName || "Walk-in Customer",
    items: resolvedItems,
    subtotal,
    discount,
    tax,
    total,
    paymentMethod,
    createdBy: req.user._id,
  });

  // Decrement stock for each item via the shared stock service (auto-logs InventoryTransaction)
  for (const item of resolvedItems) {
    await applyStockChange({
      productId: item.product,
      quantity: -item.quantity,
      transactionType: "SALE",
      userId: req.user._id,
      referenceId: sale._id,
      referenceModel: "Sale",
      note: `Sale ${invoiceNumber}`,
    });
  }

  res.status(201).json({ success: true, data: sale });
});

// @desc    Get sales list (search, filter by date range)
// @route   GET /api/sales
const getSales = asyncHandler(async (req, res) => {
  const { from, to, search, limit = 100 } = req.query;
  const query = {};

  if (from || to) {
    query.createdAt = {};
    if (from) query.createdAt.$gte = new Date(from);
    if (to) query.createdAt.$lte = new Date(to);
  }
  if (search) {
    query.$or = [
      { invoiceNumber: { $regex: search, $options: "i" } },
      { customerName: { $regex: search, $options: "i" } },
    ];
  }

  const sales = await Sale.find(query)
    .populate("createdBy", "name")
    .sort({ createdAt: -1 })
    .limit(Number(limit));

  res.json({ success: true, count: sales.length, data: sales });
});

// @desc    Get single sale (invoice detail)
// @route   GET /api/sales/:id
const getSaleById = asyncHandler(async (req, res) => {
  const sale = await Sale.findById(req.params.id).populate("createdBy", "name");
  if (!sale) {
    res.status(404);
    throw new Error("Sale not found");
  }
  res.json({ success: true, data: sale });
});

module.exports = { createSale, getSales, getSaleById };
