const asyncHandler = require("express-async-handler");
const Recommendation = require("../models/Recommendation");
const Product = require("../models/Product");
const { generateAllRecommendations, buildRecommendationForProduct } = require("../services/replenishmentService");

// @desc    Get current replenishment recommendations (regenerates if none exist yet)
// @route   GET /api/replenishment/recommendations
const getRecommendations = asyncHandler(async (req, res) => {
  const { priority, onlyReorder } = req.query;

  let recommendations = await Recommendation.find().populate({
    path: "product",
    select: "name sku category currentStock supplier isActive",
    populate: { path: "supplier", select: "name leadTimeDays" },
  });

  // If nothing generated yet, generate on the fly so the page is never empty
  if (recommendations.length === 0) {
    await generateAllRecommendations();
    recommendations = await Recommendation.find().populate({
      path: "product",
      select: "name sku category currentStock supplier isActive",
      populate: { path: "supplier", select: "name leadTimeDays" },
    });
  }

  recommendations = recommendations.filter((r) => r.product && r.product.isActive);

  if (priority) recommendations = recommendations.filter((r) => r.priority === priority);
  if (onlyReorder === "true") recommendations = recommendations.filter((r) => r.shouldReorder);

  // Sort by priority severity, then by how urgent (lowest stock relative to reorder point)
  const priorityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
  recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  res.json({ success: true, count: recommendations.length, data: recommendations });
});

// @desc    Force regeneration of all recommendations from current sales/stock data
// @route   POST /api/replenishment/generate
const regenerateRecommendations = asyncHandler(async (req, res) => {
  const results = await generateAllRecommendations();
  res.json({ success: true, message: `Regenerated ${results.length} recommendations`, count: results.length });
});

// @desc    Get a single product's live recommendation (recalculated on demand)
// @route   GET /api/replenishment/product/:productId
const getRecommendationForProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.productId).populate("supplier", "leadTimeDays");
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  const rec = await buildRecommendationForProduct(product);
  res.json({ success: true, data: rec });
});

module.exports = { getRecommendations, regenerateRecommendations, getRecommendationForProduct };
