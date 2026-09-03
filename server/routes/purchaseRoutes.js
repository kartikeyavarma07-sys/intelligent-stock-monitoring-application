const express = require("express");
const router = express.Router();
const { createPurchase, getPurchases, getPurchaseById } = require("../controllers/purchaseController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect);
router.use(authorize("admin")); // only admin/owner records purchases (Section 3)

router.route("/").get(getPurchases).post(createPurchase);
router.get("/:id", getPurchaseById);

module.exports = router;
