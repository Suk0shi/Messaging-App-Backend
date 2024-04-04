const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const MessageSchema = new Schema({
  user: { type: String, required: true },
  date: { type: Date, required: true },
  text: { type: String, required: true },
});


MessageSchema.virtual("url").get(function () {
  // We don't use an arrow function as we'll need the this object
  return `/message/${this._id}`;
});

// Export model
module.exports = mongoose.model("Message", MessageSchema);