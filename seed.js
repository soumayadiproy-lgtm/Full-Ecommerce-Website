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
    // 👗 Fashion & General Products
    { name: "Red Printed T-Shirt", price: 300, type: "clothes", category: "general", stock: 50, img: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400" },
    { name: "Black Tracksuit", price: 500, type: "clothes", category: "general", stock: 50, img: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=400" },
    { name: "Yellow Party Dress", price: 3000, type: "clothes", category: "general", stock: 20, img: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400" },
    { name: "White Shorts Girls", price: 2500, type: "clothes", category: "general", stock: 30, img: "https://images.unsplash.com/photo-1591195853828-11db59a44f43?w=400" },
    { name: "Grey Running Shoe", price: 2000, type: "shoes", category: "general", stock: 40, img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400" },
    { name: "Black Printed Handbag", price: 3000, type: "electronics", category: "general", stock: 15, img: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400" },
    { name: "Blue Sneakers", price: 500, type: "shoes", category: "general", stock: 50, img: "https://images.unsplash.com/photo-1463100099107-aa0980c362e6?w=400" },
    { name: "Men Casual Outfit", price: 1000, type: "clothes", category: "general", stock: 35, img: "https://images.unsplash.com/photo-1516826957135-700dedea698c?w=400" },
    { name: "Girls Party Shoes", price: 1500, type: "shoes", category: "general", stock: 25, img: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400" },
    { name: "Men Tracksuit", price: 700, type: "clothes", category: "general", stock: 30, img: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=400" },
    { name: "Floral Summer Dress", price: 1200, type: "clothes", category: "general", stock: 45, img: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400" },
    { name: "Blue Denim Jacket", price: 2200, type: "clothes", category: "general", stock: 30, img: "https://images.unsplash.com/photo-1544441893-675973e31985?w=400" },
    { name: "Cotton Graphic Hoodie", price: 1400, type: "clothes", category: "general", stock: 40, img: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=400" },
    { name: "High-Waist Jeans", price: 1800, type: "clothes", category: "general", stock: 35, img: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400" },
    { name: "Leather Formal Shoes", price: 3200, type: "shoes", category: "general", stock: 25, img: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=400" },
    { name: "Athletic Sport Trainers", price: 2400, type: "shoes", category: "general", stock: 30, img: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=400" },
    { name: "Smart Fitness Watch", price: 2999, type: "electronics", category: "general", stock: 20, img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400" },
    { name: "Wireless Headphones", price: 4500, type: "electronics", category: "general", stock: 15, img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400" },
    { name: "Leather Backpack", price: 1999, type: "electronics", category: "general", stock: 25, img: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400" },
    { name: "Classic Sunglasses", price: 850, type: "clothes", category: "general", stock: 50, img: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400" },

    // 🥬 Grocery Products Across All 7 Categories
    { name: "Basmati Rice 5kg", price: 450, type: "rice", category: "grocery", stock: 40, img: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400" },
    { name: "Sona Masoori Rice 10kg", price: 650, type: "rice", category: "grocery", stock: 25, img: "https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=400" },
    { name: "Organic Brown Rice 2kg", price: 320, type: "rice", category: "grocery", stock: 35, img: "https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=400" },
    { name: "Fresh Organic Milk 1L", price: 60, type: "dairy", category: "grocery", stock: 50, img: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400" },
    { name: "Amul Butter 500g", price: 275, type: "dairy", category: "grocery", stock: 35, img: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400" },
    { name: "Fresh Cottage Cheese Paneer 200g", price: 95, type: "dairy", category: "grocery", stock: 40, img: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400" },
    { name: "Greek Yogurt 400g", price: 140, type: "dairy", category: "grocery", stock: 30, img: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400" },
    { name: "Fresh Red Apples 1kg", price: 180, type: "fruits", category: "grocery", stock: 30, img: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400" },
    { name: "Fresh Bananas 1 Dozen", price: 60, type: "fruits", category: "grocery", stock: 45, img: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400" },
    { name: "Sweet Oranges 1kg", price: 120, type: "fruits", category: "grocery", stock: 40, img: "https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=400" },
    { name: "Fresh Mangoes 1kg", price: 350, type: "fruits", category: "grocery", stock: 25, img: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=400" },
    { name: "Farm Fresh Tomatoes 1kg", price: 40, type: "vegetables", category: "grocery", stock: 60, img: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400" },
    { name: "Organic Potatoes 2kg", price: 70, type: "vegetables", category: "grocery", stock: 50, img: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400" },
    { name: "Fresh Spinach 250g", price: 30, type: "vegetables", category: "grocery", stock: 45, img: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400" },
    { name: "Fresh Carrots 1kg", price: 50, type: "vegetables", category: "grocery", stock: 50, img: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400" },
    { name: "Classic Potato Chips", price: 30, type: "snacks", category: "grocery", stock: 80, img: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400" },
    { name: "Crispy Bhujia Sev 400g", price: 110, type: "snacks", category: "grocery", stock: 40, img: "https://images.unsplash.com/photo-1621996346565-e3d5d6281274?w=400" },
    { name: "Roasted Salted Cashews 200g", price: 280, type: "snacks", category: "grocery", stock: 35, img: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400" },
    { name: "Orange Juice 1L", price: 120, type: "beverages", category: "grocery", stock: 30, img: "https://images.unsplash.com/photo-1613478223719-2ab802602423?w=400" },
    { name: "Organic Green Tea 25 Pack", price: 220, type: "beverages", category: "grocery", stock: 35, img: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=400" },
    { name: "Cold Pressed Coconut Water", price: 50, type: "beverages", category: "grocery", stock: 50, img: "https://images.unsplash.com/photo-1525385133512-2f3bdd039054?w=400" },
    { name: "Moisturizing Soap 125g", price: 65, type: "personal_care", category: "grocery", stock: 60, img: "https://images.unsplash.com/photo-1607006482602-76ca97ac8a2f?w=400" },
    { name: "Herbal Toothpaste 150g", price: 115, type: "personal_care", category: "grocery", stock: 50, img: "https://images.unsplash.com/photo-1559598467-f8b76c8155d0?w=400" },
    { name: "Aloe Vera Face Wash 150ml", price: 160, type: "personal_care", category: "grocery", stock: 40, img: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400" }
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
