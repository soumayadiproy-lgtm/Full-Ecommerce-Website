const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.Mixed,
        default: () => "ord_" + Date.now() + "_" + Math.floor(Math.random() * 10000)
    },
    userId: {
        type: String,
        required: true
    },

    items: [
        {
            name: {
                type: String,
                required: true
            },
            price: {
                type: Number,
                required: true
            },
            quantity: {
                type: Number,
                default: 1
            },
            img: {
                type: String,
                default: ""
            }
        }
    ],

    total: {
        type: Number,
        required: true
    },

    customer: {
        name: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        }
    },

    payment: {
        type: String,
        enum: ["cod", "upi", "card"],
        default: "cod"
    },

    // 🔥 FIXED STATUS
    status: {
        type: String,
        enum: [
            "Pending",
            "Confirmed",
            "Processing",
            "Shipped",
            "Out for Delivery",
            "Delivered",
            "Cancelled",
            "Placed",
            "Ordered"
        ],
        default: "Placed"
    },

    // 🔁 RETURN SYSTEM
    returnStatus: {
        type: String,
        enum: ["None", "Requested", "Approved", "Rejected"],
        default: "None"
    },

    returnReason: {
        type: String,
        default: ""
    }

}, { timestamps: true });

module.exports = mongoose.models.Order || mongoose.model("Order", orderSchema);