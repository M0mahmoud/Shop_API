const User = require("../models/User");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const { validationResult } = require("express-validator");

const transport = nodemailer.createTransport({
  host: "smtp.gmail.email",
  // port: 2525,
  secure: false,
  service: "gmail",
  auth: {
    user: "houdmohamed85@gmail.com",
    pass: "ujkhximjoeybxnwy",
  },
});

exports.getLogin = (req, res, next) => {
  let msg = req.flash("login");
  if (msg.length > 0) {
    msg = msg[0];
  } else {
    msg = null;
  }
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",

    errorMessage: msg,
    oldInput: { email: "", password: "" },
    validationErrors: [],
  });
};

exports.postLogin = async (req, res) => {
  const { email, password } = req.body;

  console.log("req.session----login--:", req.session);

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessage = errors.array()[0].msg;
      return res.status(422).render("auth/login", {
        path: "/login",
        pageTitle: "Login",
        errorMessage,
        oldInput: { email, password },
        validationErrors: errors.array(),
      });
    }
    const user = await User.findOne({ email });
    console.log("user From Auth :", user);
    const isSame = await bcrypt.compare(password, user.password);
    if (isSame) {
      req.session.isLoggedIn = true;
      req.session.user = user;
      return req.session.save((err) => {
        console.log("err-----login---:", err);
        console.log("return session", req.session);
        res.redirect("/");
      });
    } else {
      throw new Error("Enter a valid password!.");
    }
  } catch (err) {
    console.log("Error:", err);
    res.redirect("/login");
  }
};

exports.postLogout = (req, res) => {
  req.session.destroy((err) => {
    console.log("error | destroy:", err);
    res.redirect("/");
  });
};

exports.getSignup = (req, res) => {
  let msg = req.flash("email");
  if (msg.length > 0) {
    msg = msg[0];
  } else {
    msg = null;
  }
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    errorMessage: msg,
    oldInput: { email: "", password: "", confirmPassword: "" },
    validationErrors: [],
  });
};

exports.postSignup = (req, res) => {
  const { email, password, confirmPassword } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessage = errors.array()[0].msg;
    console.log("errors.array():", errors.array());
    return res.status(422).render("auth/signup", {
      path: "/signup",
      pageTitle: "Signup",
      errorMessage,
      oldInput: { email, password, confirmPassword },
      validationErrors: errors.array(),
    });
  }
  bcrypt
    .hash(password, 12)
    .then((hashPassword) => {
      const newUser = new User({
        email,
        password: hashPassword,
        cart: { items: [] },
      });
      return newUser.save();
    })

    .then(async () => {
      const message = {
        from: "houdmohamed85@gmail.com",
        to: email,
        subject: "SignUp Successfully...",
        html: "<h1>Have the most fun you can in a car!</h1><p>Get your <b>Tesla</b> today!</p>",
      };
      transport.sendMail(message, (err, info) => {
        if (err) {
          console.log("ERROR FROM MSG-------------", err);
        } else {
          console.log("DONE----------------", info);
          if (!info.accepted) {
            // Error handling
          }
        }
      });

      res.redirect("/login");
    })
    .catch((err) => {
      // const error = new Error(err);
      // error.httpStatusCode = 500;
      // return next(error);
    });
};

exports.getReset = (req, res) => {
  let msg = req.flash("reset");
  if (msg.length > 0) {
    msg = msg[0];
  } else {
    msg = null;
  }
  res.render("auth/reset", {
    path: "/reset",
    pageTitle: "Reset Password",
    errorMessage: msg,
  });
};

exports.postReset = (req, res) => {
  crypto.randomBytes(32, (err, data) => {
    if (err) return res.redirect("/reset");

    const token = data.toString("hex");
    User.findOne({ email: req.body.email })
      .then((user) => {
        if (!user) {
          req.flash("reset", "Invalid Email");
          return res.redirect("/reset");
        }

        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 600000;
        return user.save();
      })
      .then(() => {
        const message = {
          from: "houdmohamed85@gmail.com",
          to: req.body.email,
          subject: "Password Reset",
          html: `
          <h1>Password Reset</h1>
          <p>Your Request A Password Reset Link</p>
          <p>
            <a target='_blank' href="http://localhost:3000/reset/${token}"> Click To Reset Password </a>
          </p>
          <p style='color:red;'>This Link Active For 5 Min</p>
          `,
        };
        transport.sendMail(message, (err, info) => {
          if (err) {
            console.log("ERROR FROM MSG-------------", err);
          } else {
            console.log("DONE----------------", info);
          }
        });

        res.redirect("/login");
      })
      .catch((err) => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
  });
};

exports.getNewPassword = (req, res) => {
  const userToken = req.params.userToken;

  User.findOne({
    resetToken: userToken,
    resetTokenExpiration: { $gt: Date.now() },
  })
    .then((user) => {
      console.log("---------------", userToken);
      let msg = req.flash("reset");
      if (msg.length > 0) {
        msg = msg[0];
      } else {
        msg = null;
      }
      res.render("auth/newpassword", {
        path: "/newpassword",
        pageTitle: "Update Password",
        errorMessage: msg,
        userId: String(user._id),
        passwordToken: userToken,
      });
    })
    .catch((err) => {
      // const error = new Error(err);
      // error.httpStatusCode = 500;
      // return next(error);
    });
};

exports.postNewPassword = async (req, res) => {
  const { newPassword, userId, passwordToken } = req.body; // Add _csrf to destructured variables

  let resetUser;

  User.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: { $gt: Date.now() },
    _id: userId,
  })
    .then((user) => {
      resetUser = user;
      return bcrypt.hash(newPassword, 12);
    })
    .then((hashedPassword) => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      return resetUser.save();
    })
    .then((result) => {
      res.redirect("/login");
    })
    .catch((err) => {
      // const error = new Error(err);
      // error.httpStatusCode = 500;
      // return next(error);
    });
};
