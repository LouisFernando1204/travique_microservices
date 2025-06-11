const express = require("express");
const axios = require("axios");
const router = express.Router();
require("dotenv").config();

const BASE_URL = process.env.BOOKING_SERVICE_URL || "http://nginx";

// === BOOKING ROUTES ===
// GET /bookings
router.get("/bookings", async (req, res) => {
  try {
    const response = await axios.get(`${BASE_URL}/bookings`, {
      headers: { Authorization: req.headers.authorization },
    });
    res.json(response.data);
  } catch (error) {
    console.error("GET /bookings error:", error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res
        .status(500)
        .json({ message: error.message || "Internal Server Error" });
    }
  }
});

// GET /bookings/:id
router.get("/bookings/:id", async (req, res) => {
  try {
    const response = await axios.get(`${BASE_URL}/bookings/${req.params.id}`, {
      headers: { Authorization: req.headers.authorization },
    });
    res.json(response.data);
  } catch (error) {
    console.error("GET /bookings/:id error:", error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res
        .status(500)
        .json({ message: error.message || "Internal Server Error" });
    }
  }
});

// GET /bookings/user/:userId
router.get("/bookings/user/:userId", async (req, res) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/bookings/user/${req.params.userId}`,
      {
        headers: { Authorization: req.headers.authorization },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error("GET /bookings/user/:userId error:", error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res
        .status(500)
        .json({ message: error.message || "Internal Server Error" });
    }
  }
});

// POST /bookings
router.post("/bookings", async (req, res) => {
  try {
    const response = await axios.post(`${BASE_URL}/bookings`, req.body, {
      headers: { Authorization: req.headers.authorization },
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error("POST /bookings error:", error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res
        .status(500)
        .json({ message: error.message || "Internal Server Error" });
    }
  }
});

// PATCH /bookings/:id
router.patch("/bookings/:id", async (req, res) => {
  try {
    const response = await axios.patch(
      `${BASE_URL}/bookings/${req.params.id}`,
      req.body,
      {
        headers: { Authorization: req.headers.authorization },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error("PATCH /bookings/:id error:", error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res
        .status(500)
        .json({ message: error.message || "Internal Server Error" });
    }
  }
});

// === TOURIST SPOT ROUTES ===
// GET /touristspots
router.get("/touristspots", async (req, res) => {
  try {
    const response = await axios.get(`${BASE_URL}/touristspots`);
    console.log(response);
    res.json(response.data);
  } catch (error) {
    console.error("GET /touristspots error:", error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res
        .status(500)
        .json({ message: error.message || "Internal Server Error" });
    }
  }
});

// GET /touristspots/:id
router.get("/touristspots/:id", async (req, res) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/touristspots/${req.params.id}`
    );
    res.json(response.data);
  } catch (error) {
    console.error("GET /touristspots/:id error:", error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res
        .status(500)
        .json({ message: error.message || "Internal Server Error" });
    }
  }
});

// POST /touristspots
router.post("/touristspots", async (req, res) => {
  try {
    const response = await axios.post(`${BASE_URL}/touristspots`, req.body);
    res.status(201).json(response.data);
  } catch (error) {
    console.error("POST /touristspots error:", error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res
        .status(500)
        .json({ message: error.message || "Internal Server Error" });
    }
  }
});

// DELETE /touristspots
router.delete("/touristspots", async (req, res) => {
  try {
    const response = await axios.delete(`${BASE_URL}/touristspots`, {
      data: req.body,
    });
    res.json(response.data);
  } catch (error) {
    console.error("DELETE /touristspots error:", error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res
        .status(500)
        .json({ message: error.message || "Internal Server Error" });
    }
  }
});

// PATCH /touristspots/:id/add-review
router.patch("/touristspots/:id/add-review", async (req, res) => {
  try {
    const response = await axios.patch(
      `${BASE_URL}/touristspots/${req.params.id}/add-review`,
      req.body
    );
    res.json(response.data);
  } catch (error) {
    console.error("PATCH /touristspots/:id/add-review error:", error.message);
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
