const express = require("express");
const Pincode = express.Router();
const Data = require("../controllers/selfservice/pincode");
const auth = require("../middleware/Auth");
 
// create pincode
Pincode.route("/create-pincode").post(Data.CreatePincode)

// get all pincode
Pincode.route("/get-all-pincode").get(Data.GetAllPincode)

// get all available pincode
Pincode.route("/get-all-available-pincode").get(Data.getallavailablepincode)

// update pincode
Pincode.route("/update-pincode/:id").put(Data.editpincode)

// delete pincode
Pincode.route("/delete-pincode/:id").delete(Data.deletepincode)

// exports
module.exports = Pincode
