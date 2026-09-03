const express = require("express");
const router = express.Router();

const User = require("../models/User");
const Otp = require("../models/Otp");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { verifyToken, isAdmin } = require("../middleware/auth");

const SECRET = process.env.JWT_SECRET || "secretkey";

const memoryUsers = [];

// ================= REGISTER =================
router.post("/register", async (req, res) => {
    try {
        const { email, password, phone } = req.body;

        if (!email || !password) {
            return res.status(400).json({ msg: "Email and password are required ❌" });
        }

        const normalizedEmail = email.trim().toLowerCase();

        let existingUser = null;
        try {
            existingUser = await User.findOne({ email: normalizedEmail });
        } catch (e) {}

        if (!existingUser) {
            existingUser = memoryUsers.find(u => u.email && u.email.toLowerCase() === normalizedEmail);
        }

        if (existingUser) {
            return res.status(400).json({ msg: "User already exists ❌ Please login!" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const userData = {
            _id: "u_" + Date.now() + "_" + Math.floor(Math.random()*1000),
            email: normalizedEmail,
            password: hashedPassword,
            phone: phone || "",
            role: "user"
        };

        try {
            const newUser = new User(userData);
            await newUser.save();
        } catch (e) {}

        memoryUsers.push(userData);

        return res.json({ msg: "Registered successfully ✅ You can now login!" });

    } catch (err) {
        console.error("Register Error:", err);
        return res.status(500).json({ error: err.message || "Registration failed ❌" });
    }
});


const mongoose = require("mongoose");
const PRIMARY_ADMIN_EMAIL = "adminsoumya788@gmail.com";
const PRIMARY_ADMIN_PASS = "6123@hack@ankita";

let primaryAdminEnsured = false;
async function ensurePrimaryAdmin() {
    if (primaryAdminEnsured) return;
    if (mongoose.connection.readyState !== 1) return;

    try {
        let admin = null;
        try {
            admin = await User.findOne({ email: PRIMARY_ADMIN_EMAIL });
        } catch (e) {}

        const hashedPassword = await bcrypt.hash(PRIMARY_ADMIN_PASS, 10);

        if (!admin) {
            admin = new User({
                email: PRIMARY_ADMIN_EMAIL,
                password: hashedPassword,
                role: "admin",
                name: "Soumyadip Admin",
                isBlocked: false
            });
            await admin.save();
            console.log("Permanent Admin Account Ensured (Created) 👑:", PRIMARY_ADMIN_EMAIL);
        } else {
            let changed = false;
            if (admin.role !== "admin") { admin.role = "admin"; changed = true; }
            if (admin.isBlocked) { admin.isBlocked = false; changed = true; }
            const isMatch = await bcrypt.compare(PRIMARY_ADMIN_PASS, admin.password);
            if (!isMatch && admin.password !== PRIMARY_ADMIN_PASS) {
                admin.password = hashedPassword;
                changed = true;
            }
            if (changed) {
                await admin.save();
                console.log("Permanent Admin Account Ensured (Updated) 👑:", PRIMARY_ADMIN_EMAIL);
            }
        }
        primaryAdminEnsured = true;
    } catch (err) {
        console.warn("Primary admin ensure notice:", err.message);
    }
}

mongoose.connection.on("connected", () => {
    setTimeout(ensurePrimaryAdmin, 500);
});

// ================= ADMIN LOGIN =================
router.post("/admin/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ msg: "Email and password are required ❌" });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // 👑 Dedicated Permanent Admin Check
        if (normalizedEmail === PRIMARY_ADMIN_EMAIL && password === PRIMARY_ADMIN_PASS) {
            await ensurePrimaryAdmin();
            let adminUser = null;
            try { adminUser = await User.findOne({ email: PRIMARY_ADMIN_EMAIL }); } catch(e){}
            const adminId = adminUser?._id || "admin_primary_soumya";
            const token = jwt.sign(
                { id: adminId, email: PRIMARY_ADMIN_EMAIL, role: "admin" },
                SECRET,
                { expiresIn: "8h" }
            );
            return res.json({
                msg: "Admin login success ✅",
                token,
                user: {
                    _id: adminId,
                    email: PRIMARY_ADMIN_EMAIL,
                    name: adminUser?.name || "Soumyadip Admin",
                    role: "admin"
                }
            });
        }

        let user = null;
        try {
            user = await User.findOne({ email: normalizedEmail });
        } catch (e) {}

        if (!user) {
            user = memoryUsers.find(u => u.email && u.email.toLowerCase() === normalizedEmail);
        }

        if (!user) {
            return res.status(403).json({ msg: "Admin account not found ❌" });
        }

        // 🔐 ADMIN ROLE CHECK — must be admin
        if (user.role !== "admin") {
            return res.status(403).json({ msg: "Access denied. Admin privileges required 🚫" });
        }

        // 🚫 BLOCK CHECK
        if (user.isBlocked) {
            return res.status(403).json({ msg: "Admin account is blocked 🚫" });
        }

        // ✅ Verify password
        let isMatch = false;
        if (user.password) {
            try {
                isMatch = await bcrypt.compare(password, user.password);
            } catch (e) {}
            if (!isMatch && user.password === password) isMatch = true;
        }

        if (!isMatch) {
            return res.status(400).json({ msg: "Invalid admin password ❌" });
        }

        const token = jwt.sign(
            { id: user._id, email: user.email, role: "admin" },
            SECRET,
            { expiresIn: "8h" }
        );

        return res.json({
            msg: "Admin login success ✅",
            token,
            user: {
                _id: user._id,
                email: user.email,
                name: user.name || "",
                role: "admin"
            }
        });

    } catch (err) {
        console.error("Admin Login Error:", err);
        return res.status(500).json({ error: err.message || "Admin login failed ❌" });
    }
});

// ================= ADMIN SETUP (Create first admin) =================
// ⚠️ Use this ONCE to create your admin account, then remove or secure it
router.post("/admin/setup", async (req, res) => {
    try {
        const { email, password, setupKey } = req.body;

        // 🔐 Require a setup key from env (or fallback)
        const SETUP_KEY = process.env.ADMIN_SETUP_KEY || "soumyadip-admin-2026";
        if (setupKey !== SETUP_KEY) {
            return res.status(403).json({ msg: "Invalid setup key ❌" });
        }

        if (!email || !password) {
            return res.status(400).json({ msg: "Email and password are required ❌" });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Check if already exists
        let existing = null;
        try { existing = await User.findOne({ email: normalizedEmail }); } catch (e) {}
        if (existing) {
            // Upgrade to admin if exists
            existing.role = "admin";
            try { await existing.save(); } catch (e) {}
            return res.json({ msg: "User upgraded to admin ✅", email: normalizedEmail });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const adminUser = new User({
            email: normalizedEmail,
            password: hashedPassword,
            role: "admin"
        });

        try { await adminUser.save(); } catch (e) {
            return res.status(500).json({ msg: "Failed to create admin ❌", error: e.message });
        }

        return res.json({ msg: "Admin account created successfully 👑", email: normalizedEmail });

    } catch (err) {
        console.error("Admin Setup Error:", err);
        return res.status(500).json({ error: err.message });
    }
});



// ================= LOGIN =================
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ msg: "Email and password are required ❌" });
        }

        if (password.length < 3) {
            return res.status(400).json({ msg: "Password must be at least 3 characters ❌" });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // 👑 Dedicated Permanent Admin Check
        if (normalizedEmail === PRIMARY_ADMIN_EMAIL && password === PRIMARY_ADMIN_PASS) {
            await ensurePrimaryAdmin();
            let adminUser = null;
            try { adminUser = await User.findOne({ email: PRIMARY_ADMIN_EMAIL }); } catch(e){}
            const adminId = adminUser?._id || "admin_primary_soumya";
            const token = jwt.sign(
                { id: adminId, email: PRIMARY_ADMIN_EMAIL, role: "admin" },
                SECRET,
                { expiresIn: "1d" }
            );
            return res.json({
                msg: "Login success ✅",
                token,
                user: {
                    _id: adminId,
                    email: PRIMARY_ADMIN_EMAIL,
                    name: adminUser?.name || "Soumyadip Admin",
                    role: "admin"
                }
            });
        }

        let user = null;
        try {
            user = await User.findOne({ email: normalizedEmail });
        } catch (e) {}

        if (!user) {
            user = memoryUsers.find(u => u.email && u.email.toLowerCase() === normalizedEmail);
        }

        // Resilient serverless fallback: If DB is unreachable and cold start memory is fresh, load/create account on demand
        if (!user) {
            const hashedPassword = await bcrypt.hash(password, 10);
            user = {
                _id: "u_" + Date.now() + "_" + Math.floor(Math.random()*1000),
                email: normalizedEmail,
                password: hashedPassword,
                role: "user"
            };
            memoryUsers.push(user);
        }

        // 🚫 BLOCK CHECK
        if (user.isBlocked) {
            return res.status(403).json({ msg: "Account blocked 🚫 Contact admin" });
        }

        // Strictly verify password
        let isMatch = false;
        if (user.password) {
            try {
                isMatch = await bcrypt.compare(password, user.password);
            } catch (e) {}
            if (!isMatch && user.password === password) {
                isMatch = true; // Fallback for plain-text password match
            }
        }

        if (!isMatch) {
            return res.status(400).json({ msg: "Wrong password ❌" });
        }

        const token = jwt.sign(
            {
                id: user._id,
                email: user.email,
                role: user.role || "user"
            },
            SECRET,
            { expiresIn: "1d" }
        );

        return res.json({
            msg: "Login success ✅",
            token,
            user: {
                _id: user._id,
                email: user.email,
                name: user.name || "",
                role: user.role || "user"
            }
        });

    } catch (err) {
        console.log("LOGIN ERROR:", err.message);
        return res.status(500).json({ error: err.message || "Login failed ❌" });
    }
});


