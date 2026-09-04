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
        const { name, address, phone, payment, cartItems } = req.body;

        if (!name || !address || !phone || !payment) {
            return res.status(400).json({ error: "Missing customer or payment details ❌" });
        }

        let cartItemsList = [];

        // 1. Try MongoDB cart
        let cart = null;
        try {
            cart = await Cart.findOne({ userId });
        } catch (e) {}

        if (cart && cart.items && cart.items.length > 0) {
            cartItemsList = cart.items;
        }

        // 2. Fallback: use cartItems sent directly in request body (from localStorage)
        if (cartItemsList.length === 0 && Array.isArray(cartItems) && cartItems.length > 0) {
            cartItemsList = cartItems;
        }

        if (cartItemsList.length === 0) {
            return res.status(400).json({ error: "Cart is empty ❌" });
        }

        // 3. Validate Stock for all cart items
        for (const item of cartItemsList) {
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
                        error: `Insufficient stock for "${item.name}". Available: ${product.stock} ❌`
                    });
                }
            }
        }

        // 4. Calculate Total & Format Items
        let total = 0;
        cartItemsList.forEach(item => {
            total += item.price * (item.quantity || 1);
        });

        const formattedItems = cartItemsList.map(item => ({
            name: item.name,
            price: item.price,
            img: item.img,
            quantity: item.quantity || 1
        }));

        // 5. Create Order
        const orderId = "ord_" + Date.now() + "_" + Math.floor(Math.random() * 10000);
        let savedOrder = {
            _id: orderId,
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
                _id: orderId,
                userId,
                items: formattedItems,
                total,
                customer: { name, address, phone },
                payment,
                status: "Placed"
            });
            savedOrder = await newOrder.save();
            console.log("Order saved to MongoDB successfully ✅ ID:", savedOrder._id);
        } catch (e) {
            console.error("MongoDB Order save error:", e.message);
        }
        memoryOrders.unshift(savedOrder);

        // 6. Reduce Product Stock
        for (const item of cartItemsList) {
            let product = null;
            if (item.productId) {
                try { product = await Product.findById(item.productId); } catch (e) {}
            }
            if (!product) {
                try { product = await Product.findOne({ name: item.name }); } catch (e) {}
            }

            if (product && product.stock !== undefined) {
                product.stock = Math.max(0, product.stock - (item.quantity || 1));
                try { await product.save(); } catch (e) {}
            }
        }

        // 7. Clear cart after successful order
        if (cart && cart.items) {
            cart.items = [];
            try { if (cart.save) await cart.save(); } catch (e) {}
        }

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

        const orderMap = new Map();
        if (Array.isArray(orders)) {
            orders.forEach(o => {
                if (o && o._id) orderMap.set(String(o._id), o);
            });
        }
        if (Array.isArray(memoryOrders)) {
            memoryOrders.filter(o => String(o.userId) === userId).forEach(o => {
                if (o && o._id && !orderMap.has(String(o._id))) {
                    orderMap.set(String(o._id), o);
                }
            });
        }

        const userOrders = Array.from(orderMap.values()).sort((a, b) => {
            const dateA = new Date(a.createdAt || 0);
            const dateB = new Date(b.createdAt || 0);
            return dateB - dateA;
        });

        return res.json(userOrders);

    } catch (err) {
        console.log("ORDER FETCH ERROR:", err);
        const orders = memoryOrders.filter(o => String(o.userId) === String(req.userId));
        return res.json(orders || []);
    }
});


// ================= DELETE ORDER (USER) =================
router.delete("/:id", verifyToken, async (req, res) => {
    const orderId = req.params.id;
    const userId = String(req.userId);

    try {
        try {
            await Order.deleteOne({ _id: orderId, userId });
        } catch (e) {
            try { await Order.findByIdAndDelete(orderId); } catch (err) {}
        }

        // Delete from in-memory fallback store
        for (let i = memoryOrders.length - 1; i >= 0; i--) {
            if (String(memoryOrders[i]._id) === String(orderId)) {
                memoryOrders.splice(i, 1);
            }
        }

        return res.json({ msg: "Order deleted 🗑️" });

    } catch (err) {
        console.log("DELETE ORDER ERROR:", err.message);
        for (let i = memoryOrders.length - 1; i >= 0; i--) {
            if (String(memoryOrders[i]._id) === String(orderId)) {
                memoryOrders.splice(i, 1);
            }
        }
        return res.json({ msg: "Order deleted 🗑️" });
    }
});


// ================= ADMIN: ALL ORDERS =================
router.get(["/all-orders", "/all", "/admin/all"], verifyToken, isAdmin, async (req, res) => {
    try {
        let orders = [];
        try {
            orders = await Order.find().sort({ createdAt: -1 });
        } catch (e) {
            console.warn("DB Order fetch notice:", e.message);
        }

        const orderMap = new Map();
        if (Array.isArray(orders)) {
            orders.forEach(o => {
                if (o && o._id) orderMap.set(String(o._id), o);
            });
        }
        if (Array.isArray(memoryOrders)) {
            memoryOrders.forEach(o => {
                if (o && o._id && !orderMap.has(String(o._id))) {
                    orderMap.set(String(o._id), o);
                }
            });
        }

        const combined = Array.from(orderMap.values()).sort((a, b) => {
            const dateA = new Date(a.createdAt || 0);
            const dateB = new Date(b.createdAt || 0);
            return dateB - dateA;
        });

        return res.json(combined);

    } catch (err) {
        console.error("ADMIN ALL-ORDERS ERROR:", err);
        return res.json(memoryOrders || []);
    }
});


// ================= ADMIN: DELETE ORDER =================
router.delete("/admin-delete/:id", verifyToken, isAdmin, async (req, res) => {
    const orderId = req.params.id;
    try {
        try {
            await Order.deleteOne({ _id: orderId });
        } catch (e) {
            try { await Order.findByIdAndDelete(orderId); } catch (err) {}
        }

        // Delete from in-memory fallback store
        for (let i = memoryOrders.length - 1; i >= 0; i--) {
            if (String(memoryOrders[i]._id) === String(orderId)) {
                memoryOrders.splice(i, 1);
            }
        }

        return res.json({ msg: "Order deleted ✅" });

    } catch (err) {
        console.log("ADMIN DELETE ERROR:", err);
        for (let i = memoryOrders.length - 1; i >= 0; i--) {
            if (String(memoryOrders[i]._id) === String(orderId)) {
                memoryOrders.splice(i, 1);
            }
        }
        return res.json({ msg: "Order deleted ✅" });
    }
});


// ================= ADMIN: UPDATE STATUS =================
router.put("/update-status/:id", verifyToken, isAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        const orderId = req.params.id;

        let order = null;
        try {
            order = await Order.findOneAndUpdate(
                { _id: orderId },
                { $set: { status } },
                { new: true }
            );
        } catch (e) {
            try {
                order = await Order.findByIdAndUpdate(
                    orderId,
                    { $set: { status } },
                    { new: true }
                );
            } catch (err) {}
        }

        // Sync in memoryOrders
        for (let i = 0; i < memoryOrders.length; i++) {
            if (String(memoryOrders[i]._id) === String(orderId)) {
                memoryOrders[i].status = status;
                if (!order) order = memoryOrders[i];
                break;
            }
        }

        return res.json({ msg: "Status updated successfully ✅", order: order || { _id: orderId, status } });

    } catch (err) {
        return res.status(500).json({ error: err.message });
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