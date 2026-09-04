const express = require("express");
const router = express.Router();

const User = require("../models/User");
const Otp = require("../models/Otp");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const connectDB = require("../config/db");
const { verifyToken, isAdmin } = require("../middleware/auth");
const mailer = require("../config/mailer");

const SECRET = process.env.JWT_SECRET || "secretkey";

const memoryUsers = [];

// ================= SEND REGISTRATION OTP =================
router.post(["/send-register-otp", "/register/send-otp"], async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ msg: "Email is required ❌" });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(normalizedEmail)) {
            return res.status(400).json({ msg: "Please provide a valid email address ❌" });
        }

        try { await connectDB(); } catch (e) {}

        // Check if user already exists
        let existingUser = null;
        try {
            existingUser = await User.findOne({ email: normalizedEmail });
        } catch (e) {}

        if (!existingUser) {
            existingUser = memoryUsers.find(u => u.email && u.email.toLowerCase() === normalizedEmail);
        }

        if (existingUser) {
            return res.status(400).json({ msg: "An account with this email already exists ❌ Please login!" });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000);

        // Store OTP in MongoDB (expires in 5 minutes via TTL index)
        try {
            await Otp.findOneAndUpdate(
                { key: normalizedEmail, type: "register" },
                { otp, createdAt: new Date() },
                { upsert: true, new: true }
            );
        } catch (dbErr) {
            console.warn("MongoDB Otp upsert warning:", dbErr.message);
        }

        // Dispatch real email via mailer
        const mailResult = await mailer.sendRegistrationOtp(normalizedEmail, otp);

        const responsePayload = {
            msg: mailResult.sent 
                ? "Verification code sent to your email! ✉️ Please check your inbox (and spam folder)."
                : "Verification code generated! ✅ (Check server terminal for code if SMTP is not configured)",
            email: normalizedEmail
        };

        if (!mailResult.sent && mailResult.devOtp) {
            responsePayload.devOtp = mailResult.devOtp;
        }

        return res.json(responsePayload);

    } catch (err) {
        console.error("Send Register OTP Error:", err);
        return res.status(500).json({ error: err.message || "Failed to send verification code ❌" });
    }
});