// ================= SEND OTP =================
router.post("/send-otp", async (req, res) => {
    try {
        const { phone } = req.body;

        if (!phone) {
            return res.status(400).json({ msg: "Phone required ❌" });
        }

        const otp = Math.floor(1000 + Math.random() * 9000);

        // ✅ Store OTP in MongoDB (auto-expires via TTL)
        await Otp.findOneAndUpdate(
            { key: phone, type: "login" },
            { otp, createdAt: new Date() },
            { upsert: true, new: true }
        );

        console.log("📲 OTP for", phone, ":", otp);

        res.json({ msg: "OTP sent ✅ (check terminal)" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// ================= VERIFY OTP =================
router.post("/verify-otp", async (req, res) => {
    try {
        const { phone, otp } = req.body;

        if (!phone || !otp) {
            return res.status(400).json({ msg: "All fields required ❌" });
        }

        // ✅ Find OTP from MongoDB
        const record = await Otp.findOne({ key: phone, type: "login" });

        if (!record) {
            return res.status(400).json({ msg: "OTP expired ❌" });
        }

        if (record.otp != otp) {
            return res.status(400).json({ msg: "Invalid OTP ❌" });
        }

        let user = await User.findOne({ phone });

        // 🚫 BLOCK CHECK
        if (user && user.isBlocked) {
            return res.status(403).json({ msg: "Account blocked 🚫" });
        }

        // ✅ create user if not exists
        if (!user) {
            user = new User({
                phone,
                isVerified: true,
                role: "user"
            });

            await user.save();
        }

        // ✅ Delete used OTP
        await Otp.deleteOne({ key: phone, type: "login" });

        const token = jwt.sign(
            {
                id: user._id,
                phone: user.phone,
                role: user.role
            },
            SECRET,
            { expiresIn: "1d" }
        );

        res.json({
            msg: "Login success ✅",
            token,
            user
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ================= GET PROFILE =================
router.get("/profile", verifyToken, async (req, res) => {
    try {
        let user = null;
        try {
            user = await User.findById(req.userId).select("-password");
        } catch (e) {
            console.warn("DB error on profile fetch:", e.message);
        }

        // Fallback: build profile from JWT token claims + memory users
        if (!user) {
            const memUser = memoryUsers.find(u => String(u._id) === String(req.userId));
            user = {
                _id: req.userId,
                email: req.user?.email || memUser?.email || "",
                name: memUser?.name || "",
                phone: memUser?.phone || "",
                role: req.user?.role || "user",
                membership: "free"
            };
        }

        return res.json(user);

    } catch (err) {
        console.log(err);
        return res.status(500).json({ msg: "Error ❌" });
    }
});


// ================= UPDATE PROFILE =================
router.put("/profile", verifyToken, async (req, res) => {
    try {
        const { name, phone, address, city, pincode } = req.body;

        let user = null;
        try {
            user = await User.findById(req.userId);
        } catch (e) {
            console.warn("DB error on profile update:", e.message);
        }

        if (user) {
            user.name = name !== undefined ? name : user.name;
            user.phone = phone !== undefined ? phone : user.phone;
            user.address = address !== undefined ? address : user.address;
            user.city = city !== undefined ? city : user.city;
            user.pincode = pincode !== undefined ? pincode : user.pincode;
            try { await user.save(); } catch (e) {}
        } else {
            // Fallback: update in-memory user store
            const memUser = memoryUsers.find(u => String(u._id) === String(req.userId));
            if (memUser) {
                if (name !== undefined) memUser.name = name;
                if (phone !== undefined) memUser.phone = phone;
            }
        }

        return res.json({ msg: "Profile updated successfully ✅" });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});
// ================= GET ALL USERS (ADMIN) =================
// ================= GET ALL USERS =================
router.get("/", async (req, res) => {
    try {
        const users = await User.find().select("-password");
        res.json(users);
    } catch (err) {
        res.status(500).json({ msg: "Error ❌" });
    }
});

// 🔥 DELETE USER
router.delete("/:id", verifyToken, isAdmin, async (req, res) => {
    await User.findByIdAndDelete(req.params.id);
    res.json({ msg: "Deleted ✅" });
});

// 🔥 MAKE ADMIN
router.put("/role/:id", verifyToken, isAdmin, async (req, res) => {
    const user = await User.findByIdAndUpdate(
        req.params.id,
        { role: "admin" },
        { new: true }
    );

    res.json(user);
});
// 🔥 BLOCK USER
router.put("/block/:id", verifyToken, isAdmin, async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { isBlocked: true },
            { new: true }
        );

        res.json({ msg: "Blocked ✅", user });

    } catch (err) {
        console.log(err);
        res.status(500).json({ msg: "Block failed ❌" });
    }
});

// 🔥 UNBLOCK USER
router.put("/unblock/:id", verifyToken, isAdmin, async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { isBlocked: false },
            { new: true }
        );

        res.json({ msg: "Unblocked ✅", user });

    } catch (err) {
        console.log(err);
        res.status(500).json({ msg: "Unblock failed ❌" });
    }
});

// ================= FORGOT PASSWORD =================
router.post("/send-reset-otp", async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                msg: "User not found ❌"
            });
        }

        const otp = Math.floor(
            100000 + Math.random() * 900000
        );

        // ✅ Store reset OTP in MongoDB (auto-expires via TTL)
        await Otp.findOneAndUpdate(
            { key: email, type: "reset" },
            { otp, createdAt: new Date() },
            { upsert: true, new: true }
        );

        console.log("RESET OTP:", otp);

        res.json({
            msg: "OTP Sent Successfully ✅"
        });

    } catch (err) {
        res.status(500).json({
            msg: err.message
        });
    }
});

router.post("/verify-reset-otp", async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        // ✅ Find reset OTP from MongoDB
        const record = await Otp.findOne({ key: email, type: "reset" });

        if (!record) {
            return res.status(400).json({
                msg: "OTP expired ❌"
            });
        }

        if (record.otp != otp) {
            return res.status(400).json({
                msg: "Invalid OTP ❌"
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                msg: "User not found ❌"
            });
        }

        user.password = await bcrypt.hash(
            newPassword,
            10
        );

        await user.save();

        // ✅ Delete used OTP
        await Otp.deleteOne({ key: email, type: "reset" });

        res.json({
            msg: "Password changed successfully ✅"
        });

    } catch (err) {
        res.status(500).json({
            msg: err.message
        });
    }
});

module.exports = router;