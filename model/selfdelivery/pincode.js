const mongoose = require("mongoose");

const pincodeSchema = new mongoose.Schema({
    pincode: {
        type: String,
        required: true,
    },
    available: {
        type: String,
        default: "true",
    },
})

module.exports = mongoose.model("paljiservicepincode", pincodeSchema)