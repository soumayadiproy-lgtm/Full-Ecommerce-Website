require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const connectDB = require("./config/db");

const productSchema = new mongoose.Schema({
    name: String,
    price: Number,
    type: String,
    category: String,
    img: String,
    reviews: []
});

const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    phone: String,
    role: String
});

const Product = mongoose.models.Product || mongoose.model("Product", productSchema);
const User = mongoose.models.User || mongoose.model("User", userSchema);

const { allProducts } = require("./data/productsData");

async function seed() {
    try {
        console.log("Connecting to MongoDB...");
        await connectDB();

        // Clear existing products and re-insert
        await Product.deleteMany({});
        console.log("Cleared old products");

        const seedData = allProducts.map(({ _id, ...rest }) => rest);
        await Product.insertMany(seedData);
        console.log(`Inserted ${seedData.length} products ✅`);

        // Check if admin user exists, if not create admin user
        const existingAdmin = await User.findOne({ email: "admin@soumyadip.com" });
        if (!existingAdmin) {
            const hashedPassword = await bcrypt.hash("admin123", 10);
            await User.create({
                email: "admin@soumyadip.com",
                password: hashedPassword,
                phone: "9876543210",
                role: "admin"
            });
            console.log("Created admin user (admin@soumyadip.com / admin123) ✅");
        } else {
            console.log("Admin user already exists ✅");
        }

        console.log("Database seeded successfully! 🎉");
        process.exit(0);
    } catch (err) {
        console.error("Database seed failed ❌:", err.message);
        process.exit(1);
    }
}

seed();
