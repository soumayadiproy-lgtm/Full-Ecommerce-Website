const express = require("express");
const router = express.Router();
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET || "secretkey";

// 🔐 AUTH
function auth(req, res, next) {
    let token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ message: "Login required ❌" });
    }

    if (token.startsWith("Bearer ")) {
        token = token.split(" ")[1];
    }

    try {
        const decoded = jwt.verify(token, SECRET);
        req.userId = decoded.id;
        req.role = decoded.role;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid token ❌" });
    }
}

// ================= ADD TO CART =================
router.post("/add", auth, async (req, res) => {
    try {

        if (req.role !== "user") {
            return res.status(403).json({ message: "Only users can buy ❌" });
        }

        const { productId } = req.body;

        if (!productId) {
            return res.status(400).json({ message: "Product ID missing ❌" });
        }

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ message: "Product not found ❌" });
        }

        let cart = await Cart.findOne({ userId: req.userId });

        if (!cart) {
            cart = new Cart({
                userId: req.userId,
                items: []
            });
        }

        const existing = cart.items.find(i => i.name === product.name);

        if (existing) {
            existing.quantity += 1;
        } else {
            cart.items.push({
                name: product.name,
                price: product.price,
                img: product.img,
                quantity: 1
            });
        }

        await cart.save();

        res.json({ message: "Added to cart 🛒" });

    } catch (err) {
        console.log("ADD ERROR:", err.message);
        res.status(500).json({ message: "Server error ❌" });
    }
});

// ================= GET CART =================
router.get("/", auth, async (req, res) => {
    try {

        if (req.role !== "user") {
            return res.status(403).json({ message: "Admin has no cart ❌" });
        }

        const cart = await Cart.findOne({ userId: req.userId });

        if (!cart) {
            return res.json({ items: [] });
        }

        // ✅ SEND CLEAN DATA ONLY
        res.json({
            items: cart.items
        });

    } catch (err) {
        console.log("GET ERROR:", err.message);
        res.status(500).json({ message: "Error ❌" });
    }
});

// ================= REMOVE ITEM =================
router.delete("/remove/:id", auth, async (req, res) => {
    try {

        const cart = await Cart.findOne({ userId: req.userId });

        if (!cart) {
            return res.status(404).json({ message: "Cart not found ❌" });
        }

        cart.items = cart.items.filter(item => item._id != req.params.id);

        await cart.save();

        res.json({ message: "Removed 🗑️" });

    } catch (err) {
        console.log("REMOVE ERROR:", err.message);
        res.status(500).json({ message: "Error ❌" });
    }
});

// ================= UPDATE QUANTITY =================
router.put("/update/:id", auth, async (req, res) => {
    try {

        const { action } = req.body;

        const cart = await Cart.findOne({ userId: req.userId });

        if (!cart) {
            return res.status(404).json({ message: "Cart not found ❌" });
        }

        // 🔥 FIX: use find instead of .id()
        const item = cart.items.find(i => i._id.toString() === req.params.id);

        if (!item) {
            return res.status(404).json({ message: "Item not found ❌" });
        }

        if (action === "inc") {
            item.quantity += 1;
        } else if (action === "dec") {
            item.quantity -= 1;

            if (item.quantity <= 0) {
                cart.items = cart.items.filter(i => i._id.toString() !== req.params.id);
            }
        }

        await cart.save();

        res.json({ message: "Updated ✅" });

    } catch (err) {
        console.log("UPDATE ERROR:", err.message);
        res.status(500).json({ message: "Error ❌" });
    }
});
module.exports = router;