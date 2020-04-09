const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// this will be our data base's data structure
const Users = new Schema(
  {
    name: String,
    surname: String,
    password: String,
    age: String,
    mail: String,
    schoolNumber: String,
    phoneNumber: String,
    isManager: Boolean,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Users", Users);
