const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
    name: String,
    email: String,
    message: String,

    reply: String,

    status: {
        type: String,
        default: "Pending" // Pending / Resolved
    },

    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.models.Contact || mongoose.model("Contact", contactSchema);