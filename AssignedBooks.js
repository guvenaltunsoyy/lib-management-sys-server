const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// this will be our data base's data structure
const AssignedBooks = new Schema(
  {
    userId: Object,
    bookId: Object,
    isReceipt: Boolean,
    createdAt: Date,
    updatedAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("AssignedBooks", AssignedBooks);
