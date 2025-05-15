const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true }, 
    touristSpotId: { type: mongoose.Schema.Types.ObjectId, ref: "TouristSpot", required: true },
    bookingDate: { type: Date, required: true },
    numberOfPeople: { type: Number, required: true, min: 1 },
    totalPrice: { type: Number, required: true },
    paymentId: { type: mongoose.Schema.Types.ObjectId, required: false },  
    status: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Cancelled'],
        default: 'Pending'
    }
}, { timestamps: true });

module.exports = mongoose.model("Booking", BookingSchema);