const {
  getIndex,
  getProducts,
  getDetails,
  getCart,
  postCart,
  postCartDel,
  postOrder,
  getOrders,
  getInvoices,
  getCheckout,
  getCheckoutSuccess,
} = require("../controllers/shop");
// const isAuth = require("../middleware/isAuth");

const express = require("express");

const router = express.Router();

router.get("/", getIndex);

router.get("/products", getProducts);

router.get("/products/:productId", getDetails);

router.get("/cart", getCart);

router.post("/cart", postCart);

router.get("/checkout", getCheckout);
router.get("/checkout/success", getCheckoutSuccess);
router.get("/checkout/cancel", getCheckout);

router.post("/cart-delete-item", postCartDel);

router.post("/create-order", postOrder);

router.get("/orders", getOrders);

router.get("/orders/:orderId", getInvoices);

module.exports = router;
