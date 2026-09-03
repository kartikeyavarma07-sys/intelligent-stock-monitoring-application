const mongoose = require("mongoose");

const inventoryTransactionSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    transactionType: {
      type: String,
      enum: ["SALE", "PURCHASE", "RESTOCK", "ADJUSTMENT", "RETURN"],
      required: true,
    },
    quantity: { type: Number, required: true }, // positive = stock in, negative = stock out
    previousStock: { type: Number, required: true },
    newStock: { type: Number, required: true },
    referenceId: { type: mongoose.Schema.Types.ObjectId }, // links to Sale/Purchase _id
    referenceModel: { type: String, enum: ["Sale", "Purchase", null], default: null },
    note: { type: String, default: "" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

inventoryTransactionSchema.index({ product: 1, createdAt: -1 });

module.exports = mongoose.model("InventoryTransaction", inventoryTransactionSchema);
