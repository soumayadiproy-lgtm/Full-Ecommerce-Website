const express = require("express");
const router = express.Router();
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const { verifyToken } = require("../middleware/auth");

const memoryCarts = {};

function getMemoryCart(userId) {
    if (!memoryCarts[userId]) {
        memoryCarts[userId] = { userId: String(userId), items: [] };
    }
    return memoryCarts[userId];
}

// ================= ADD TO CART =================
router.post("/add", verifyToken, async (req, res) => {
    try {
        const { productId, name, price, img } = req.body;
        const userIdStr = String(req.userId);

        let product = null;
        if (productId) {
            try {
                product = await Product.findById(productId);
            } catch (e) {
                try {
                    product = await Product.findOne({ name: productId });
                } catch (err) {}
            }
        }

        if (!product && name) {
            try {
                product = await Product.findOne({ name: name });
            } catch (e) {}
            if (!product) {
                product = { name, price: Number(price) || 0, img: img || "", stock: 50 };
            }
        }

        if (!product) {
            return res.status(404).json({ message: "Product not found ❌" });
        }

        const availableStock = product.stock !== undefined ? product.stock : 50;
        if (availableStock <= 0) {
            return res.status(400).json({ message: "Product is out of stock ❌" });
        }

        let cart = null;
        try {
            cart = await Cart.findOne({ userId: userIdStr });
        } catch (e) {}

        if (!cart) {
            cart = getMemoryCart(userIdStr);
        }

        const existing = cart.items.find(i => 
            (i.productId && product._id && String(i.productId) === String(product._id)) || 
            i.name === product.name
        );

        if (existing) {
            if (existing.quantity + 1 > availableStock) {
                return res.status(400).json({ message: `Cannot add more than available stock (${availableStock}) ❌` });
            }
            existing.quantity += 1;
        } else {
            cart.items.push({
                _id: "c_" + Date.now() + "_" + Math.floor(Math.random()*1000),
                productId: product._id || null,
                name: product.name,
                price: product.price,
                img: product.img || "",
                quantity: 1
            });
        }

        try {
            if (cart.save) await cart.save();
        } catch (e) {}
        memoryCarts[userIdStr] = cart;

        return res.json({ message: "Added to cart 🛒", cart });

    } catch (err) {
        console.log("ADD ERROR:", err.message);
        return res.status(500).json({ message: "Server error ❌" });
    }
});

// ================= GET CART =================
router.get("/", verifyToken, async (req, res) => {
    try {
        const userIdStr = String(req.userId);
        let cart = null;
        try {
            cart = await Cart.findOne({ userId: userIdStr });
        } catch (e) {}

        if (!cart) {
            cart = getMemoryCart(userIdStr);
        }

        return res.json({
            items: cart.items || []
        });

    } catch (err) {
        console.log("GET ERROR:", err.message);
        const mem = getMemoryCart(String(req.userId));
        return res.json({ items: mem.items || [] });
    }
});

// ================= REMOVE ITEM =================
router.delete("/remove/:id", verifyToken, async (req, res) => {
    try {
        const userIdStr = String(req.userId);
        let cart = null;
        try {
            cart = await Cart.findOne({ userId: userIdStr });
        } catch (e) {}

        if (!cart) {
            cart = getMemoryCart(userIdStr);
        }

        cart.items = cart.items.filter(item => String(item._id) !== String(req.params.id));

        try {
            if (cart.save) await cart.save();
        } catch (e) {}
        memoryCarts[userIdStr] = cart;

        return res.json({ message: "Removed 🗑️", items: cart.items });

    } catch (err) {
        console.log("REMOVE ERROR:", err.message);
        return res.status(500).json({ message: "Error ❌" });
    }
});

// ================= UPDATE QUANTITY =================
router.put("/update/:id", verifyToken, async (req, res) => {
    try {
        const { action } = req.body;
        const userIdStr = String(req.userId);

        let cart = null;
        try {
            cart = await Cart.findOne({ userId: userIdStr });
        } catch (e) {}

        if (!cart) {
            cart = getMemoryCart(userIdStr);
        }

        const item = cart.items.find(i => String(i._id) === String(req.params.id));

        if (!item) {
            return res.status(404).json({ message: "Item not found ❌" });
        }

        let product = null;
        if (item.productId) {
            try { product = await Product.findById(item.productId); } catch(e){}
        }
        if (!product) {
            try { product = await Product.findOne({ name: item.name }); } catch(e){}
        }
        const availableStock = product && product.stock !== undefined ? product.stock : 50;

        if (action === "inc") {
            if (item.quantity + 1 > availableStock) {
                return res.status(400).json({ message: `Cannot exceed available stock (${availableStock}) ❌` });
            }
            item.quantity += 1;
        } else if (action === "dec") {
            if (item.quantity - 1 < 1) {
                return res.status(400).json({ message: "Quantity cannot be less than 1 ❌" });
            }
            item.quantity -= 1;
        }

        try {
            if (cart.save) await cart.save();
        } catch(e){}
        memoryCarts[userIdStr] = cart;

        return res.json({ message: "Updated ✅", items: cart.items });

    } catch (err) {
        console.log("UPDATE ERROR:", err.message);
        return res.status(500).json({ message: "Error ❌" });
    }
});

module.exports = router;