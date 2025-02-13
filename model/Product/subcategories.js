const mongoose = require("mongoose");

// Define product subcategory schema
const subcategorySchema = new mongoose.Schema({
    name: {
        type: String,
    },
    description: {
        type: String,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "category",
    }
})

// Export product subcategory model
module.exports = mongoose.model("subcategory", subcategorySchema)