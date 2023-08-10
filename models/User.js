const { Schema, model } = require("mongoose");
const Product = require("./product");

const UserSchema = new Schema({
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  resetToken: String,
  resetTokenExpiration: Date,
  cart: {
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true },
      },
    ],
  },
});

UserSchema.methods.addToCart = function (product) {
  const cartProductIndex = this.cart.items.findIndex(
    (cartProduct) => String(cartProduct.productId) === String(product._id)
  );

  let newQunatity = 1;
  const updatedCartItems = [...this.cart.items];

  if (cartProductIndex >= 0) {
    newQunatity = this.cart.items[cartProductIndex].quantity + 1;
    updatedCartItems[cartProductIndex].quantity = newQunatity;
  } else {
    updatedCartItems.push({
      productId: product._id,
      quantity: newQunatity,
    });
  }
  const updatedCart = {
    items: updatedCartItems,
  };
  this.cart = updatedCart;
  return this.save();
};
UserSchema.methods.deleteItemFromCart = function (productId) {
  const updatedCartItems = this.cart.items.filter(
    (item) => String(item.productId) !== String(productId)
  );
  this.cart.items = updatedCartItems;
  return this.save();
};
UserSchema.methods.clearCart = function () {
  this.cart = { items: [] };
  return this.save();
};

const User = model("User", UserSchema);
module.exports = User;
