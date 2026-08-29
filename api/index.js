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

// ✅ DB
connectDB();

// ✅ Routes
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/payment", paymentRoutes);

// ✅ Test
app.get("/api/test", (req, res) => {
    res.json({ msg: "API WORKING" });
});

module.exports = app;
