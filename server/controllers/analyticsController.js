const asyncHandler = require("express-async-handler");
const Product = require("../models/Product");
const Sale = require("../models/Sale");
const Recommendation = require("../models/Recommendation");
const { classifyVelocity } = require("../services/forecastService");

const startOfDay = (d = new Date()) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

// @desc    Dashboard summary cards + charts (Section 5) - all computed from live DB data
// @route   GET /api/analytics/dashboard
const getDashboard = asyncHandler(async (req, res) => {
  const products = await Product.find({ isActive: true });

  const totalProducts = products.length;
  const totalInventoryValue = products.reduce((sum, p) => sum + p.currentStock * p.costPrice, 0);
  const lowStock = products.filter((p) => ["LOW", "CRITICAL"].includes(p.getStockStatus()));
  const outOfStock = products.filter((p) => p.getStockStatus() === "OUT_OF_STOCK");

  const today = startOfDay();
  const todaysSales = await Sale.aggregate([
    { $match: { createdAt: { $gte: today } } },
    { $group: { _id: null, total: { $sum: "$total" }, count: { $sum: 1 } } },
  ]);
  const allTimeSales = await Sale.aggregate([{ $group: { _id: null, total: { $sum: "$total" }, count: { $sum: 1 } } }]);

  const pendingReplenishments = await Recommendation.countDocuments({ shouldReorder: true });

  // Last 7 days of daily sales for the "Daily Sales Chart"
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);
  const dailySalesRaw = await Sale.aggregate([
    { $match: { createdAt: { $gte: sevenDaysAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        total: { $sum: "$total" },
      },
    },
    { $sort: { _id: 1 } },
  ]);
  // Fill missing days with 0 so the chart has a full 7-day axis
  const dailySales = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const match = dailySalesRaw.find((r) => r._id === key);
    dailySales.push({ date: key, total: match ? match.total : 0 });
  }

  // Last 8 weeks for "Weekly Sales Chart"
  const eightWeeksAgo = new Date();
  eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 7 * 8);
  const weeklySalesRaw = await Sale.aggregate([
    { $match: { createdAt: { $gte: eightWeeksAgo } } },
    { $group: { _id: { $isoWeek: "$createdAt" }, total: { $sum: "$total" } } },
    { $sort: { _id: 1 } },
  ]);
  const weeklySales = weeklySalesRaw.map((w) => ({ week: `W${w._id}`, total: w.total }));

  // Last 6 months for "Monthly Sales Chart"
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  const monthlySalesRaw = await Sale.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo } } },
    { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }, total: { $sum: "$total" } } },
    { $sort: { _id: 1 } },
  ]);

  // Top selling products (by units sold, all-time)
  const topProductsRaw = await Sale.aggregate([
    { $unwind: "$items" },
    { $group: { _id: "$items.product", name: { $first: "$items.name" }, unitsSold: { $sum: "$items.quantity" }, revenue: { $sum: "$items.lineTotal" } } },
    { $sort: { unitsSold: -1 } },
    { $limit: 5 },
  ]);

  // Stock level overview (count of products per status)
  const stockOverview = {
    HEALTHY: products.filter((p) => p.getStockStatus() === "HEALTHY").length,
    LOW: products.filter((p) => p.getStockStatus() === "LOW").length,
    CRITICAL: products.filter((p) => p.getStockStatus() === "CRITICAL").length,
    OUT_OF_STOCK: outOfStock.length,
  };

  res.json({
    success: true,
    data: {
      summary: {
        totalProducts,
        totalInventoryValue: Number(totalInventoryValue.toFixed(2)),
        todaysSales: todaysSales[0]?.total || 0,
        todaysSalesCount: todaysSales[0]?.count || 0,
        totalSales: allTimeSales[0]?.total || 0,
        totalSalesCount: allTimeSales[0]?.count || 0,
        lowStockCount: lowStock.length,
        outOfStockCount: outOfStock.length,
        pendingReplenishments,
      },
      charts: {
        dailySales,
        weeklySales,
        monthlySales: monthlySalesRaw.map((m) => ({ month: m._id, total: m.total })),
        topProducts: topProductsRaw,
        stockOverview,
      },
    },
  });
});

