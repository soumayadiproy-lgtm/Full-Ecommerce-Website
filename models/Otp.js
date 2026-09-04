const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true
    },
    otp: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        enum: ["login", "reset", "register"],
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 300 // auto-delete after 5 minutes (TTL index)
    }
});

otpSchema.index({ key: 1, type: 1 }, { unique: true });

module.exports = mongoose.model("Otp", otpSchema);
