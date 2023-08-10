const express = require("express");
const bcrypt = require("bcryptjs");
const { check, body } = require("express-validator");
const {
  getLogin,
  postLogin,
  postLogout,
  getSignup,
  postSignup,
  getReset,
  postReset,
  getNewPassword,
  postNewPassword,
} = require("../controllers/auth");
const User = require("../models/User");

const router = express.Router();

router.get("/login", getLogin);
router.post(
  "/login",
  check("email")
    .isEmail()
    .normalizeEmail()
    .custom(async (value) => {
      const user = await User.findOne({ email: value });
      if (!user) {
        throw new Error("Please sign up first.");
      }
    }),
  check("password")
    .trim()
    .custom(async (password, { req }) => {
      const user = await User.findOne({ email: req.body.email });
      const isSame = await bcrypt.compare(password, user.password);
      if (!isSame) {
        throw new Error("Enter a valid password.");
      }
    }),
  postLogin
);

router.post("/logout", postLogout);

router.get("/signup", getSignup);
router.post(
  "/signup",
  check("email")
    .isEmail()
    .withMessage("PLz, Enter Valid Email...")
    .normalizeEmail()
    // Out Custom Validators
    .custom(async (value) => {
      const user = await User.findOne({ email: value });
      if (user) {
        throw new Error("E-mail already in use");
      }
    }),
  body("password", "Enter Password With More Than 5 Char...").trim().isLength({
    min: 5,
  }),
  body("confirmPassword", "Password not match")
    .trim()
    .custom((value, { req }) => {
      return value === req.body.password;
    }),
  postSignup
);

router.get("/reset", getReset);
router.post("/reset", postReset);

router.get("/reset/:userToken", getNewPassword);
router.get("/newpassword", postNewPassword);

module.exports = router;
