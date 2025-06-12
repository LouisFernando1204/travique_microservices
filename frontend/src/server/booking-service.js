import axios from "axios";

const BOOKING_APIGATEWAY_URL = "http://localhost:3500/service/booking-service";

function handleError(error) {
    return {
        status: error.response?.status || 500,
        message: error.response?.data?.message || "Internal Server Error",
        detail: error.response?.data || null,
    };
}

// === BOOKING ROUTES ===
export async function getAllBookings(token) {
    try {
        const res = await axios.get(`${BOOKING_APIGATEWAY_URL}/bookings`, {
            headers: { Authorization: token },
        });
        return { status: res.status, data: res.data };
    } catch (error) {
        return handleError(error);
    }
}

export async function getBookingById(id, token) {
    try {
        const res = await axios.get(`${BOOKING_APIGATEWAY_URL}/bookings/${id}`, {
            headers: { Authorization: token },
        });
        return { status: res.status, data: res.data };
    } catch (error) {
        return handleError(error);
    }
}

export async function getBookingsByUserId(userId, token) {
    try {
        const res = await axios.get(`${BOOKING_APIGATEWAY_URL}/bookings/user/${userId}`, {
            headers: { Authorization: token },
        });
        return { status: res.status, data: res.data };
    } catch (error) {
        return handleError(error);
    }
}

export async function createBooking(bookingData, token) {
    try {
        const res = await axios.post(`${BOOKING_APIGATEWAY_URL}/bookings`, bookingData, {
            headers: { Authorization: token },
        });
        return { status: res.status, data: res.data };
    } catch (error) {
        return handleError(error);
    }
}

export async function updateBooking(id, updatedData, token) {
    try {
        const res = await axios.patch(`${BOOKING_APIGATEWAY_URL}/bookings/${id}`, updatedData, {
            headers: { Authorization: token },
        });
        return { status: res.status, data: res.data };
    } catch (error) {
        return handleError(error);
    }
}


// === TOURIST SPOT ROUTES ===
export async function getAllTouristSpots() {
    try {
        const res = await axios.get(`${BOOKING_APIGATEWAY_URL}/touristspots`);
        return { status: res.status, data: res.data };
    } catch (error) {
        return handleError(error);
    }
}

export async function getTouristSpotById(id) {
    try {
        const res = await axios.get(`${BOOKING_APIGATEWAY_URL}/touristspots/${id}`);
        return { status: res.status, data: res.data };
    } catch (error) {
        return handleError(error);
    }
}

export async function createTouristSpot(data) {
    try {
        const res = await axios.post(`${BOOKING_APIGATEWAY_URL}/touristspots`, data);
        return { status: res.status, data: res.data };
    } catch (error) {
        return handleError(error);
    }
}

export async function deleteTouristSpot(data) {
    try {
        const res = await axios.delete(`${BOOKING_APIGATEWAY_URL}/touristspots`, {
            data: data,
        });
        return { status: res.status, data: res.data };
    } catch (error) {
        return handleError(error);
    }
}

export async function addReviewToTouristSpot(id, reviewData) {
    try {
        const res = await axios.patch(
            `${BOOKING_APIGATEWAY_URL}/touristspots/${id}/add-review`,
            reviewData
        );
        return { status: res.status, data: res.data };
    } catch (error) {
        return handleError(error);
    }
}