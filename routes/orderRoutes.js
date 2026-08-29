const express = require("express");
const router = express.Router();

const Order = require("../models/Order");
const Cart = require("../models/Cart");

const { verifyToken, isAdmin } = require("../middleware/auth");


// ================= CHECKOUT =================
router.post("/checkout", verifyToken, async (req, res) => {
    try {
        // ✅ FIX: use same pattern everywhere
        const userId = req.user.id;

        const { name, address, phone, payment } = req.body;

        if (!name || !address || !phone || !payment) {
            return res.status(400).json({ error: "Missing details ❌" });
        }

        const cart = await Cart.findOne({ userId: String(userId) });

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ error: "Cart is empty ❌" });
        }

        let total = 0;
        cart.items.forEach(item => {
            total += item.price * item.quantity;
        });

        const formattedItems = cart.items.map(item => ({
            name: item.name,
            price: item.price,
            img: item.img,
            quantity: item.quantity
        }));

        const newOrder = new Order({
            userId: String(userId),
            items: formattedItems,
            total,
            customer: { name, address, phone },
            payment,
            status: "Ordered"
        });

        const savedOrder = await newOrder.save();

        // 🧹 clear cart
        cart.items = [];
        await cart.save();

        res.json({
            msg: "Order placed successfully ✅",
            order: savedOrder
        });

    } catch (err) {
        console.log("CHECKOUT ERROR:", err.message);
        res.status(500).json({ error: err.message });
    }
});


// ================= USER ORDERS =================
router.get("/", verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;

        const orders = await Order.find({ userId: String(userId) })
            .sort({ createdAt: -1 });

        res.json(orders);

    } catch (err) {
        console.log("ORDER FETCH ERROR:", err);
        res.status(500).json({ error: err.message });
    }
});


// ================= DELETE ORDER (USER) =================
router.delete("/:id", verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;

        const order = await Order.findOne({
            _id: req.params.id,
            userId: String(userId)
        });

        if (!order) {
            return res.status(404).json({ error: "Order not found ❌" });
        }

        await Order.findByIdAndDelete(req.params.id);

        res.json({ msg: "Order deleted 🗑️" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// ================= ADMIN: ALL ORDERS =================
router.get("/all-orders", verifyToken, isAdmin, async (req, res) => {
    try {
        console.log("ADMIN USER:", req.user); // 🔥 debug

        const orders = await Order.find().sort({ createdAt: -1 });

        res.json(orders || []);

    } catch (err) {
        console.log("ERROR:", err);
        res.status(500).json({ error: err.message });
    }
});


// ================= ADMIN: DELETE ORDER =================
router.delete("/admin-delete/:id", verifyToken, isAdmin, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ msg: "Order not found ❌" });
        }

        await Order.findByIdAndDelete(req.params.id);

        res.json({ msg: "Order deleted ✅" });

    } catch (err) {
        console.log("ADMIN DELETE ERROR:", err);
        res.status(500).json({ error: err.message });
    }
});


// ================= ADMIN: UPDATE STATUS =================
router.put("/update-status/:id", verifyToken, isAdmin, async (req, res) => {
    try {
        const { status } = req.body;

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { $set: { status } }, // 🔥 FIXED
            { new: true }
        );

        res.json(order);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// ================= RETURN REQUEST =================
router.post("/return", verifyToken, async (req, res) => {
    try {
        const { orderId, reason } = req.body;

        await Order.findByIdAndUpdate(orderId, {
            returnStatus: "Requested",
            returnReason: reason
        });

        res.json({ message: "Return requested 🔁" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;