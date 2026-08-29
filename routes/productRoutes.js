const express = require("express");
const router = express.Router();

const Product = require("../models/Product");
const User = require("../models/User"); // ✅ FIXED

// 🔐 AUTH
const { verifyToken, isAdmin } = require("../middleware/auth");


const fallbackProducts = [
    { _id: "f1", name: "Red Printed T-Shirt", price: 300, type: "clothes", category: "general", img: "/images/product-1.jpg" },
    { _id: "f2", name: "Black Tracksuit", price: 500, type: "clothes", category: "general", img: "/images/product-3.jpg" },
    { _id: "f3", name: "Yellow Party Dress", price: 3000, type: "clothes", category: "general", img: "/images/Unconfirmed 422693.crdownload" },
    { _id: "f4", name: "White Shorts Girls", price: 2500, type: "clothes", category: "general", img: "/images/71mF0DtTeaL._AC_UY1100_.jpg" },
    { _id: "f5", name: "Grey Running Shoe", price: 2000, type: "shoes", category: "general", img: "/images/product-5.jpg" },
    { _id: "f6", name: "Black Printed Handbag", price: 3000, type: "electronics", category: "general", img: "/images/Women_Handbag_apkamart_11_58d2de39-f8b4-43c2-b459-a9c07c006abf.webp" },
    { _id: "f7", name: "Blue Sneakers", price: 500, type: "shoes", category: "general", img: "/images/shoe-sneakers-footwear-54334.jpg" },
    { _id: "f8", name: "Men Casual Dress", price: 1000, type: "clothes", category: "general", img: "/images/product-4.jpg" },
    { _id: "f9", name: "Girls Party Shoes", price: 1500, type: "shoes", category: "general", img: "/images/OIP (4).jpg" },
    { _id: "f10", name: "Men Tracksuit", price: 700, type: "clothes", category: "general", img: "/images/product-12.jpg" },
    { _id: "f11", name: "Basmati Rice 5kg", price: 450, type: "rice", category: "grocery", img: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400" },
    { _id: "f12", name: "Fresh Milk 1L", price: 60, type: "dairy", category: "grocery", img: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400" },
    { _id: "f13", name: "Red Apples 1kg", price: 180, type: "fruits", category: "grocery", img: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400" }
];

// ✅ 1. GET PRODUCTS
router.get("/", async (req, res) => {
    try {
        const { type } = req.query;

        let filter = {};
        if (type) filter.type = type;

        let products = await Product.find(filter);

        if (!products || products.length === 0) {
            products = type ? fallbackProducts.filter(p => p.type === type) : fallbackProducts;
        }

        return res.json(products);
    } catch (err) {
        console.log("❌ ERROR:", err);
        const { type } = req.query;
        const products = type ? fallbackProducts.filter(p => p.type === type) : fallbackProducts;
        return res.json(products);
    }
});


// ✅ 2. ADD PRODUCT
router.post("/add-product", verifyToken, isAdmin, async (req, res) => {
    try {
        const { name, price, img, type } = req.body;

        if (!name || !price || !img || !type) {
            return res.json({ msg: "All fields required ❌" });
        }

        const product = new Product({ name, price, img, type });
        await product.save();

        res.json({ msg: "Product added ✅" });
    } catch (err) {
        console.log(err);
        res.json({ msg: "Error ❌" });
    }
});


// ✅ 3. ADD REVIEW
router.post("/add-review/:id", verifyToken, async (req, res) => {
    try {
        const { text, rating } = req.body;

        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: "Product not found ❌" });
        }

        product.reviews.push({
            text,
            rating,
            user: req.userId // ⚠️ keep consistent
        });

        await product.save();

        return res.json({ msg: "Review added ✅" });

    } catch (err) {
        console.log("❌ REVIEW ERROR:", err);
        return res.status(500).json({ error: err.message });
    }
});


// ✅ 4. DELETE PRODUCT
router.delete("/delete-product/:id", verifyToken, isAdmin, async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({ message: "Product not found ❌" });
        }

        return res.json({ msg: "Deleted ✅" });

    } catch (err) {
        console.log("❌ DELETE ERROR:", err);
        return res.status(500).json({ error: err.message });
    }
});


// ✅ 5. UPDATE PRODUCT
router.put("/update-product/:id", verifyToken, isAdmin, async (req, res) => {
    try {
        const updated = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        return res.json({ msg: "Updated ✅", product: updated });

    } catch (err) {
        console.log("❌ UPDATE ERROR:", err);
        return res.status(500).json({ error: err.message });
    }
});


// 💎 6. PREMIUM PRODUCTS
router.get("/premium-products", verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId);

        if (user.membership !== "premium_plus") {
            return res.status(403).json({ message: "Premium required ❌" });
        }

        const products = await Product.find({ premium: true });

        res.json(products);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Error ❌" });
    }
});


// 🚀 7. FAST DELIVERY (PREMIUM ONLY)
router.post("/fast-delivery", verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId);

        if (user.membership !== "premium_plus") {
            return res.status(403).json({ message: "Upgrade to Premium Plus 🚀" });
        }

        res.json({ message: "Fast delivery enabled 🚀" });

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Error ❌" });
    }
});

module.exports = router;