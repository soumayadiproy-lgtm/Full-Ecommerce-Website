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

// ✅ Serve Static Files from public directory
app.use(express.static(path.join(__dirname, "../public")));

// ✅ Explicit GET / handler
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

// ✅ Catch-all HTML page handler
app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api/")) return next();

    const requestPath = req.path.toLowerCase();
    let fileName = requestPath.replace(/^\//, "");
    if (!fileName) fileName = "index.html";
    if (!fileName.endsWith(".html") && !fileName.includes(".")) fileName += ".html";

    const targetFile = path.join(__dirname, "../public", fileName);

    res.sendFile(targetFile, (err) => {
        if (err) {
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