// @desc    Sales insights (best/worst sellers, growth)
// @route   GET /api/analytics/sales
const getSalesAnalytics = asyncHandler(async (req, res) => {
  const productSales = await Sale.aggregate([
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.product",
        name: { $first: "$items.name" },
        sku: { $first: "$items.sku" },
        unitsSold: { $sum: "$items.quantity" },
        revenue: { $sum: "$items.lineTotal" },
      },
    },
    { $sort: { unitsSold: -1 } },
  ]);

  const bestSelling = productSales.slice(0, 10);
  const worstSelling = [...productSales].sort((a, b) => a.unitsSold - b.unitsSold).slice(0, 10);

  // Month-over-month growth (current vs previous month totals)
  const now = new Date();
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [thisMonth] = await Sale.aggregate([
    { $match: { createdAt: { $gte: startOfThisMonth } } },
    { $group: { _id: null, total: { $sum: "$total" } } },
  ]);
  const [lastMonth] = await Sale.aggregate([
    { $match: { createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth } } },
    { $group: { _id: null, total: { $sum: "$total" } } },
  ]);

  const thisMonthTotal = thisMonth?.total || 0;
  const lastMonthTotal = lastMonth?.total || 0;
  const growthPercent = lastMonthTotal > 0 ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100 : null;

  res.json({
    success: true,
    data: { bestSelling, worstSelling, thisMonthTotal, lastMonthTotal, growthPercent },
  });
});

// @desc    Inventory insights (low/out/overstocked, fast/slow moving)
// @route   GET /api/analytics/inventory
const getInventoryAnalytics = asyncHandler(async (req, res) => {
  const products = await Product.find({ isActive: true }).populate("supplier", "name");
  const { getAverageDailyDemand } = require("../services/forecastService");

  const lowStock = products.filter((p) => p.getStockStatus() === "LOW");
  const criticalStock = products.filter((p) => p.getStockStatus() === "CRITICAL");
  const outOfStock = products.filter((p) => p.getStockStatus() === "OUT_OF_STOCK");
  const overstocked = products.filter((p) => p.currentStock > p.minimumStock * 3);

  const velocityResults = [];
  for (const p of products) {
    const avgDemand = await getAverageDailyDemand(p._id);
    velocityResults.push({
      product: { _id: p._id, name: p.name, sku: p.sku },
      averageDailyDemand: Number(avgDemand.toFixed(2)),
      velocity: classifyVelocity(avgDemand),
    });
  }

  res.json({
    success: true,
    data: {
      lowStock: lowStock.map((p) => ({ _id: p._id, name: p.name, sku: p.sku, currentStock: p.currentStock })),
      criticalStock: criticalStock.map((p) => ({ _id: p._id, name: p.name, sku: p.sku, currentStock: p.currentStock })),
      outOfStock: outOfStock.map((p) => ({ _id: p._id, name: p.name, sku: p.sku })),
      overstocked: overstocked.map((p) => ({ _id: p._id, name: p.name, sku: p.sku, currentStock: p.currentStock, minimumStock: p.minimumStock })),
      fastMoving: velocityResults.filter((v) => v.velocity === "FAST_MOVING"),
      mediumMoving: velocityResults.filter((v) => v.velocity === "MEDIUM_MOVING"),
      slowMoving: velocityResults.filter((v) => v.velocity === "SLOW_MOVING"),
    },
  });
});

// @desc    Low-stock / critical alerts feed for the dashboard bell (Section 18)
// @route   GET /api/analytics/alerts
const getAlerts = asyncHandler(async (req, res) => {
  const products = await Product.find({ isActive: true });
  const alerts = [];

  for (const p of products) {
    const status = p.getStockStatus();
    if (status === "OUT_OF_STOCK") {
      alerts.push({ level: "CRITICAL", icon: "🔴", productId: p._id, message: `${p.name} is OUT OF STOCK.` });
    } else if (status === "CRITICAL") {
      alerts.push({
        level: "CRITICAL",
        icon: "🔴",
        productId: p._id,
        message: `${p.name} stock is critically low (${p.currentStock} left, minimum is ${p.minimumStock}).`,
      });
    } else if (status === "LOW") {
      alerts.push({
        level: "WARNING",
        icon: "⚠",
        productId: p._id,
        message: `${p.name} stock is below the minimum threshold (${p.currentStock}/${p.minimumStock}).`,
      });
    }
  }

  // CRITICAL first, then WARNING
  alerts.sort((a, b) => (a.level === "CRITICAL" ? -1 : 1) - (b.level === "CRITICAL" ? -1 : 1));

  res.json({ success: true, count: alerts.length, data: alerts });
});

module.exports = { getDashboard, getSalesAnalytics, getInventoryAnalytics, getAlerts };
