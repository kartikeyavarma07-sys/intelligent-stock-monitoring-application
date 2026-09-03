const express = require("express");
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
} = require("../controllers/productController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect);

router.get("/meta/categories", getCategories);
router.route("/").get(getProducts).post(authorize("admin"), createProduct);
router
  .route("/:id")
  .get(getProductById)
  .put(authorize("admin"), updateProduct)
  .delete(authorize("admin"), deleteProduct);

module.exports = router;
