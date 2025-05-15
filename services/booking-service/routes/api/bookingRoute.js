const express = require('express');
const router = express.Router();
const bookingController = require('../../controllers/bookingController');

router.route('/')
    .get(bookingController.getAllBookings)          // GET /bookings
    .post(bookingController.createBooking);         // POST /bookings

router.route('/:id')
    .get(bookingController.getBookingById)          // GET /bookings/:id
    .patch(bookingController.updateBookingStatus);  // PATCH /bookings/:id

router.route('/user/:userId')
    .get(bookingController.getUserBookings);        // GET /bookings/user/:userId

module.exports = router;