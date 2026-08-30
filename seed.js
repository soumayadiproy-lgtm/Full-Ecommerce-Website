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

const sampleProducts = [
    { name: "Red Printed T-Shirt", price: 300, type: "clothes", category: "general", stock: 50, img: "/images/product-1.jpg" },
    { name: "Black Tracksuit", price: 500, type: "clothes", category: "general", stock: 50, img: "/images/product-3.jpg" },
    { name: "Yellow Party Dress", price: 3000, type: "clothes", category: "general", stock: 20, img: "/images/Unconfirmed 422693.crdownload" },
    { name: "White Shorts Girls", price: 2500, type: "clothes", category: "general", stock: 30, img: "/images/71mF0DtTeaL._AC_UY1100_.jpg" },
    { name: "Grey Running Shoe", price: 2000, type: "shoes", category: "general", stock: 40, img: "/images/product-5.jpg" },
    { name: "Black Printed Handbag", price: 3000, type: "electronics", category: "general", stock: 15, img: "/images/Women_Handbag_apkamart_11_58d2de39-f8b4-43c2-b459-a9c07c006abf.webp" },
    { name: "Blue Sneakers", price: 500, type: "shoes", category: "general", stock: 50, img: "/images/shoe-sneakers-footwear-54334.jpg" },
    { name: "Men Casual Dress", price: 1000, type: "clothes", category: "general", stock: 35, img: "/images/product-4.jpg" },
    { name: "Girls Party Shoes", price: 1500, type: "shoes", category: "general", stock: 25, img: "/images/OIP (4).jpg" },
    { name: "Men Tracksuit", price: 700, type: "clothes", category: "general", stock: 30, img: "/images/product-12.jpg" },
    // 🥬 Grocery Products Across All 7 Categories
    { name: "Basmati Rice 5kg", price: 450, type: "rice", category: "grocery", stock: 40, img: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400" },
    { name: "Sona Masoori Rice 10kg", price: 650, type: "rice", category: "grocery", stock: 25, img: "https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=400" },
    { name: "Fresh Organic Milk 1L", price: 60, type: "dairy", category: "grocery", stock: 50, img: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400" },
    { name: "Amul Butter 500g", price: 275, type: "dairy", category: "grocery", stock: 35, img: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400" },
    { name: "Fresh Red Apples 1kg", price: 180, type: "fruits", category: "grocery", stock: 30, img: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400" },
    { name: "Fresh Bananas 1 Dozen", price: 60, type: "fruits", category: "grocery", stock: 45, img: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400" },
    { name: "Farm Fresh Tomatoes 1kg", price: 40, type: "vegetables", category: "grocery", stock: 60, img: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400" },
    { name: "Organic Potatoes 2kg", price: 70, type: "vegetables", category: "grocery", stock: 50, img: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400" },
    { name: "Classic Potato Chips", price: 30, type: "snacks", category: "grocery", stock: 80, img: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400" },
    { name: "Crispy Bhujia Sev 400g", price: 110, type: "snacks", category: "grocery", stock: 40, img: "https://images.unsplash.com/photo-1621996346565-e3d5d6281274?w=400" },
    { name: "Orange Juice 1L", price: 120, type: "beverages", category: "grocery", stock: 30, img: "https://images.unsplash.com/photo-1613478223719-2ab802602423?w=400" },
    { name: "Organic Green Tea 25 Pack", price: 220, type: "beverages", category: "grocery", stock: 35, img: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=400" },
    { name: "Moisturizing Soap 125g", price: 65, type: "personal_care", category: "grocery", stock: 60, img: "https://images.unsplash.com/photo-1607006482602-76ca97ac8a2f?w=400" },
    { name: "Herbal Toothpaste 150g", price: 115, type: "personal_care", category: "grocery", stock: 50, img: "https://images.unsplash.com/photo-1559598467-f8b76c8155d0?w=400" }
];

async function seed() {
    try {
        console.log("Connecting to MongoDB...");
        await connectDB();

        // Clear existing products and re-insert
        await Product.deleteMany({});
        console.log("Cleared old products");

        await Product.insertMany(sampleProducts);
        console.log(`Inserted ${sampleProducts.length} sample products ✅`);

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
