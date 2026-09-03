const asyncHandler = require("express-async-handler");
const Product = require("../models/Product");
const InventoryTransaction = require("../models/InventoryTransaction");
const { applyStockChange } = require("../services/stockService");

// @desc    Get inventory overview (all products with stock status)
// @route   GET /api/inventory
const getInventory = asyncHandler(async (req, res) => {
  const products = await Product.find({ isActive: true }).populate("supplier", "name leadTimeDays").sort({ name: 1 });
  const data = products.map((p) => ({ ...p.toObject(), stockStatus: p.getStockStatus() }));
  res.json({ success: true, count: data.length, data });
});

// @desc    Manually adjust/add/remove stock (not tied to a sale/purchase)
// @route   POST /api/inventory/adjust
// @body    { productId, quantity, transactionType, note }
// quantity should be signed: positive to add, negative to remove.
const adjustStock = asyncHandler(async (req, res) => {
  const { productId, quantity, transactionType = "ADJUSTMENT", note = "" } = req.body;

  if (!productId || quantity === undefined || quantity === 0) {
    res.status(400);
    throw new Error("productId and a non-zero quantity are required");
  }

  const allowedTypes = ["ADJUSTMENT", "RESTOCK", "RETURN"];
  if (!allowedTypes.includes(transactionType)) {
    res.status(400);
    throw new Error(`transactionType must be one of: ${allowedTypes.join(", ")}`);
  }

  const product = await applyStockChange({
    productId,
    quantity: Number(quantity),
    transactionType,
    userId: req.user._id,
    note,
  });

  res.json({ success: true, data: { ...product.toObject(), stockStatus: product.getStockStatus() } });
});

// @desc    Get inventory transaction history (optionally filtered by product)
// @route   GET /api/inventory/transactions
const getTransactions = asyncHandler(async (req, res) => {
  const { productId, type, limit = 100 } = req.query;
  const query = {};
  if (productId) query.product = productId;
  if (type) query.transactionType = type;

  const transactions = await InventoryTransaction.find(query)
    .populate("product", "name sku")
    .populate("createdBy", "name")
    .sort({ createdAt: -1 })
    .limit(Number(limit));

  res.json({ success: true, count: transactions.length, data: transactions });
});

module.exports = { getInventory, adjustStock, getTransactions };
