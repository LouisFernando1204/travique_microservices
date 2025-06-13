import axios from "axios";

const REVIEW_APIGATEWAY_URL = "http://localhost:3500/service/review-service";

function handleError(error) {
    return {
        status: error.response?.status || 500,
        message: error.response?.data?.message || "Internal Server Error",
        detail: error.response?.data || null,
    };
}

// === REVIEW ROUTES ===

// Get Reviews by Tourist Spot
export async function getReviewsByTouristSpot(idTourist) {
    try {
        const res = await axios.get(`${REVIEW_APIGATEWAY_URL}/reviews/${idTourist}`);
        return { status: res.status, data: res.data };
    } catch (error) {
        return handleError(error);
    }
}

// Create Review
export async function createReview(reviewData) {
    try {
        const res = await axios.post(`${REVIEW_APIGATEWAY_URL}/reviews`, reviewData);
        return { status: res.status, data: res.data };
        console.log("asdf")
    } catch (error) {
        return handleError(error);
    }
}

// Update Review
export async function updateReview(id, reviewData) {
    try {
        const res = await axios.patch(`${REVIEW_APIGATEWAY_URL}/reviews/${id}`, reviewData);
        return { status: res.status, data: res.data };
    } catch (error) {
        return handleError(error);
    }
}

// Delete Review
export async function deleteReview(id) {
    try {
        const res = await axios.delete(`${REVIEW_APIGATEWAY_URL}/reviews/${id}`);
        return { status: res.status, data: res.data };
    } catch (error) {
        return handleError(error);
    }
}