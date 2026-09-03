const asyncHandler = require("express-async-handler");
const Product = require("../models/Product");

// @desc    Get all products (search, filter by category, sort)
// @route   GET /api/products
// @access  Private
const getProducts = asyncHandler(async (req, res) => {
  const { search, category, sortBy = "name", order = "asc", status } = req.query;

  const query = { isActive: true };
  if (search) query.$text = { $search: search };
  if (category && category !== "all") query.category = category;

  let products = await Product.find(query)
    .populate("supplier", "name leadTimeDays")
    .sort({ [sortBy]: order === "asc" ? 1 : -1 });

  // Stock status filter is derived, so applied in memory after fetch
  if (status && status !== "all") {
    products = products.filter((p) => p.getStockStatus() === status);
  }

  const withStatus = products.map((p) => ({ ...p.toObject(), stockStatus: p.getStockStatus() }));

  res.json({ success: true, count: withStatus.length, data: withStatus });
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Private
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate("supplier", "name leadTimeDays phone email");
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  res.json({ success: true, data: { ...product.toObject(), stockStatus: product.getStockStatus() } });
});

// @desc    Create product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const { sku } = req.body;
  const existing = await Product.findOne({ sku: sku?.toUpperCase() });
  if (existing) {
    res.status(400);
    throw new Error(`A product with SKU "${sku}" already exists`);
  }
  const product = await Product.create(req.body);
  res.status(201).json({ success: true, data: product });
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  Object.assign(product, req.body);
  await product.save();
  res.json({ success: true, data: product });
});

// @desc    Delete product (soft delete)
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  product.isActive = false;
  await product.save();
  res.json({ success: true, message: "Product deleted" });
});

// @desc    Get distinct categories (for filter dropdown)
// @route   GET /api/products/meta/categories
// @access  Private
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Product.distinct("category", { isActive: true });
  res.json({ success: true, data: categories });
});

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct, getCategories };
