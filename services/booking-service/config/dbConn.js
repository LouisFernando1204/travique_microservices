const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.NODE_ENV == "development" ? process.env.DATABASE_URI_LOCAL : process.env.DATABASE_URI_PROD);
    } catch (err) {
        console.log(err)
    }
};

module.exports = connectDB;