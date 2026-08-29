const express = require("express");
const router = express.Router();
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const { verifyToken } = require("../middleware/auth");

// ================= ADD TO CART =================
router.post("/add", verifyToken, async (req, res) => {
    try {
        const { productId, name, price, img } = req.body;

        let product = null;

        if (productId) {
            try {
                product = await Product.findById(productId);
            } catch (e) {
                // If ID is not valid ObjectId, attempt search by name
                product = await Product.findOne({ name: productId });
            }
        }

        if (!product && name) {
            product = { name, price: Number(price) || 0, img: img || "" };
        }

        if (!product) {
            return res.status(404).json({ message: "Product not found ❌" });
        }

        let cart = await Cart.findOne({ userId: String(req.userId) });

        if (!cart) {
            cart = new Cart({
                userId: String(req.userId),
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
                img: product.img || "",
                quantity: 1
            });
        }

        await cart.save();

        res.json({ message: "Added to cart 🛒", cart });

    } catch (err) {
        console.log("ADD ERROR:", err.message);
        res.status(500).json({ message: "Server error ❌" });
    }
});

// ================= GET CART =================
router.get("/", verifyToken, async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: String(req.userId) });

        if (!cart) {
            return res.json({ items: [] });
        }

        res.json({
            items: cart.items || []
        });

    } catch (err) {
        console.log("GET ERROR:", err.message);
        res.status(500).json({ message: "Error ❌" });
    }
});

// ================= REMOVE ITEM =================
router.delete("/remove/:id", verifyToken, async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: String(req.userId) });

        if (!cart) {
            return res.status(404).json({ message: "Cart not found ❌" });
        }

        cart.items = cart.items.filter(item => item._id.toString() !== req.params.id);

        await cart.save();

        res.json({ message: "Removed 🗑️", items: cart.items });

    } catch (err) {
        console.log("REMOVE ERROR:", err.message);
        res.status(500).json({ message: "Error ❌" });
    }
});

// ================= UPDATE QUANTITY =================
router.put("/update/:id", verifyToken, async (req, res) => {
    try {
        const { action } = req.body;

        const cart = await Cart.findOne({ userId: String(req.userId) });

        if (!cart) {
            return res.status(404).json({ message: "Cart not found ❌" });
        }

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

        res.json({ message: "Updated ✅", items: cart.items });

    } catch (err) {
        console.log("UPDATE ERROR:", err.message);
        res.status(500).json({ message: "Error ❌" });
    }
});

module.exports = router;