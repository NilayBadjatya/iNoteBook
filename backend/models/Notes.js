const mongoose = require("mongoose");
const { Schema } = mongoose;

const NotesSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  title: {
    type: String, // Use `String` instead of `string`
    required: true,
  },
  description: {
    type: String, // Use `String` instead of `string`
    required: true,
  },
  tag: {
    type: String, // Use `String` instead of `string`
    default: "General",
  },
  date: {
    type: Date, // `Date` is correct as is
    default: Date.now,
  },
});

// Fixing the typo in module.exports
module.exports = mongoose.model("note", NotesSchema);
