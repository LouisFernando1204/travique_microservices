const mongoose = require('mongoose');
require('dotenv').config();

let isDbConnected = false;

const connectDB = async () => {
    try {
        await mongoose.connect(
            process.env.NODE_ENV === "development"
                ? process.env.DATABASE_URI_LOCAL
                : process.env.DATABASE_URI_PROD,
            {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            }
        );
        console.log("✅ MongoDB connected");
        isDbConnected = true;

        // Tambahkan deteksi disconnect & reconnect
        mongoose.connection.on('disconnected', () => {
            console.warn("⚠️ MongoDB disconnected");
            isDbConnected = false;
        });

        mongoose.connection.on('reconnected', () => {
            console.log("✅ MongoDB reconnected");
            isDbConnected = true;
        });

    } catch (err) {
        console.error("❌ MongoDB connection failed:", err.message);
        isDbConnected = false;
    }
};

const getDbStatus = () => isDbConnected;

module.exports = { connectDB, getDbStatus };