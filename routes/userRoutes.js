const express = require("express");
const router = express.Router();

const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { verifyToken, isAdmin } = require("../middleware/auth");

const SECRET = "secretkey";

// 🔥 OTP STORE WITH EXPIRY
let otpStore = {};

// ================= REGISTER =================
router.post("/register", async (req, res) => {
    try {
        const { email, password, phone } = req.body;

        if (!email || !password) {
            return res.status(400).json({ msg: "All fields required ❌" });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ msg: "User already exists ❌" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            email,
            password: hashedPassword,
            phone, // ✅ added
            role: "user"
        });

        await newUser.save();

        res.json({ msg: "Registered successfully ✅" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// ================= LOGIN =================
// ================= LOGIN =================
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ msg: "All fields required ❌" });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ msg: "User not found ❌" });
        }

        // 🚫 BLOCK CHECK (🔥 THIS WAS MISSING)
        if (user.isBlocked) {
            return res.status(403).json({ msg: "Account blocked 🚫 Contact admin" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

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

        res.json({
            msg: "Login success ✅",
            token,
            user
        });

    } catch (err) {
        console.log("ERROR:", err.message);
        res.status(500).json({ error: err.message });
    }
});


// ================= SEND OTP =================
router.post("/send-otp", (req, res) => {
    try {
        const { phone } = req.body;

        if (!phone) {
            return res.status(400).json({ msg: "Phone required ❌" });
        }

        const otp = Math.floor(1000 + Math.random() * 9000);

        // ⏳ store with expiry (2 minutes)
        otpStore[phone] = {
            otp,
            expires: Date.now() + 2 * 60 * 1000
        };

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

        const record = otpStore[phone];

        if (!record) {
            return res.status(400).json({ msg: "OTP expired ❌" });
        }

        if (Date.now() > record.expires) {
            delete otpStore[phone];
            return res.status(400).json({ msg: "OTP expired ❌" });
        }

        if (record.otp != otp) {
            return res.status(400).json({ msg: "Invalid OTP ❌" });
        }

        let user = await User.findOne({ phone });

        // 🚫 BLOCK CHECK (🔥 ADD HERE)
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

        delete otpStore[phone];

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
        const user = await User.findById(req.userId).select("-password");

        if (!user) {
            return res.status(404).json({ msg: "User not found ❌" });
        }

        res.json(user); // ✅ MUST RETURN USER OBJECT

    } catch (err) {
        console.log(err);
        res.status(500).json({ msg: "Error ❌" });
    }
});


// ================= UPDATE PROFILE =================
router.put("/profile", verifyToken, async (req, res) => {
    try {
        const { name, phone, address, city, pincode } = req.body;

        const user = await User.findById(req.userId); // ✅ FIXED

        if (!user) {
            return res.status(404).json({ error: "User not found ❌" });
        }

        user.name = name || user.name;
        user.phone = phone || user.phone;
        user.address = address || user.address;
        user.city = city || user.city;
        user.pincode = pincode || user.pincode;

        await user.save();

        res.json({ msg: "Profile updated successfully ✅" });

    } catch (err) {
        res.status(500).json({ error: err.message });
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

module.exports = router;