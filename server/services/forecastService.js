const InventoryTransaction = require("../models/InventoryTransaction");
const { DEFAULTS } = require("../config/constants");

/**
 * Builds a day-by-day sales quantity map for a product over the last `windowDays`,
 * from InventoryTransaction records of type SALE (quantity is stored negative for sales,
 * so we flip the sign to get units sold).
 */
const getDailySalesSeries = async (productId, windowDays) => {
  const since = new Date();
  since.setDate(since.getDate() - windowDays);

  const transactions = await InventoryTransaction.find({
    product: productId,
    transactionType: "SALE",
    createdAt: { $gte: since },
  }).select("quantity createdAt");

  // Bucket into day => units sold
  const dayMap = {};
  for (let i = 0; i < windowDays; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    dayMap[key] = 0;
  }
  transactions.forEach((t) => {
    const key = t.createdAt.toISOString().slice(0, 10);
    if (dayMap[key] !== undefined) dayMap[key] += Math.abs(t.quantity);
  });

  // Return oldest -> newest
  return Object.entries(dayMap)
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([date, units]) => ({ date, units }));
};

/**
 * Average Daily Demand = Total units sold in window / number of days.
 * This is the base figure the reorder-point formula (Section 13) uses.
 */
const getAverageDailyDemand = async (productId, windowDays = DEFAULTS.SALES_ANALYSIS_WINDOW_DAYS) => {
  const series = await getDailySalesSeries(productId, windowDays);
  const totalUnits = series.reduce((sum, d) => sum + d.units, 0);
  return totalUnits / windowDays;
};

/**
 * Simple, explainable N-day moving average forecast (Section 15).
 * Forecast = average of the most recent `movingWindow` days' sales.
 * Kept deliberately simple (no black-box ML) so it's easy to explain in a viva.
 */
const getMovingAverageForecast = async (productId, movingWindow = DEFAULTS.MOVING_AVERAGE_WINDOW_DAYS) => {
  const series = await getDailySalesSeries(productId, movingWindow);
  const totalUnits = series.reduce((sum, d) => sum + d.units, 0);
  return totalUnits / movingWindow;
};

/**
 * Classifies a product's sales velocity based on average daily demand (Section 17).
 * Thresholds are heuristic but explainable: expressed as units/day.
 */
const classifyVelocity = (avgDailyDemand) => {
  if (avgDailyDemand >= 3) return "FAST_MOVING";
  if (avgDailyDemand >= 0.5) return "MEDIUM_MOVING";
  return "SLOW_MOVING";
};

module.exports = { getDailySalesSeries, getAverageDailyDemand, getMovingAverageForecast, classifyVelocity };
