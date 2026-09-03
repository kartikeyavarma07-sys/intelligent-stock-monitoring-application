const express = require("express");
const router = express.Router();
const { getDashboard, getSalesAnalytics, getInventoryAnalytics, getAlerts } = require("../controllers/analyticsController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.get("/dashboard", getDashboard);
router.get("/sales", getSalesAnalytics);
router.get("/inventory", getInventoryAnalytics);
router.get("/alerts", getAlerts);

module.exports = router;
