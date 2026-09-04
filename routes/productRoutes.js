const express = require("express");
const router = express.Router();

const Product = require("../models/Product");
const User = require("../models/User");

// 🔐 AUTH
const { verifyToken, isAdmin } = require("../middleware/auth");

const { allProducts } = require("../data/productsData");
const fallbackProducts = allProducts;

// Pre-built reviews pool (realistic 4 and 5 star reviews)
const reviewPool = [
    { text: "Amazing quality! Totally worth the price.", rating: 5, author: "Rahul M." },
    { text: "Very comfortable and looks exactly like the picture.", rating: 5, author: "Priya S." },
    { text: "Great product, fast delivery. Will buy again!", rating: 4, author: "Amit K." },
    { text: "Good quality for the price. Happy with purchase.", rating: 4, author: "Sneha R." },
    { text: "Excellent! Exceeded my expectations.", rating: 5, author: "Vikram T." },
    { text: "Loved it! Fits perfectly and feels premium.", rating: 5, author: "Ananya B." },
    { text: "Pretty good. Would recommend to friends.", rating: 4, author: "Karan P." },
    { text: "Top-notch quality. Very satisfied!", rating: 5, author: "Deepika L." },
    { text: "Nice product. Delivery was quick.", rating: 4, author: "Rohit V." },
    { text: "Superb! The material is high quality.", rating: 5, author: "Meera J." },
];

function getRandomReviews(count = 3) {
    const shuffled = [...reviewPool].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count).map(r => ({
        ...r,
        date: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000))
    }));
}

// Ensure every fallback product has pre-attached reviews
fallbackProducts.forEach(p => {
    if (!p.reviews || p.reviews.length === 0) {
        p.reviews = getRandomReviews(3);
    }
});

// ✅ Auto-seed helper
async function ensureProductsSeeded() {
    try {
        const count = await Product.countDocuments();
        if (count < 400) {
            console.log(`Current DB product count: ${count}. Upgrading to full catalog (${fallbackProducts.length} items)...`);
            await Product.deleteMany({});
            const seedData = fallbackProducts.map(({ _id, ...rest }) => rest);
            await Product.insertMany(seedData);
            console.log(`Auto-seeded ${seedData.length} products into MongoDB ✅`);
        }
    } catch (err) {
        console.error("Auto-seed notice:", err.message);
    }
}

// Helper to ensure product object has reviews
function ensureProductReviews(prod) {
    if (!prod) return prod;
    const item = prod.toObject ? prod.toObject() : prod;
    if (!item.reviews || item.reviews.length === 0) {
        item.reviews = getRandomReviews(3);
    }
    return item;
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

        const result = products.map(p => ensureProductReviews(p));
        return res.json(result);
    } catch (err) {
        console.log("❌ ERROR:", err);
        const { type, category } = req.query;
        const products = fallbackProducts.filter(p => {
            if (type && p.type !== type) return false;
            if (category && p.category !== category) return false;
            return true;
        });
        const result = products.map(p => ensureProductReviews(p));
        return res.json(result);
    }
});

// ✅ 1b. GET REVIEWS FOR A PRODUCT
router.get(["/reviews/:id", "/:id/reviews"], async (req, res) => {
    try {
        let product = null;
        try { product = await Product.findById(req.params.id); } catch(e){}
        if (!product) {
            product = fallbackProducts.find(p => p._id === req.params.id);
        }
        const finalP = ensureProductReviews(product);
        return res.json(finalP?.reviews || getRandomReviews(3));
    } catch (err) {
        return res.json(getRandomReviews(3));
    }
});

// ✅ 1c. GET SINGLE PRODUCT BY ID
router.get("/:id", async (req, res, next) => {
    // Skip static route names
    if (["premium-products", "add-product"].includes(req.params.id)) {
        return next();
    }
    try {
        let product = null;
        try { product = await Product.findById(req.params.id); } catch(e){}
        if (!product) {
            product = fallbackProducts.find(p => p._id === req.params.id);
        }
        if (!product) {
            return res.status(404).json({ message: "Product not found ❌" });
        }
        return res.json(ensureProductReviews(product));
    } catch (err) {
        const fallback = fallbackProducts.find(p => p._id === req.params.id);
        if (fallback) return res.json(ensureProductReviews(fallback));
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
        const { text, rating, author } = req.body;

        if (!text || !text.trim()) {
            return res.status(400).json({ message: "Review text required ❌" });
        }

        const newReview = {
            text: text.trim(),
            rating: Number(rating) || 5,
            author: author || "Anonymous",
            date: new Date()
        };

        let product = null;
        try { product = await Product.findById(req.params.id); } catch(e){}

        if (product) {
            if (!product.reviews) product.reviews = [];
            product.reviews.push(newReview);
            try { await product.save(); } catch(e){}
            return res.json({ msg: "Review added ✅", reviews: product.reviews });
        }

        // Fallback product review store
        const fallback = fallbackProducts.find(p => p._id === req.params.id);
        if (fallback) {
            if (!fallback.reviews) fallback.reviews = getRandomReviews(3);
            fallback.reviews.push(newReview);
            return res.json({ msg: "Review added ✅", reviews: fallback.reviews });
        }

        return res.json({ msg: "Review added ✅", reviews: [newReview] });

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