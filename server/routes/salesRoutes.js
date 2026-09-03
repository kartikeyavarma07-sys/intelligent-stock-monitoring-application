const express = require("express");
const router = express.Router();
const { createSale, getSales, getSaleById } = require("../controllers/salesController");
const { protect } = require("../middleware/authMiddleware");

// Both admin and staff can bill/record sales (Section 3: staff can create bills/record sales)
router.use(protect);

router.route("/").get(getSales).post(createSale);
router.get("/:id", getSaleById);

module.exports = router;
