const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    sku: { type: String, required: true, unique: true, uppercase: true, trim: true },
    category: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: "" },
    price: { type: Number, required: true, min: 0 },
    costPrice: { type: Number, required: true, min: 0 },
    currentStock: { type: Number, required: true, default: 0, min: 0 },
    minimumStock: { type: Number, required: true, default: 10, min: 0 },
    reorderQuantity: { type: Number, required: true, default: 20, min: 1 },
    safetyDays: { type: Number, default: null }, // null => use system default from constants
    unit: { type: String, default: "pcs" },
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier" },
    expiryDate: { type: Date },
    lastRestockedAt: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

productSchema.index({ name: "text", sku: "text", category: "text" });

// Derived, explainable stock status shown throughout the UI
productSchema.methods.getStockStatus = function () {
  if (this.currentStock <= 0) return "OUT_OF_STOCK";
  if (this.currentStock <= this.minimumStock * 0.5) return "CRITICAL";
  if (this.currentStock <= this.minimumStock) return "LOW";
  return "HEALTHY";
};

module.exports = mongoose.model("Product", productSchema);
