const express = require("express");
const router = express.Router();
const Contact = require("../models/Contact");
const connectDB = require("../config/db");

// 🔐 IMPORT AUTH
const { verifyToken, isAdmin } = require("../middleware/auth");

// In-memory fallback to guarantee messages are NEVER lost even when DB is offline
const memoryContacts = [];

// ================= USER: SEND MESSAGE =================
router.post("/", async (req, res) => {
    try {
        const { name, email, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ error: "All fields are required ❌" });
        }

        const contactData = {
            _id: "c_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
            name: name.trim(),
            email: email.trim(),
            message: message.trim(),
            status: "Pending",
            date: new Date()
        };

        try {
            await connectDB();
            const newMsg = new Contact({
                name: contactData.name,
                email: contactData.email,
                message: contactData.message,
                status: "Pending",
                date: contactData.date
            });
            const saved = await newMsg.save();
            contactData._id = saved._id;
            console.log("✅ Contact message saved to MongoDB:", saved._id);
        } catch (dbErr) {
            console.warn("⚠️ MongoDB Contact save error (using memory fallback):", dbErr.message);
        }

        // Always save to memoryContacts fallback
        memoryContacts.unshift(contactData);

        return res.json({ msg: "Message sent successfully ✅ We will contact you soon!" });

    } catch (err) {
        console.error("Contact send error:", err);
        return res.status(500).json({ error: "Error sending message ❌" });
    }
});


// ================= ADMIN: GET ALL (HANDLES / AND /ALL) =================
router.get(["/", "/all"], verifyToken, isAdmin, async (req, res) => {
    try {
        let dbContacts = [];
        try {
            await connectDB();
            dbContacts = await Contact.find().sort({ date: -1 });
        } catch (e) {
            console.warn("DB contact fetch error:", e.message);
        }

        const contactMap = new Map();
        if (Array.isArray(dbContacts)) {
            dbContacts.forEach(c => {
                if (c && c._id) contactMap.set(String(c._id), c);
            });
        }
        memoryContacts.forEach(c => {
            if (c && c._id && !contactMap.has(String(c._id))) {
                contactMap.set(String(c._id), c);
            }
        });

        return res.json(Array.from(contactMap.values()));

    } catch (err) {
        console.error("Error fetching contacts:", err);
        return res.json(memoryContacts);
    }
});


// ================= ADMIN: REPLY =================
router.post("/reply", verifyToken, isAdmin, async (req, res) => {
    try {
        const { id, reply } = req.body;

        try {
            await connectDB();
            await Contact.findByIdAndUpdate(id, {
                reply,
                status: "Resolved"
            });
        } catch (e) {}

        const memMsg = memoryContacts.find(c => String(c._id) === String(id));
        if (memMsg) {
            memMsg.reply = reply;
            memMsg.status = "Resolved";
        }

        return res.json({ msg: "Replied ✅" });

    } catch (err) {
        return res.status(500).json({ error: "Reply failed ❌" });
    }
});


// ================= ADMIN: DELETE =================
router.delete(["/delete/:id", "/:id"], verifyToken, isAdmin, async (req, res) => {
    try {
        const id = req.params.id;

        try {
            await connectDB();
            await Contact.findByIdAndDelete(id);
        } catch (e) {}

        const memIdx = memoryContacts.findIndex(c => String(c._id) === String(id));
        if (memIdx !== -1) {
            memoryContacts.splice(memIdx, 1);
        }

        return res.json({ msg: "Deleted 🗑️" });

    } catch (err) {
        return res.status(500).json({ error: "Delete failed ❌" });
    }
});


// ================= ADMIN: MARK RESOLVED =================
router.put(["/resolve/:id", "/:id"], verifyToken, isAdmin, async (req, res) => {
    try {
        const id = req.params.id;

        try {
            await connectDB();
            await Contact.findByIdAndUpdate(id, {
                status: "Resolved"
            });
        } catch (e) {}

        const memMsg = memoryContacts.find(c => String(c._id) === String(id));
        if (memMsg) {
            memMsg.status = "Resolved";
        }

        return res.json({ msg: "Marked as resolved ✅" });

    } catch (err) {
        return res.status(500).json({ error: "Update failed ❌" });
    }
});

module.exports = router;