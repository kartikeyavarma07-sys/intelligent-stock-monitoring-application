const asyncHandler = require("express-async-handler");
const Supplier = require("../models/Supplier");
const Product = require("../models/Product");

// @desc    Get all suppliers
// @route   GET /api/suppliers
const getSuppliers = asyncHandler(async (req, res) => {
  const suppliers = await Supplier.find().sort({ name: 1 });
  res.json({ success: true, count: suppliers.length, data: suppliers });
});

// @desc    Get single supplier + products they supply
// @route   GET /api/suppliers/:id
const getSupplierById = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findById(req.params.id);
  if (!supplier) {
    res.status(404);
    throw new Error("Supplier not found");
  }
  const products = await Product.find({ supplier: supplier._id, isActive: true }).select("name sku currentStock");
  res.json({ success: true, data: { ...supplier.toObject(), products } });
});

// @desc    Create supplier
// @route   POST /api/suppliers
const createSupplier = asyncHandler(async (req, res) => {
  const supplier = await Supplier.create(req.body);
  res.status(201).json({ success: true, data: supplier });
});

// @desc    Update supplier
// @route   PUT /api/suppliers/:id
const updateSupplier = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findById(req.params.id);
  if (!supplier) {
    res.status(404);
    throw new Error("Supplier not found");
  }
  Object.assign(supplier, req.body);
  await supplier.save();
  res.json({ success: true, data: supplier });
});

// @desc    Delete supplier
// @route   DELETE /api/suppliers/:id
const deleteSupplier = asyncHandler(async (req, res) => {
  const inUse = await Product.countDocuments({ supplier: req.params.id, isActive: true });
  if (inUse > 0) {
    res.status(400);
    throw new Error(`Cannot delete supplier: ${inUse} active product(s) reference it`);
  }
  const supplier = await Supplier.findByIdAndDelete(req.params.id);
  if (!supplier) {
    res.status(404);
    throw new Error("Supplier not found");
  }
  res.json({ success: true, message: "Supplier deleted" });
});

module.exports = { getSuppliers, getSupplierById, createSupplier, updateSupplier, deleteSupplier };
