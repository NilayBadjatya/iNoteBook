const mongoose = require("mongoose");
const { Schema } = mongoose;

const UserSchema = new Schema({
  name: {
    type: String, // Use `String` instead of `string`
    required: true,
  },
  email: {
    type: String, // Use `String` instead of `string`
    required: true,
    unique: true,
  },
  password: {
    type: String, // Use `String` instead of `string`
    required: true,
  },
  date: {
    type: Date, // `Date` is correct as is
    default: Date.now,
  },
});

module.exports = mongoose.model("user", UserSchema);
