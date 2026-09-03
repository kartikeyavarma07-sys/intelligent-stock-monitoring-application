const express = require("express");
const router = express.Router();
const { getInventory, adjustStock, getTransactions } = require("../controllers/inventoryController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect);

router.get("/", getInventory);
router.get("/transactions", getTransactions);
router.post("/adjust", authorize("admin"), adjustStock);

module.exports = router;
