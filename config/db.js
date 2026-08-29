const mongoose = require("mongoose");

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
    if (cached.conn && mongoose.connection.readyState === 1) {
        return cached.conn;
    }

    const uri = process.env.MONGODB_URI;

    if (!uri) {
        if (process.env.VERCEL) {
            throw new Error("MONGODB_URI is missing in Vercel Environment Variables. Please set MONGODB_URI in Vercel Project Settings.");
        }
    }

    const connectionString = uri || "mongodb://127.0.0.1:27017/ecommerce";

    if (!cached.promise) {
        const opts = {
            serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
        };

        cached.promise = mongoose.connect(connectionString, opts).then((mongoose) => {
            console.log("MongoDB Connected ✅");
            return mongoose;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (error) {
        cached.promise = null;
        console.error("MongoDB Connection Error ❌", error.message);
        throw error;
    }

    return cached.conn;
};

module.exports = connectDB;