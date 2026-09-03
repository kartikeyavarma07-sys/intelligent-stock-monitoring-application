const asyncHandler = require("express-async-handler");
const Purchase = require("../models/Purchase");
const Product = require("../models/Product");
const Supplier = require("../models/Supplier");
const { applyStockChange } = require("../services/stockService");

const generatePurchaseNumber = async () => {
  const count = await Purchase.countDocuments();
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `PO-${datePart}-${String(count + 1).padStart(4, "0")}`;
};

// @desc    Record a purchase/restock. Increases inventory for each item.
// @route   POST /api/purchases
// @body    { supplierId, items: [{ productId, quantity, purchasePrice }] }
const createPurchase = asyncHandler(async (req, res) => {
  const { supplierId, items } = req.body;

  if (!supplierId) {
    res.status(400);
    throw new Error("supplierId is required");
  }
  if (!items || items.length === 0) {
    res.status(400);
    throw new Error("At least one item is required");
  }

  const supplier = await Supplier.findById(supplierId);
  if (!supplier) {
    res.status(404);
    throw new Error("Supplier not found");
  }

  const resolvedItems = [];
  let totalCost = 0;

  for (const item of items) {
    if (!item.productId || !item.quantity || item.quantity <= 0 || item.purchasePrice === undefined) {
      res.status(400);
      throw new Error("Each item requires productId, quantity > 0, and purchasePrice");
    }
    const product = await Product.findById(item.productId);
    if (!product) {
      res.status(404);
      throw new Error(`Product not found: ${item.productId}`);
    }
    const lineTotal = item.purchasePrice * item.quantity;
    totalCost += lineTotal;
    resolvedItems.push({
      product: product._id,
      name: product.name,
      quantity: item.quantity,
      purchasePrice: item.purchasePrice,
      lineTotal,
    });
  }

  const purchaseNumber = await generatePurchaseNumber();

  const purchase = await Purchase.create({
    purchaseNumber,
    supplier: supplierId,
    items: resolvedItems,
    totalCost,
    createdBy: req.user._id,
  });

  // Increase stock for each item via shared stock service
  for (const item of resolvedItems) {
    await applyStockChange({
      productId: item.product,
      quantity: item.quantity,
      transactionType: "PURCHASE",
      userId: req.user._id,
      referenceId: purchase._id,
      referenceModel: "Purchase",
      note: `Purchase ${purchaseNumber} from ${supplier.name}`,
    });
  }

  res.status(201).json({ success: true, data: purchase });
});

// @desc    Get purchases list
// @route   GET /api/purchases
const getPurchases = asyncHandler(async (req, res) => {
  const purchases = await Purchase.find()
    .populate("supplier", "name")
    .populate("createdBy", "name")
    .sort({ createdAt: -1 });
  res.json({ success: true, count: purchases.length, data: purchases });
});

// @desc    Get single purchase
// @route   GET /api/purchases/:id
const getPurchaseById = asyncHandler(async (req, res) => {
  const purchase = await Purchase.findById(req.params.id).populate("supplier", "name").populate("createdBy", "name");
  if (!purchase) {
    res.status(404);
    throw new Error("Purchase not found");
  }
  res.json({ success: true, data: purchase });
});

module.exports = { createPurchase, getPurchases, getPurchaseById };
