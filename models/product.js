const { Schema, model } = require("mongoose");

const ProductSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});
const Product = model("Product", ProductSchema);

module.exports = Product;
//   // save() {
//   //   const db = getDb();
//   //   return db.collection("products").insertOne(this);
//   // }

//   // static findById(id) {
//   //   const db = getDb();
//   //   return db.collection("products").findOne({ _id: new ObjectId(id) });
//   // }

//   // static fetchAll() {
//   //   const db = getDb();
//   //   return db
//   //     .collection("products")
//   //     .find()
//   //     .toArray()
//   //     .then((products) => {
//   //       return products;
//   //     })
//   //     .catch((error) => {
//   //       console.log(error);
//   //     });
//   // }

//   // static updateProduct(productId, updatedProduct) {
//   //   const db = getDb();
//   //   const filter = { _id: new ObjectId(productId) };
//   //   return db
//   //     .collection("products")
//   //     .updateOne(filter, { $set: updatedProduct });
//   // }

//   // static deleteProduct(productId) {
//   //   const db = getDb();
//   //   const filter = { _id: new ObjectId(productId) };
//   //   return db.collection("products").deleteOne(filter);
//   // }
// }

module.exports = Product;
