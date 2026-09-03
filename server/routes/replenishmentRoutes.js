const express = require("express");
const router = express.Router();
const {
  getRecommendations,
  regenerateRecommendations,
  getRecommendationForProduct,
} = require("../controllers/replenishmentController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect);

router.get("/recommendations", getRecommendations);
router.post("/generate", authorize("admin"), regenerateRecommendations);
router.get("/product/:productId", getRecommendationForProduct);

module.exports = router;
