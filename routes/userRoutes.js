const express = require("express");
const router = express.Router();

const User = require("../models/User");
const Otp = require("../models/Otp");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { verifyToken, isAdmin } = require("../middleware/auth");

const SECRET = process.env.JWT_SECRET || "secretkey";

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

        // 🚫 BLOCK CHECK
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