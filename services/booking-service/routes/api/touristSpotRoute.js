const express = require('express');
const router = express.Router();
const touristSpotController = require('../../controllers/touristSpotController');

router.route('/')
    .get(touristSpotController.getAllTouristSpots)          // GET /touristspots
    .post(touristSpotController.createTouristSpot)          // POST /touristspots
    .delete(touristSpotController.deleteTouristSpot);       // DELETE /touristspots

router.route('/:id')
    .get(touristSpotController.getTouristSpotById);         // GET /touristspots/:id

router.route('/:id/add-review')
    .patch(touristSpotController.addReviewToTouristSpot);   // PATCH /touristspots/:id/add-review

module.exports = router;