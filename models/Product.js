const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name: String,
    price: Number,
    type: String,
    category: {
        type: String,
        default: "general"
    },
    stock: {
        type: Number,
        default: 50
    },
    img: String,

    reviews: [
        {
            text: String,
            rating: Number,
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            },
            date: {
                type: Date,
                default: Date.now
            }
        }
    ]
});

module.exports = mongoose.model("Product", productSchema);