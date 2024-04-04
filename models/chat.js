const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ChatSchema = new Schema({
  user1: { type: String, required: true },
  user2: { type: String, required: true },
  chat: [{
    user: { type: String, required: true },
    date: { type: String, required: true },
    text: { type: String, required: true },
  }],
});


ChatSchema.virtual("url").get(function () {
  // We don't use an arrow function as we'll need the this object
  return `/chat/${this._id}`;
});

// Export model
module.exports = mongoose.model("Chat", ChatSchema);
