const mongoose = require("mongoose");

// Define product category schema
const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    availablePinCodes: {
        type: [String], 
        default: [],
    },
    tax:{
        type: Number,
    }
     
})

// Export product category model
module.exports = mongoose.model("category", categorySchema)
