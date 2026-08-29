require("dotenv").config();
const express = require("express");
const path = require("path");
const connectDB = require("./config/db");
const cors = require("cors");

const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const userRoutes = require("./routes/userRoutes");
const cartRoutes = require("./routes/cartRoutes");
const contactRoutes = require("./routes/contactRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Serve Static Files from public directory
app.use(express.static(path.join(__dirname, "public")));

// ✅ Explicit GET / handler
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ✅ Health check
app.get(["/api/test", "/test"], (req, res) => {
    res.json({ status: "online", msg: "API WORKING ✅" });
});

// ✅ DB
connectDB().catch(err => {
    console.error("⚠️ Initial MongoDB connection notice:", err.message);
});

// ✅ ROUTES
app.use(["/api/products", "/products"], productRoutes);
app.use(["/api/orders", "/orders"], orderRoutes);
app.use(["/api/users", "/users"], userRoutes);
app.use(["/api/cart", "/cart"], cartRoutes);
app.use(["/api/contact", "/contact"], contactRoutes);
app.use(["/api/payment", "/payment"], paymentRoutes);

// ✅ Fallback for /api root
app.use("/api", userRoutes);
app.use("/api", productRoutes);

// ✅ Catch-all HTML fallback
app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api/")) return next();

    const requestPath = req.path.toLowerCase();
    let fileName = requestPath.replace(/^\//, "");
    if (!fileName) fileName = "index.html";
    if (!fileName.endsWith(".html") && !fileName.includes(".")) fileName += ".html";

    const targetFile = path.join(__dirname, "public", fileName);
    res.sendFile(targetFile, (err) => {
        if (err) {
            res.sendFile(path.join(__dirname, "public", "index.html"));
        }
    });
});

// ✅ Listen locally when run directly (node server.js)
if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
    });
}

module.exports = app;