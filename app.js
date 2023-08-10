const fs = require("fs");
require("dotenv").config();
const path = require("path");
const multer = require("multer");
const morgan = require("morgan");
const express = require("express");
const mongoose = require("mongoose");
const User = require("./models/User");
const flash = require("connect-flash");
const bodyParser = require("body-parser");
const compression = require("compression");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const { get404, get500 } = require("./controllers/error");
const MongoDBStore = require("connect-mongodb-session")(session);

const app = express();

const fileStore = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "images");
  },
  filename: (req, file, callback) => {
    callback(null, Date.now() + "__" + file.originalname);
  },
});

function fileFilter(req, file, callback) {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    callback(null, true);
  } else {
    callback(null, false);
  }
}

const store = new MongoDBStore({
  uri: `${process.env.MONGODB_URL_SESSION}`,
  collection: "sessions",
});

// SSL
const privateKey = fs.readFileSync("server.key");
const certificate = fs.readFileSync("server.cert");

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

// Morgan
// Create Auto With Hosting Provider
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  {
    flags: "a",
  }
);

// Best Practices
// app.use(helmet());
app.use(compression());
app.use(morgan("combined", { stream: accessLogStream }));

app.use(bodyParser.urlencoded({ extended: false })); // Text Data
app.use(multer({ storage: fileStore, fileFilter: fileFilter }).single("image"));

app.use(cookieParser("MahmoudText"));
app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "images")));
app.use(
  session({
    secret: "Mahmoud123",
    resave: true,
    saveUninitialized: false,
    store: store,
  })
);

app.use(flash());

app.use((req, _res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch((err) => {
      // next(new Error(err));
    });
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use("/500", get500);
app.use(get404);

mongoose
  .connect(process.env.MONGOD_URL_CONNECT)
  .then(() => {
    app.listen(3000);

    // Create With Hosting Provider
    // https
    //   .createServer(
    //     {
    //       key: privateKey,
    //       cert: certificate,
    //     },
    //     app
    //   )
    //   .listen(process.env.PORT || 3000);
  })
  .catch((err) => {
    console.log(err);
  });
