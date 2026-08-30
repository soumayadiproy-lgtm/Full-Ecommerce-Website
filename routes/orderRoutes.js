const express = require("express");
const router = express.Router();

const Order = require("../models/Order");
const Cart = require("../models/Cart");

const Product = require("../models/Product");
const { verifyToken, isAdmin } = require("../middleware/auth");


const memoryOrders = [];

// ================= CHECKOUT =================
router.post("/checkout", verifyToken, async (req, res) => {
    try {
        const userId = String(req.userId);
        const { name, address, phone, payment } = req.body;

        if (!name || !address || !phone || !payment) {
            return res.status(400).json({ error: "Missing customer or payment details ❌" });
        }

        let cart = null;
        try {
            cart = await Cart.findOne({ userId });
        } catch (e) {}

        if (!cart || !cart.items || cart.items.length === 0) {
            // Check memory cart if available
            const memoryCartModule = require("./cartRoutes");
            // If cart is completely empty
            return res.status(400).json({ error: "Cart is empty ❌" });
        }

        // 1. Validate Stock for all cart items first
        for (const item of cart.items) {
            let product = null;
            if (item.productId) {
                try { product = await Product.findById(item.productId); } catch (e) {}
            }
            if (!product) {
                try { product = await Product.findOne({ name: item.name }); } catch (e) {}
            }

            if (product && product.stock !== undefined) {
                if (product.stock < item.quantity) {
                    return res.status(400).json({
                        error: `Insufficient stock for "${item.name}". Available stock: ${product.stock} ❌`
                    });
                }
            }
        }

        // 2. Calculate Total & Format Items
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

        // 3. Create Order
        let savedOrder = {
            _id: "ord_" + Date.now() + "_" + Math.floor(Math.random()*1000),
            userId,
            items: formattedItems,
            total,
            customer: { name, address, phone },
            payment,
            status: "Placed",
            createdAt: new Date()
        };

        try {
            const newOrder = new Order({
                userId,
                items: formattedItems,
                total,
                customer: { name, address, phone },
                payment,
                status: "Placed"
            });
            savedOrder = await newOrder.save();
        } catch (e) {
            memoryOrders.unshift(savedOrder);
        }
        memoryOrders.unshift(savedOrder);

        // 4. Reduce Product Stock after successful order creation
        for (const item of cart.items) {
            let product = null;
            if (item.productId) {
                try { product = await Product.findById(item.productId); } catch (e) {}
            }
            if (!product) {
                try { product = await Product.findOne({ name: item.name }); } catch (e) {}
            }

            if (product && product.stock !== undefined) {
                product.stock = Math.max(0, product.stock - item.quantity);
                try { await product.save(); } catch (e) {}
            }
        }

        // 5. Clear cart ONLY after successful order
        cart.items = [];
        try {
            if (cart.save) await cart.save();
        } catch (e) {}

        return res.json({
            msg: "Order placed successfully ✅",
            order: savedOrder
        });

    } catch (err) {
        console.log("CHECKOUT ERROR:", err.message);
        return res.status(500).json({ error: err.message || "Order checkout failed ❌" });
    }
});


// ================= USER ORDERS =================
router.get("/", verifyToken, async (req, res) => {
    try {
        const userId = String(req.userId);
        let orders = [];

        try {
            orders = await Order.find({ userId }).sort({ createdAt: -1 });
        } catch (e) {}

        if (!orders || orders.length === 0) {
            orders = memoryOrders.filter(o => String(o.userId) === userId);
        }

        return res.json(orders || []);

    } catch (err) {
        console.log("ORDER FETCH ERROR:", err);
        const orders = memoryOrders.filter(o => String(o.userId) === String(req.userId));
        return res.json(orders || []);
    }
});


// ================= DELETE ORDER (USER) =================
router.delete("/:id", verifyToken, async (req, res) => {
    try {
        const userId = req.userId;

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