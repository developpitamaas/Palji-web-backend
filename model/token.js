const mongoose = require("mongoose");

const Token = new mongoose.Schema({
  token: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    required: true
  }
});

module.exports = mongoose.model("Token", Token);