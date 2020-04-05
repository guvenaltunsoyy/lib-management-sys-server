const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// this will be our data base's data structure
const Books = new Schema(
  {
    title: String,
    author: String,
    quantity: Number,
    isbnNumber: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Books", Books);
