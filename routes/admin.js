const { check, body } = require("express-validator");

const express = require("express");

const {
  getAddProduct,
  getProducts,
  postAddProduct,
  getEditProduct,
  postEditProduct,
  deleteProduct,
} = require("../controllers/admin");

const router = express.Router();

router.get("/add-product", getAddProduct);

router.get("/products", getProducts);

router.post(
  "/add-product",
  [
    body("title").isLength({ min: 3 }).trim(),

    body("price").isFloat().trim(),
    body("description").trim(),
  ],

  postAddProduct
);

router.get("/edit-product/:productId", getEditProduct);

router.post(
  "/edit-product",
  [
    body("title").isLength({ min: 3 }).trim(),

    body("price").isFloat().trim(),
    body("description").trim(),
  ],

  postEditProduct
);

router.delete("/product/:productId", deleteProduct);

module.exports = router;
