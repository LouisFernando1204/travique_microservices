const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    idUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    idTouristSpot: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TouristSpot',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: false
    },
    photoUrl: {
        type: String,
        required: false
    }
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);
