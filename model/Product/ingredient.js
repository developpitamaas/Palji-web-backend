const mongoose = require("mongoose");

const IncludeSchema = new mongoose.Schema({
    ingredient: {
        type: String,
        required: true,
    },
    productId : {
        ref: "product",
        type: mongoose.Schema.Types.ObjectId,
    }
});


module.exports = mongoose.model("ingredient", IncludeSchema)