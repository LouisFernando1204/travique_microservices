const Booking = require('../models/Booking');
const TouristSpot = require('../models/TouristSpot');
const asyncHandler = require('express-async-handler');

// @desc Get all bookings
// @route GET /bookings
// @access Public 
const getAllBookings = asyncHandler(async (req, res) => {
    const bookings = await Booking.find().lean();
    if (!bookings.length) {
        return res.status(404).json({ message: 'No bookings found' });
    }
    res.status(200).json(bookings);
});

// @desc Get booking by ID
// @route GET /bookings/:id
// @access Public
const getBookingById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: 'Booking ID required' });

    const booking = await Booking.findById(id).lean();
    if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
    }

    res.status(200).json(booking);
});

// @desc Get bookings for a user
// @route GET /bookings/user/:userId
// @access Public
const getUserBookings = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ message: 'User ID required' });

    const bookings = await Booking.find({ userId }).lean();
    if (!bookings.length) {
        return res.status(404).json({ message: 'No bookings found for this user' });
    }

    res.status(200).json(bookings);
});

// @desc Create new booking
// @route POST /bookings
// @access Public
const createBooking = asyncHandler(async (req, res) => {
    const { userId, touristSpotId, bookingDate, numberOfPeople } = req.body;

    if (!userId || !touristSpotId || !bookingDate || !numberOfPeople) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const spot = await TouristSpot.findById(touristSpotId).lean();
    if (!spot) return res.status(404).json({ message: 'Tourist spot not found' });

    const totalPrice = spot.pricePerPerson * numberOfPeople;

    const booking = await Booking.create({
        userId,
        touristSpotId,
        bookingDate,
        numberOfPeople,
        totalPrice
    });

    if (booking) {
        res.status(201).json({ message: 'New booking created', booking: booking });
    } else {
        res.status(400).json({ message: 'Error while creating booking' });
    }
});

// @desc Update booking status + paymentId
// @route PATCH /bookings/:id
// @access Public
const updateBookingStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, paymentId } = req.body;

    if (!id) return res.status(400).json({ message: 'Booking ID required' });

    const validStatuses = ['Pending', 'Confirmed', 'Cancelled'];
    if (status && !validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status value' });
    }

    const booking = await Booking.findById(id).exec();
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (status) booking.status = status;
    if (paymentId) booking.paymentId = paymentId;

    const updatedBooking = await booking.save();
    res.status(200).json({ message: 'Booking updated', booking: updatedBooking });
});

module.exports = {
    getAllBookings,
    getBookingById,
    getUserBookings,
    createBooking,
    updateBookingStatus
};