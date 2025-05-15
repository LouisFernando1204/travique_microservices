const TouristSpot = require('../models/TouristSpot');
const asyncHandler = require('express-async-handler');

// @desc Get all tourist spots
// @route GET /touristspots
// @access Public
const getAllTouristSpots = asyncHandler(async (req, res) => {
    const spots = await TouristSpot.find().lean();
    if (!spots.length) {
        return res.status(404).json({ message: 'No tourist spots found' });
    }
    res.status(200).json(spots);
});

// @desc Get tourist spot by ID
// @route GET /touristspots/:id
// @access Public
const getTouristSpotById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: 'Tourist Spot ID required' });

    const spot = await TouristSpot.findById(id).lean();
    if (!spot) {
        return res.status(404).json({ message: 'Tourist spot not found' });
    }

    res.status(200).json(spot);
});

// @desc Create new tourist spot
// @route POST /touristspots
// @access Public (bisa diubah ke admin only nanti)
const createTouristSpot = asyncHandler(async (req, res) => {
    const { name, description, location, pricePerPerson, availableDates, imageUrls } = req.body;

    if (!name || !description || !location || !pricePerPerson || !availableDates || !imageUrls) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const spot = await TouristSpot.create({ name, description, location, pricePerPerson, availableDates, imageUrls });
    if (spot) {
        res.status(201).json({ message: 'New tourist spot created', touristSpot: spot });
    } else {
        res.status(400).json({ message: 'Error while creating tourist spot' });
    }
});

// @desc Delete tourist spot
// @route DELETE /touristspots
// @access Public (bisa diubah ke admin only nanti)
const deleteTouristSpot = asyncHandler(async (req, res) => {
    const { id } = req.body;

    if (!id) return res.status(400).json({ message: 'Tourist Spot ID required' });

    const spot = await TouristSpot.findById(id).exec();
    if (!spot) return res.status(404).json({ message: 'Tourist spot not found' });

    const deletedSpot = await spot.deleteOne();
    if (deletedSpot) {
        res.status(200).json({ message: `Tourist spot '${spot.name}' deleted` });
    } else {
        res.status(400).json({ message: 'Error while deleting tourist spot' });
    }
});

// @desc Add review ID to tourist spot
// @route PATCH /touristspots/:id/add-review
// @access Public
const addReviewToTouristSpot = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { reviewId } = req.body;

    if (!id || !reviewId) {
        return res.status(400).json({ message: 'TouristSpot ID and reviewId are required' });
    }

    const spot = await TouristSpot.findById(id).exec();
    if (!spot) return res.status(404).json({ message: 'Tourist spot not found' });

    spot.reviews.push(reviewId);
    const updatedSpot = await spot.save();

    res.status(200).json({ message: 'Review added to tourist spot', touristSpot: updatedSpot });
});

module.exports = {
    getAllTouristSpots,
    getTouristSpotById,
    createTouristSpot,
    deleteTouristSpot,
    addReviewToTouristSpot
};