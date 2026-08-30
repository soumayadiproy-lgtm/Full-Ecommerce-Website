const express = require("express");
const router = express.Router();

const Product = require("../models/Product");
const User = require("../models/User"); // ✅ FIXED

// 🔐 AUTH
const { verifyToken, isAdmin } = require("../middleware/auth");


const fallbackProducts = [
    { _id: "f1", name: "Red Printed T-Shirt", price: 300, type: "clothes", category: "general", stock: 50, img: "/images/product-1.jpg" },
    { _id: "f2", name: "Black Tracksuit", price: 500, type: "clothes", category: "general", stock: 50, img: "/images/product-3.jpg" },
    { _id: "f3", name: "Yellow Party Dress", price: 3000, type: "clothes", category: "general", stock: 20, img: "/images/Unconfirmed 422693.crdownload" },
    { _id: "f4", name: "White Shorts Girls", price: 2500, type: "clothes", category: "general", stock: 30, img: "/images/71mF0DtTeaL._AC_UY1100_.jpg" },
    { _id: "f5", name: "Grey Running Shoe", price: 2000, type: "shoes", category: "general", stock: 40, img: "/images/product-5.jpg" },
    { _id: "f6", name: "Black Printed Handbag", price: 3000, type: "electronics", category: "general", stock: 15, img: "/images/Women_Handbag_apkamart_11_58d2de39-f8b4-43c2-b459-a9c07c006abf.webp" },
    { _id: "f7", name: "Blue Sneakers", price: 500, type: "shoes", category: "general", stock: 50, img: "/images/shoe-sneakers-footwear-54334.jpg" },
    { _id: "f8", name: "Men Casual Dress", price: 1000, type: "clothes", category: "general", stock: 35, img: "/images/product-4.jpg" },
    { _id: "f9", name: "Girls Party Shoes", price: 1500, type: "shoes", category: "general", stock: 25, img: "/images/OIP (4).jpg" },
    { _id: "f10", name: "Men Tracksuit", price: 700, type: "clothes", category: "general", stock: 30, img: "/images/product-12.jpg" },
    // 🥬 Grocery Products Across All 7 Categories
    { _id: "f11", name: "Basmati Rice 5kg", price: 450, type: "rice", category: "grocery", stock: 40, img: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400" },
    { _id: "f12", name: "Sona Masoori Rice 10kg", price: 650, type: "rice", category: "grocery", stock: 25, img: "https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=400" },
    { _id: "f13", name: "Fresh Organic Milk 1L", price: 60, type: "dairy", category: "grocery", stock: 50, img: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400" },
    { _id: "f14", name: "Amul Butter 500g", price: 275, type: "dairy", category: "grocery", stock: 35, img: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400" },
    { _id: "f15", name: "Fresh Red Apples 1kg", price: 180, type: "fruits", category: "grocery", stock: 30, img: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400" },
    { _id: "f16", name: "Fresh Bananas 1 Dozen", price: 60, type: "fruits", category: "grocery", stock: 45, img: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400" },
    { _id: "f17", name: "Farm Fresh Tomatoes 1kg", price: 40, type: "vegetables", category: "grocery", stock: 60, img: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400" },
    { _id: "f18", name: "Organic Potatoes 2kg", price: 70, type: "vegetables", category: "grocery", stock: 50, img: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400" },
    { _id: "f19", name: "Classic Potato Chips", price: 30, type: "snacks", category: "grocery", stock: 80, img: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400" },
    { _id: "f20", name: "Crispy Bhujia Sev 400g", price: 110, type: "snacks", category: "grocery", stock: 40, img: "https://images.unsplash.com/photo-1621996346565-e3d5d6281274?w=400" },
    { _id: "f21", name: "Orange Juice 1L", price: 120, type: "beverages", category: "grocery", stock: 30, img: "https://images.unsplash.com/photo-1613478223719-2ab802602423?w=400" },
    { _id: "f22", name: "Organic Green Tea 25 Pack", price: 220, type: "beverages", category: "grocery", stock: 35, img: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=400" },
    { _id: "f23", name: "Moisturizing Soap 125g", price: 65, type: "personal_care", category: "grocery", stock: 60, img: "https://images.unsplash.com/photo-1607006482602-76ca97ac8a2f?w=400" },
    { _id: "f24", name: "Herbal Toothpaste 150g", price: 115, type: "personal_care", category: "grocery", stock: 50, img: "https://images.unsplash.com/photo-1559598467-f8b76c8155d0?w=400" }
];

// ✅ Auto-seed helper
async function ensureProductsSeeded() {
    try {
        const count = await Product.countDocuments();
        if (count === 0) {
            const seedData = fallbackProducts.map(({ _id, ...rest }) => rest);
            await Product.insertMany(seedData);
            console.log("Auto-seeded products into MongoDB ✅");
        }
    } catch (err) {
        console.error("Auto-seed notice:", err.message);
    }
}

// ✅ 1. GET PRODUCTS
router.get("/", async (req, res) => {
    try {
        await ensureProductsSeeded();
        const { type, category } = req.query;

        let filter = {};
        if (type) filter.type = type;
        if (category) filter.category = category;

        let products = await Product.find(filter);

        if (!products || products.length === 0) {
            products = fallbackProducts.filter(p => {
                if (type && p.type !== type) return false;
                if (category && p.category !== category) return false;
                return true;
            });
        }

        return res.json(products);
    } catch (err) {
        console.log("❌ ERROR:", err);
        const { type, category } = req.query;
        const products = fallbackProducts.filter(p => {
            if (type && p.type !== type) return false;
            if (category && p.category !== category) return false;
            return true;
        });
        return res.json(products);
    }
});

// ✅ 1b. GET REVIEWS FOR A PRODUCT
router.get(["/reviews/:id", "/:id/reviews", "/:id"], async (req, res, next) => {
    if (req.baseUrl.includes("reviews") || req.path.startsWith("/reviews")) {
        try {
            const product = await Product.findById(req.params.id);
            if (!product) {
                return res.json([]);
            }
            return res.json(product.reviews || []);
        } catch (err) {
            return res.json([]);
        }
    }
    next();
});

// ✅ 1c. GET SINGLE PRODUCT BY ID
router.get("/:id", async (req, res, next) => {
    // Skip static route names
    if (["premium-products", "add-product"].includes(req.params.id)) {
        return next();
    }
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            const fallback = fallbackProducts.find(p => p._id === req.params.id);
            if (fallback) return res.json(fallback);
            return res.status(404).json({ message: "Product not found ❌" });
        }
        return res.json(product);
    } catch (err) {
        const fallback = fallbackProducts.find(p => p._id === req.params.id);
        if (fallback) return res.json(fallback);
        return res.status(404).json({ message: "Product not found ❌" });
    }
});

// ✅ 2. ADD PRODUCT
router.post("/add-product", verifyToken, isAdmin, async (req, res) => {
    try {
        const { name, price, img, type } = req.body;

        if (!name || !price || !img || !type) {
            return res.status(400).json({ msg: "All fields required ❌" });
        }

        const product = new Product({ name, price, img, type });
        await product.save();

        res.json({ msg: "Product added ✅", product });
    } catch (err) {
        console.log(err);
        res.status(500).json({ msg: "Error ❌" });
    }
});


// ✅ 3. ADD REVIEW
router.post("/add-review/:id", async (req, res) => {
    try {
        const { text, rating } = req.body;

        if (!text || !text.trim()) {
            return res.status(400).json({ message: "Review text required ❌" });
        }

        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: "Product not found ❌" });
        }

        // Optional user token extraction
        let userId = null;
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith("Bearer ")) {
            try {
                const token = authHeader.split(" ")[1];
                const SECRET = process.env.JWT_SECRET || "secretkey";
                const jwt = require("jsonwebtoken");
                const decoded = jwt.verify(token, SECRET);
                userId = decoded.id || decoded._id;
            } catch (e) {}
        }

        product.reviews.push({
            text,
            rating: Number(rating) || 5,
            user: userId,
            date: new Date()
        });

        await product.save();

        return res.json({ msg: "Review added ✅", reviews: product.reviews });

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

        if (!user || user.membership !== "premium_plus") {
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

        if (!user || user.membership !== "premium_plus") {
            return res.status(403).json({ message: "Upgrade to Premium Plus 🚀" });
        }

        res.json({ message: "Fast delivery enabled 🚀" });

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Error ❌" });
    }
});

module.exports = router;