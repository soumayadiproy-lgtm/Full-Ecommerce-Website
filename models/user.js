const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    email: String,
    password: String,

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

    // 💎 MEMBERSHIP SYSTEM (FIXED)
    membership: {
        type: String,
        enum: ["free", "premium", "premium_plus"],
        default: "free"
    },

    membershipExpiry: {
        type: Date
    }
});

module.exports = mongoose.model("User", userSchema);