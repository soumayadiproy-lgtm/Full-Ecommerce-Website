const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    phone: String,
    name: String,
    address: String,
    city: String,
    pincode: String,

    // 🔥 ROLE SYSTEM
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    },

    // 🚫 BLOCK USER SYSTEM
    isBlocked: {
        type: Boolean,
        default: false
    },

    // 💎 MEMBERSHIP SYSTEM
    membership: {
        type: String,
        enum: ["free", "premium", "premium_plus"],
        default: "free"
    },

    membershipExpiry: {
        type: Date
    }
}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model("User", userSchema);