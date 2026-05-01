const express = require("express");
const router = express.Router();

const Razorpay = require("razorpay");
const User = require("../models/User");
const { verifyToken } = require("../middleware/auth");

// 🔥 USE REAL TEST KEYS FROM RAZORPAY
const razorpay = new Razorpay({
    key_id: "rzp_test_abc123xxxx",     // ✅ your real Key ID
    key_secret: "abcd1234xxxxxx"       // ✅ your real Secret
});

// ✅ CREATE ORDER
router.post("/create-order", verifyToken, async (req, res) => {
    try {
        const options = {
            amount: 9900,
            currency: "INR",
            receipt: "order_" + Date.now()
        };
        const order = await razorpay.orders.create(options);
        res.json(order);

    } catch (err) {
        console.log("ORDER ERROR:", err);
        res.status(500).json({ message: "Order creation failed ❌" });
    }
});

// ✅ VERIFY PAYMENT
router.post("/verify-payment", verifyToken, async (req, res) => {
    try {
        const { paymentId } = req.body;

        if (!paymentId) {
            return res.status(400).json({ message: "Payment failed ❌" });
        }

        await User.findByIdAndUpdate(req.userId, {
            membership: "premium_plus",
            membershipExpiry: new Date(Date.now() + 30*24*60*60*1000)
        });

        res.json({ message: "Premium Activated ✅" });

    } catch (err) {
        console.log("VERIFY ERROR:", err);
        res.status(500).json({ message: "Server error ❌" });
    }
});

module.exports = router;