// ================= REGISTER =================
router.post("/register", async (req, res) => {
    try {
        const { email, password, phone, name, otp } = req.body;

        if (!email || !password) {
            return res.status(400).json({ msg: "Email and password are required ❌" });
        }

        if (password.length < 4) {
            return res.status(400).json({ msg: "Password must be at least 4 characters ❌" });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // 🔐 Require OTP verification for genuine registration
        if (!otp) {
            return res.status(400).json({ msg: "Email verification code is required ❌ Click 'Get Code' first." });
        }

        try {
            await connectDB();
        } catch (e) {}

        const otpRecord = await Otp.findOne({ key: normalizedEmail, type: "register" });
        if (!otpRecord) {
            return res.status(400).json({ msg: "Verification code expired or not requested ❌ Please click 'Resend Code'." });
        }

        if (String(otpRecord.otp) !== String(otp).trim()) {
            return res.status(400).json({ msg: "Invalid verification code ❌ Please check your email." });
        }

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

        const newUser = new User({
            email: normalizedEmail,
            password: hashedPassword,
            phone: phone || "",
            name: name || normalizedEmail.split("@")[0],
            role: "user",
            isBlocked: false,
            isVerified: true,
            membership: "free"
        });

        let savedUser = null;
        try {
            savedUser = await newUser.save();
            console.log("✅ New user registered and saved to MongoDB:", normalizedEmail, "ID:", savedUser._id);
        } catch (dbErr) {
            console.error("❌ MongoDB User save error:", dbErr.message);
        }

        // Delete used OTP
        try {
            await Otp.deleteOne({ key: normalizedEmail, type: "register" });
        } catch (e) {}

        const userId = savedUser ? savedUser._id : ("u_" + Date.now());
        memoryUsers.push({
            _id: userId,
            email: normalizedEmail,
            password: hashedPassword,
            phone: phone || "",
            name: name || normalizedEmail.split("@")[0],
            role: "user",
            isBlocked: false,
            isVerified: true,
            membership: "free"
        });

        return res.json({ msg: "Registered and email verified successfully ✅ You can now login!" });

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

        // ❌ Reject login if account does not exist
        if (!user) {
            return res.status(400).json({ msg: "Account not found ❌ Please check your email or register." });
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
router.get(["/", "/all", "/all-users", "/users"], async (req, res) => {
    try {
        try {
            await connectDB();
        } catch (e) {}

        let dbUsers = [];
        try {
            dbUsers = await User.find().select("-password").sort({ createdAt: -1 });
        } catch (dbErr) {
            console.warn("DB user fetch error:", dbErr.message);
        }

        // Merge DB users, memoryUsers, and any users from orders so ALL users show in admin panel
        const userMap = new Map();

        if (Array.isArray(dbUsers)) {
            dbUsers.forEach(u => {
                if (u) {
                    const key = (u.email ? u.email.toLowerCase() : (u.phone || String(u._id)));
                    userMap.set(key, {
                        _id: u._id,
                        email: u.email || (u.phone ? `user_${u.phone}@mobile` : `user_${String(u._id).slice(-6)}`),
                        name: u.name || (u.email ? u.email.split("@")[0] : (u.phone || "User")),
                        phone: u.phone || "",
                        role: u.role || "user",
                        isBlocked: !!u.isBlocked,
                        membership: u.membership || "free",
                        createdAt: u.createdAt || new Date()
                    });
                }
            });
        }

        if (Array.isArray(memoryUsers)) {
            memoryUsers.forEach(u => {
                if (u) {
                    const key = (u.email ? u.email.toLowerCase() : (u.phone || String(u._id)));
                    if (!userMap.has(key)) {
                        userMap.set(key, {
                            _id: u._id,
                            email: u.email || (u.phone ? `user_${u.phone}@mobile` : `user_${String(u._id).slice(-6)}`),
                            name: u.name || (u.email ? u.email.split("@")[0] : "User"),
                            phone: u.phone || "",
                            role: u.role || "user",
                            isBlocked: !!u.isBlocked,
                            membership: u.membership || "free",
                            createdAt: new Date()
                        });
                    }
                }
            });
        }

        // Also check Order collection for any customer accounts that placed orders
        try {
            const Order = require("../models/Order");
            const customerOrders = await Order.find().select("customer userId createdAt").sort({ createdAt: -1 });
            if (Array.isArray(customerOrders)) {
                customerOrders.forEach(o => {
                    if (o && o.customer && (o.customer.phone || o.customer.name)) {
                        const key = (o.customer.phone || String(o.userId || o._id));
                        if (!userMap.has(key)) {
                            userMap.set(key, {
                                _id: o.userId || ("cust_" + String(o._id).slice(-8)),
                                email: o.customer.email || (o.customer.phone ? `user_${o.customer.phone}@mobile` : "Customer"),
                                name: o.customer.name || "Customer",
                                phone: o.customer.phone || "",
                                role: "user",
                                isBlocked: false,
                                membership: "free",
                                createdAt: o.createdAt || new Date()
                            });
                        }
                    }
                });
            }
        } catch (ordErr) {
            console.warn("Notice checking customer orders for users:", ordErr.message);
        }

        const allUsers = Array.from(userMap.values());
        return res.json(allUsers);

    } catch (err) {
        console.error("Error in GET /api/users:", err);
        return res.json(memoryUsers.map(u => ({
            _id: u._id,
            email: u.email || "User",
            name: u.name || "",
            role: u.role || "user",
            isBlocked: !!u.isBlocked
        })));
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
router.post(["/send-reset-otp", "/forgot-password/send-otp"], async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ msg: "Email is required ❌" });
        }

        const normalizedEmail = email.trim().toLowerCase();

        try { await connectDB(); } catch (e) {}

        let user = null;
        try {
            user = await User.findOne({ email: normalizedEmail });
        } catch (e) {}

        if (!user) {
            user = memoryUsers.find(u => u.email && u.email.toLowerCase() === normalizedEmail);
        }

        if (!user) {
            return res.status(404).json({
                msg: "No account found with this email ❌ Please check your spelling or register."
            });
        }

        if (user.isBlocked) {
            return res.status(403).json({
                msg: "This account is blocked 🚫 Please contact store support."
            });
        }

        const otp = Math.floor(100000 + Math.random() * 900000);

        // ✅ Store reset OTP in MongoDB (auto-expires via TTL index in 5 minutes)
        try {
            await Otp.findOneAndUpdate(
                { key: normalizedEmail, type: "reset" },
                { otp, createdAt: new Date() },
                { upsert: true, new: true }
            );
        } catch (dbErr) {
            console.warn("MongoDB Reset OTP upsert notice:", dbErr.message);
        }

        // Dispatch real email via mailer
        const mailResult = await mailer.sendPasswordResetOtp(normalizedEmail, otp);

        const responsePayload = {
            msg: mailResult.sent 
                ? "Password reset code sent to your email! ✉️ Check your inbox."
                : "Reset code generated! ✅ (Check server terminal for code if SMTP is not configured)"
        };

        if (!mailResult.sent && mailResult.devOtp) {
            responsePayload.devOtp = mailResult.devOtp;
        }

        return res.json(responsePayload);

    } catch (err) {
        console.error("Send Reset OTP Error:", err);
        return res.status(500).json({
            msg: err.message || "Failed to send reset code ❌"
        });
    }
});

router.post(["/verify-reset-otp", "/forgot-password/reset"], async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        if (!email || !otp || !newPassword) {
            return res.status(400).json({ msg: "All fields are required ❌" });
        }

        if (newPassword.length < 4) {
            return res.status(400).json({ msg: "New password must be at least 4 characters ❌" });
        }

        const normalizedEmail = email.trim().toLowerCase();

        try { await connectDB(); } catch (e) {}

        // ✅ Find reset OTP from MongoDB
        const record = await Otp.findOne({ key: normalizedEmail, type: "reset" });

        if (!record) {
            return res.status(400).json({
                msg: "Reset code expired or not requested ❌ Please request a new code."
            });
        }

        if (String(record.otp) !== String(otp).trim()) {
            return res.status(400).json({
                msg: "Invalid verification code ❌ Please check your email."
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
            return res.status(404).json({
                msg: "User not found ❌"
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        try {
            await user.save();
        } catch (e) {}

        const memUser = memoryUsers.find(u => u.email && u.email.toLowerCase() === normalizedEmail);
        if (memUser) {
            memUser.password = hashedPassword;
        }

        // ✅ Delete used OTP
        try {
            await Otp.deleteOne({ key: normalizedEmail, type: "reset" });
        } catch (e) {}

        return res.json({
            msg: "Password changed successfully ✅ You can now login with your new password!"
        });

    } catch (err) {
        console.error("Verify Reset OTP Error:", err);
        return res.status(500).json({
            msg: err.message || "Failed to reset password ❌"
        });
    }
});

module.exports = router;