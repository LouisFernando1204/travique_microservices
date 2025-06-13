const express = require("express");
const axios = require("axios");
const router = express.Router();
require("dotenv").config();

const BASE_URL = process.env.PAYMENT_SERVICE_URL || "http://nginx";

// === PAYMENT ROUTES ===

// POST /payments - Create a new payment
router.post("/payments", async (req, res) => {
  try {
    const response = await axios.post(`${BASE_URL}/payments`, req.body, {
      headers: { Authorization: req.headers.authorization },
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error("POST /payments error:", error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res
        .status(500)
        .json({ message: error.message || "Internal Server Error" });
    }
  }
});

// POST /payments/bank-transfer - Create bank transfer payment
router.post("/payments/bank-transfer", async (req, res) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/payments/bank-transfer`,
      req.body,
      {
        headers: { Authorization: req.headers.authorization },
      }
    );
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error("POST /payments/bank-transfer error:", error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res
        .status(500)
        .json({ message: error.message || "Internal Server Error" });
    }
  }
});

// POST /payments/notifications - Handle Midtrans notifications
router.post("/payments/notifications", async (req, res) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/payments/notifications`,
      req.body
    );
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error("POST /payments/notifications error:", error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res
        .status(500)
        .json({ message: error.message || "Internal Server Error" });
    }
  }
});

// GET /payments/:id - Get payment status
router.get("/payments/:id", async (req, res) => {
  try {
    const response = await axios.get(`${BASE_URL}/payments/${req.params.id}`, {
      headers: { Authorization: req.headers.authorization },
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error("GET /payments/:id error:", error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res
        .status(500)
        .json({ message: error.message || "Internal Server Error" });
    }
  }
});

// POST /payments/:id/cancel - Cancel payment
router.post("/payments/:id/cancel", async (req, res) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/payments/${req.params.id}/cancel`,
      req.body,
      {
        headers: { Authorization: req.headers.authorization },
      }
    );
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error("POST /payments/:id/cancel error:", error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res
        .status(500)
        .json({ message: error.message || "Internal Server Error" });
    }
  }
});

// GET /payments/user/me - Get user payments
router.get("/payments/user/me", async (req, res) => {
  try {
    const response = await axios.get(`${BASE_URL}/payments/user/me`, {
      headers: { Authorization: req.headers.authorization },
      params: req.query, // Forward query parameters (page, limit, status)
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error("GET /payments/user/me error:", error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res
        .status(500)
        .json({ message: error.message || "Internal Server Error" });
    }
  }
});

// GET /payments/booking/:bookingId - Get payments by booking
router.get("/payments/booking/:bookingId", async (req, res) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/payments/booking/${req.params.bookingId}`,
      {
        headers: { Authorization: req.headers.authorization },
      }
    );
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error("GET /payments/booking/:bookingId error:", error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res
        .status(500)
        .json({ message: error.message || "Internal Server Error" });
    }
  }
});

module.exports = router;