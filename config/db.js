const mongoose = require("mongoose");

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
    if (cached.conn) {
        console.log("MongoDB Using Cached Connection ✅");
        return cached.conn;
    }

    if (!cached.promise) {
        const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/ecommerce";

        cached.promise = mongoose.connect(uri).then((mongoose) => {
            console.log("MongoDB Connected ✅");
            return mongoose;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (error) {
        cached.promise = null;
        console.error("MongoDB Error ❌", error);
        throw error;
    }

    return cached.conn;
};

module.exports = connectDB;