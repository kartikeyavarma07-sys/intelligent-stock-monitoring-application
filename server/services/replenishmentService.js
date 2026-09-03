const Product = require("../models/Product");
const Recommendation = require("../models/Recommendation");
const { DEFAULTS, PRIORITY } = require("../config/constants");
const { getAverageDailyDemand, getMovingAverageForecast } = require("./forecastService");

/**
 * Core formula (Section 13):
 *   Reorder Point = Average Daily Demand x Supplier Lead Time + Safety Stock
 *   Safety Stock   = Average Daily Demand x Safety Days
 *
 * We use the FORECAST (7-day moving average) rather than the raw historical
 * average to drive the live reorder point, since it reacts faster to recent
 * trend changes -- but both figures are returned so the UI can show "Historical vs Forecast"
 * per Section 15.
 */
const buildRecommendationForProduct = async (product) => {
  const leadTimeDays = product.supplier?.leadTimeDays ?? DEFAULTS.LEAD_TIME_DAYS;
  const safetyDays = product.safetyDays ?? DEFAULTS.SAFETY_DAYS;

  const averageDailyDemand = await getAverageDailyDemand(product._id);
  const forecastDailyDemand = await getMovingAverageForecast(product._id);

  // Use the forecast for live decisions; fall back to historical average if there's
  // no recent sales data at all (forecast would be 0 for a genuinely new/slow product).
  const demandForCalculation = forecastDailyDemand > 0 ? forecastDailyDemand : averageDailyDemand;

  const safetyStock = demandForCalculation * safetyDays;
  const reorderPoint = demandForCalculation * leadTimeDays + safetyStock;

  const shouldReorder = product.currentStock < reorderPoint;

  // Recommended quantity: bring stock up to (reorder point + one reorder cycle of demand),
  // or fall back to the product's configured reorderQuantity if demand is negligible.
  const calculatedQty = Math.ceil(Math.max(0, reorderPoint + demandForCalculation * leadTimeDays - product.currentStock));
  const recommendedQuantity = calculatedQty > 0 ? calculatedQty : product.reorderQuantity;

  // Priority based on how far below the reorder point current stock has fallen.
  let priority = PRIORITY.LOW;
  let reason = "Stock is above the reorder point; no action needed yet.";

  if (shouldReorder) {
    const deficitRatio = reorderPoint > 0 ? (reorderPoint - product.currentStock) / reorderPoint : 1;
    if (product.currentStock <= 0) {
      priority = PRIORITY.CRITICAL;
      reason = `${product.name} is OUT OF STOCK. Immediate reorder required.`;
    } else if (deficitRatio >= 0.6) {
      priority = PRIORITY.CRITICAL;
      reason = `Stock (${product.currentStock}) is critically below the reorder point (${reorderPoint.toFixed(1)}).`;
    } else if (deficitRatio >= 0.3) {
      priority = PRIORITY.HIGH;
      reason = `Stock (${product.currentStock}) is well below the reorder point (${reorderPoint.toFixed(1)}).`;
    } else {
      priority = PRIORITY.MEDIUM;
      reason = `Stock (${product.currentStock}) has dropped below the reorder point (${reorderPoint.toFixed(1)}).`;
    }
  }

  return {
    product: product._id,
    currentStock: product.currentStock,
    averageDailyDemand: Number(averageDailyDemand.toFixed(2)),
    forecastDailyDemand: Number(forecastDailyDemand.toFixed(2)),
    leadTimeDays,
    safetyStock: Number(safetyStock.toFixed(2)),
    reorderPoint: Number(reorderPoint.toFixed(2)),
    recommendedQuantity,
    shouldReorder,
    priority,
    reason,
    generatedAt: new Date(),
  };
};

/**
 * Regenerates and upserts recommendations for every active product.
 * Called by POST /api/replenishment/generate, and can be scheduled via cron in production.
 */
const generateAllRecommendations = async () => {
  const products = await Product.find({ isActive: true }).populate("supplier", "leadTimeDays");
  const results = [];

  for (const product of products) {
    const rec = await buildRecommendationForProduct(product);
    const saved = await Recommendation.findOneAndUpdate({ product: product._id }, rec, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    });
    results.push(saved);
  }

  return results;
};

module.exports = { buildRecommendationForProduct, generateAllRecommendations };
