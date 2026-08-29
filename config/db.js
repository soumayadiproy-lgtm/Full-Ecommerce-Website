const mongoose = require("mongoose");

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

const DEFAULT_URI = "mongodb+srv://soumya67:soma67%40@cluster0.jgikzuy.mongodb.net/ecommerce?retryWrites=true&w=majority";

const connectDB = async () => {
    if (cached.conn && mongoose.connection.readyState === 1) {
        return cached.conn;
    }

    if (mongoose.connection.readyState !== 1) {
        cached.conn = null;
        cached.promise = null;
    }

    const primaryUri = process.env.MONGODB_URI || DEFAULT_URI;

    if (!cached.promise) {
        const opts = {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
        };

        cached.promise = mongoose.connect(primaryUri, opts)
            .then((mongooseInstance) => {
                console.log("MongoDB Connected Successfully ✅");
                return mongooseInstance;
            })
            .catch(async (err) => {
                // If Atlas fails, attempt local fallback if not explicitly using custom env URI
                if (!process.env.MONGODB_URI) {
                    const localUri = "mongodb://127.0.0.1:27017/ecommerce";
                    console.warn("⚠️ MongoDB Atlas connection failed. Attempting local MongoDB connection...");
                    try {
                        const localConn = await mongoose.connect(localUri, opts);
                        console.log("Connected to Local MongoDB ✅");
                        return localConn;
                    } catch (localErr) {
                        // Local also failed, rethrow primary error
                        throw err;
                    }
                }
                throw err;
            });
    }

    try {
        cached.conn = await cached.promise;
    } catch (error) {
        cached.promise = null;
        console.error("❌ MongoDB Connection Error:", error.message);

        if (error.message.includes("SSL") || error.message.includes("TLSV1") || error.message.includes("whitelisted") || error.name === "MongoNetworkError") {
            console.error("------------------------------------------------------------------");
            console.error("📌 TROUBLESHOOTING MONGODB ATLAS CONNECTION:");
            console.error("1. IP Whitelist: Ensure your IP (or 0.0.0.0/0 for all) is added in:");
            console.error("   MongoDB Atlas -> Network Access -> Add IP Address");
            console.error("2. Cluster State: Ensure your cluster in MongoDB Atlas is active (not paused).");
            console.error("3. Credentials: Check db user & password in .env or config/db.js");
            console.error("------------------------------------------------------------------");
        }
        throw error;
    }

    return cached.conn;
};

module.exports = connectDB;