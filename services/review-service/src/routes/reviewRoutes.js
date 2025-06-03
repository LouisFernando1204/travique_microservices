const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');

// POST /api/reviews
router.post('/', reviewController.createReview);

// DELETE /api/reviews/:id
router.delete('/:id', reviewController.deleteReview);

// GET /reviews/:idTourist
router.get('/:idTourist', reviewController.getReviewsByTouristSpot);

// PATCH /reviews/:idTourist
router.patch('/:id', reviewController.updateReview);

module.exports = router;
