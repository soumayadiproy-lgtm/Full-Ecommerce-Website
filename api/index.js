require("dotenv").config();
const express = require("express");
const connectDB = require("../config/db");
const cors = require("cors");

const productRoutes = require("../routes/productRoutes");
const orderRoutes = require("../routes/orderRoutes");
const userRoutes = require("../routes/userRoutes");
const cartRoutes = require("../routes/cartRoutes");
const contactRoutes = require("../routes/contactRoutes");
const paymentRoutes = require("../routes/paymentRoutes");

const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Test Route
app.get(["/api/test", "/test"], (req, res) => {
    res.json({
        status: "online",
        msg: "API WORKING ✅",
        time: new Date().toISOString()
    });
});

// ✅ Public Products Route (Works with DB or fallback data)
app.use(["/api/products", "/products"], productRoutes);

// ✅ DB Middleware for authenticated/write operations
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (err) {
        console.error("DB Connection Error:", err.message);
        return res.status(500).json({
            error: "Database Connection Failed: " + err.message,
            hint: "Please ensure 0.0.0.0/0 is added in MongoDB Atlas -> Network Access"
        });
    }
});

// ✅ Auth & Write Routes
app.use(["/api/orders", "/orders"], orderRoutes);
app.use(["/api/users", "/users"], userRoutes);
app.use(["/api/cart", "/cart"], cartRoutes);
app.use(["/api/contact", "/contact"], contactRoutes);
app.use(["/api/payment", "/payment"], paymentRoutes);

// ✅ Direct root fallbacks for requests stripped of prefixes
app.use("/api", userRoutes);
app.use("/api", productRoutes);

// ✅ Global Error Handler
app.use((err, req, res, next) => {
    console.error("Server Error:", err);
    res.status(500).json({ error: err.message || "Internal Server Error" });
});

module.exports = app;
