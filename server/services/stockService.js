const Product = require("../models/Product");
const InventoryTransaction = require("../models/InventoryTransaction");

/**
 * Central place where stock is ever mutated. Every sale, purchase, restock,
 * manual adjustment, and return goes through this function so that:
 *   1. currentStock is always updated atomically
 *   2. an InventoryTransaction audit record is always created
 * This guarantees the "every inventory change must be recorded" rule (Section 7).
 *
 * @param {Object} params
 * @param {String} params.productId
 * @param {Number} params.quantity - signed delta. Positive = stock IN, negative = stock OUT.
 * @param {String} params.transactionType - SALE | PURCHASE | RESTOCK | ADJUSTMENT | RETURN
 * @param {String} params.userId - who performed the action
 * @param {String} [params.referenceId] - Sale/Purchase _id this transaction belongs to
 * @param {String} [params.referenceModel] - "Sale" | "Purchase"
 * @param {String} [params.note]
 */
const applyStockChange = async ({
  productId,
  quantity,
  transactionType,
  userId,
  referenceId = null,
  referenceModel = null,
  note = "",
}) => {
  const product = await Product.findById(productId);
  if (!product) {
    const err = new Error(`Product not found: ${productId}`);
    err.statusCode = 404;
    throw err;
  }

  const previousStock = product.currentStock;
  const newStock = previousStock + quantity;

  if (newStock < 0) {
    const err = new Error(`Insufficient stock for "${product.name}". Available: ${previousStock}, requested: ${-quantity}`);
    err.statusCode = 400;
    throw err;
  }

  product.currentStock = newStock;
  if (transactionType === "PURCHASE" || transactionType === "RESTOCK") {
    product.lastRestockedAt = new Date();
  }
  await product.save();

  await InventoryTransaction.create({
    product: productId,
    transactionType,
    quantity,
    previousStock,
    newStock,
    referenceId,
    referenceModel,
    note,
    createdBy: userId,
  });

  return product;
};

module.exports = { applyStockChange };
