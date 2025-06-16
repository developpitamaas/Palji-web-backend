const express = require("express");
const Token = express.Router();
const Data = require("../controllers/tokencontroller");

//  createToken,
//     gettoken,
//     deletetoken,
//     updatetoken,
//     refreshToken



Token.route("/create-token").post(Data.createToken)
Token.route("/get-token").get(Data.gettoken)
Token.route("/delete-token/:id").delete(Data.deletetoken)
Token.route("/update-token/:id").put(Data.updatetoken)
Token.route("/refresh-token").post(Data.refreshToken)


// exports
module.exports = Token