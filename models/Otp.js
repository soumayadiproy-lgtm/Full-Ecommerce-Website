const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true
    },
    otp: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        enum: ["login", "reset"],
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 300 // auto-delete after 5 minutes (TTL index)
    }
});

module.exports = mongoose.model("Otp", otpSchema);
