const express = require("express");
const connectDB = require("./config/db");

// ROUTES
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

// ✅ Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Static files (frontend)
app.use(express.static("public"));
app.use(express.static("images"));

// ✅ Connect MongoDB
connectDB();

// ✅ Routes
app.use("/api", productRoutes);
app.use("/api", orderRoutes);
app.use("/api", userRoutes);

// ✅ Default route (optional)
app.get("/", (req, res) => {
    res.send("Server is running 🚀");
});

// ✅ Start server
app.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});