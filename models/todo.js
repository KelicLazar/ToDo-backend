const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const todoSchema = new Schema({
  text: { type: String, required: true },
  isChecked: { type: Boolean, required: true },
  creator: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
});

module.exports = mongoose.model("Todo", todoSchema);
