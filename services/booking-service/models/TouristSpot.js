const mongoose = require("mongoose");

const TouristSpotSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    pricePerPerson: { type: Number, required: true },
    availableDates: { type: [Date], required: true },
    imageUrls: {
        type: [String],
        required: true,
        validate: {
            validator: function (value) {
                return value.length >= 1 && value.length <= 5;
            },
            message: "Max images uploaded is 5"
        }
    },
    reviews: [{ type: mongoose.Schema.Types.ObjectId, required: false }]
}, { timestamps: true });

module.exports = mongoose.model("TouristSpot", TouristSpotSchema);