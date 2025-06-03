const Review = require('../models/Review');
const { handleError } = require('../helper/handleError');

// Create Review
exports.createReview = async (req, res) => {
    try {
        const { idUser, idTouristSpot, rating, comment, photoUrl } = req.body;

        if (!idUser || !idTouristSpot || !rating) {
            return res.status(400).json({
                status: 'fail',
                message: 'idUser, idTouristSpot, dan rating wajib diisi.'
            });
        }

        const newReview = new Review({ idUser, idTouristSpot, rating, comment, photoUrl });
        const savedReview = await newReview.save();

        res.status(201).json({
            status: 'success',
            message: 'Review berhasil dibuat.',
            data: savedReview
        });
    } catch (err) {
        handleError(res, err, 'Terjadi kesalahan saat membuat review.');
    }
};

// Get Review By TouristSpot
exports.getReviewsByTouristSpot = async (req, res) => {
    try {
        const idTourist = req.params.idTourist;
        const reviews = await Review.find({ idTouristSpot: idTourist });

        res.status(200).json({
            status: 'success',
            message: 'Review berhasil diambil.',
            data: reviews
        });
    } catch (err) {
        handleError(res, err, 'Terjadi kesalahan saat membuat review.');
    }
};

// Delete Review by ID
exports.deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        await Review.findByIdAndDelete(id);

        res.status(200).json({
            status: 'success',
            message: 'Review berhasil dihapus.'
        });
    } catch (err) {
        handleError(res, err, 'Terjadi kesalahan saat membuat review.');
    }
};

// Update Review
exports.updateReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, comment, photoUrl } = req.body;

        const updatedReview = await Review.findByIdAndUpdate(
            id,
            { rating, comment, photoUrl },
            { new: true }
        );

        if (!updatedReview) {
            return res.status(404).json({
                status: 'fail',
                message: 'Review tidak ditemukan.'
            });
        }

        res.status(200).json({
            status: 'success',
            message: 'Review berhasil diperbarui.',
            data: updatedReview
        });
    } catch (err) {
        handleError(res, err, 'Terjadi kesalahan saat membuat review.');
    }
};
