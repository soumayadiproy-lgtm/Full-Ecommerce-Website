const express = require("express");
const router = express.Router();
const Contact = require("../models/Contact");

// 🔐 IMPORT AUTH
const { verifyToken, isAdmin } = require("../middleware/auth");


// ================= USER: SEND MESSAGE =================
router.post("/", async (req, res) => {
    try {
        const { name, email, message } = req.body;

        const newMsg = new Contact({ name, email, message });
        await newMsg.save();

        res.json({ msg: "Message sent ✅" });

    } catch (err) {
        res.status(500).json({ error: "Error sending message ❌" });
    }
});


// ================= ADMIN: GET ALL =================
router.get("/all", verifyToken, isAdmin, async (req, res) => {
    try {
        const data = await Contact.find().sort({ date: -1 });
        res.json(data);

    } catch (err) {
        res.status(500).json({ error: "Error fetching data ❌" });
    }
});


// ================= ADMIN: REPLY =================
router.post("/reply", verifyToken, isAdmin, async (req, res) => {
    try {
        const { id, reply } = req.body;

        await Contact.findByIdAndUpdate(id, {
            reply,
            status: "Resolved"
        });

        res.json({ msg: "Replied ✅" });

    } catch (err) {
        res.status(500).json({ error: "Reply failed ❌" });
    }
});


// ================= ADMIN: DELETE =================
router.delete("/delete/:id", verifyToken, isAdmin, async (req, res) => {
    try {
        await Contact.findByIdAndDelete(req.params.id);
        res.json({ msg: "Deleted 🗑️" });

    } catch (err) {
        res.status(500).json({ error: "Delete failed ❌" });
    }
});


// ================= ADMIN: MARK RESOLVED =================
router.put("/resolve/:id", verifyToken, isAdmin, async (req, res) => {
    try {
        await Contact.findByIdAndUpdate(req.params.id, {
            status: "Resolved"
        });

        res.json({ msg: "Marked as resolved ✅" });

    } catch (err) {
        res.status(500).json({ error: "Update failed ❌" });
    }
});

module.exports = router;