require("dotenv").config();
const express = require("express");
const path = require("path");
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

// ✅ Serve Static Frontend Files from public directory
app.use(express.static(path.join(__dirname, "../public")));

// ✅ Serve Root index.html
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/index.html"));
});

// ✅ Health Check Route
app.get(["/api/test", "/test"], (req, res) => {
    res.json({
        status: "online",
        msg: "API WORKING ✅",
        time: new Date().toISOString()
    });
});

// ✅ Public Products Route (Works with DB or fallback data)
app.use(["/api/products", "/products"], productRoutes);

// ✅ DB Middleware (Awaited for Serverless write/auth operations)
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

// ✅ Fallback HTML handler for routes without .html extension (e.g., /contact -> public/contact.html)
app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api/")) return next();
    
    // Clean URL resolution
    const cleanPath = req.path.toLowerCase().replace(/\/$/, "");
    const possibleHtmlFile = path.join(__dirname, "../public", cleanPath + ".html");
    
    res.sendFile(possibleHtmlFile, (err) => {
        if (err) {
            // Default to index.html for SPA/frontend navigation
            res.sendFile(path.join(__dirname, "../public/index.html"));
        }
    });
});

// ✅ Global Error Handler
app.use((err, req, res, next) => {
    console.error("Server Error:", err);
    res.status(500).json({ error: err.message || "Internal Server Error" });
});

module.exports = app;
