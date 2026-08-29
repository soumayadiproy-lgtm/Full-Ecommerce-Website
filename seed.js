const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const uri = "mongodb+srv://rsoumyadip651_db_user:zEb1TmxRoRFStIyG@cluster0.jgikzuy.mongodb.net/ecommerce?retryWrites=true&w=majority";

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
    {
        name: "Red Printed T-Shirt",
        price: 300,
        type: "clothes",
        category: "general",
        img: "/images/product-1.jpg"
    },
    {
        name: "Black Tracksuit",
        price: 500,
        type: "clothes",
        category: "general",
        img: "/images/product-3.jpg"
    },
    {
        name: "Yellow Party Dress",
        price: 3000,
        type: "clothes",
        category: "general",
        img: "/images/Unconfirmed 422693.crdownload"
    },
    {
        name: "White Shorts Girls",
        price: 2500,
        type: "clothes",
        category: "general",
        img: "/images/71mF0DtTeaL._AC_UY1100_.jpg"
    },
    {
        name: "Grey Running Shoe",
        price: 2000,
        type: "shoes",
        category: "general",
        img: "/images/product-5.jpg"
    },
    {
        name: "Black Printed Handbag",
        price: 3000,
        type: "electronics",
        category: "general",
        img: "/images/Women_Handbag_apkamart_11_58d2de39-f8b4-43c2-b459-a9c07c006abf.webp"
    },
    {
        name: "Blue Sneakers",
        price: 500,
        type: "shoes",
        category: "general",
        img: "/images/shoe-sneakers-footwear-54334.jpg"
    },
    {
        name: "Men Casual Dress",
        price: 1000,
        type: "clothes",
        category: "general",
        img: "/images/product-4.jpg"
    },
    {
        name: "Girls Party Shoes",
        price: 1500,
        type: "shoes",
        category: "general",
        img: "/images/OIP (4).jpg"
    },
    {
        name: "Men Tracksuit",
        price: 700,
        type: "clothes",
        category: "general",
        img: "/images/product-12.jpg"
    },
    // Grocery items
    {
        name: "Basmati Rice 5kg",
        price: 450,
        type: "rice",
        category: "grocery",
        img: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400"
    },
    {
        name: "Fresh Milk 1L",
        price: 60,
        type: "dairy",
        category: "grocery",
        img: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400"
    },
    {
        name: "Red Apples 1kg",
        price: 180,
        type: "fruits",
        category: "grocery",
        img: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400"
    },
    {
        name: "Fresh Bananas 1 Dozen",
        price: 60,
        type: "fruits",
        category: "grocery",
        img: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400"
    }
];

async function seed() {
    try {
        console.log("Connecting to MongoDB Atlas...");
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
        console.log("Connected to MongoDB Atlas ✅");

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
