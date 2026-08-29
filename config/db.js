const mongoose = require("mongoose");

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
    if (cached.conn && mongoose.connection.readyState === 1) {
        return cached.conn;
    }

    const uri = process.env.MONGODB_URI || "mongodb+srv://rsoumyadip651_db_user:zEb1TmxRoRFStIyG@cluster0.jgikzuy.mongodb.net/ecommerce?retryWrites=true&w=majority";

    if (!cached.promise) {
        const opts = {
            serverSelectionTimeoutMS: 5000, // Timeout after 5s
        };

        cached.promise = mongoose.connect(uri, opts).then((mongoose) => {
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