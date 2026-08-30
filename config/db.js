const mongoose = require("mongoose");

// Disable Mongoose buffering to prevent 10,000ms timeout hangs when DB is connecting or disconnected
mongoose.set("bufferCommands", false);

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
            serverSelectionTimeoutMS: 3000,
            socketTimeoutMS: 15000,
            bufferCommands: false,
        };

        cached.promise = mongoose.connect(primaryUri, opts)
            .then((mongooseInstance) => {
                console.log("MongoDB Connected Successfully ✅");
                return mongooseInstance;
            })
            .catch(async (err) => {
                // If Atlas fails, attempt local fallback when running locally
                if (!process.env.VERCEL && process.env.NODE_ENV !== "production") {
                    const localUri = "mongodb://127.0.0.1:27017/ecommerce";
                    console.warn("⚠️ MongoDB Atlas connection failed. Attempting local MongoDB connection...");
                    try {
                        const localConn = await mongoose.connect(localUri, opts);
                        console.log("Connected to Local MongoDB ✅");
                        return localConn;
                    } catch (localErr) {
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
        throw error;
    }

    return cached.conn;
};

module.exports = connectDB;