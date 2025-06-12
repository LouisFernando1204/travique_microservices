const express = require("express");
const axios = require("axios");
const router = express.Router();
require("dotenv").config();

const BASE_URL = process.env.REVIEW_SERVICE_URL;

// Get Reviews by Tourist Spot
router.get("/reviews/:idTourist", async (req, res) => {
  try {
    const { idTourist } = req.params;
    const response = await axios.get(`${BASE_URL}/reviews/${idTourist}`, axiosConfig);
    res.status(200).json({
      success: true,
      data: response.data
    });
  } catch (error) {
    handleServiceError(error, res, "GET /reviews/:idTourist");
  }
});

// Create Review
router.post("/reviews", async (req, res) => {
  try {
    const response = await axios.post(`${BASE_URL}/reviews`, req.body, axiosConfig);
    res.status(201).json({
      success: true,
      data: response.data
    });
  } catch (error) {
    handleServiceError(error, res, "POST /reviews");
  }
});

// Update Review
router.patch("/reviews/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const response = await axios.patch(`${BASE_URL}/reviews/${id}`, req.body, axiosConfig);
    res.status(200).json({
      success: true,
      data: response.data
    });
  } catch (error) {
    handleServiceError(error, res, "PATCH /reviews/:id");
  }
});

// Delete Review
router.delete("/reviews/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const response = await axios.delete(`${BASE_URL}/reviews/${id}`, axiosConfig);
    res.status(200).json({
      success: true,
      data: response.data
    });
  } catch (error) {
    handleServiceError(error, res, "DELETE /reviews/:id");
  }
});

const handleServiceError = (error, res, operation) => {
  console.error(`${operation} error:`, error.message);
  
  if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
    return res.status(503).json({
      success: false,
      message: "Review service is currently unavailable. Please try again later.",
      error: "SERVICE_UNAVAILABLE"
    });
  }
  
  if (error.code === 'ECONNABORTED') {
    return res.status(504).json({
      success: false,
      message: "A database error occurred. Please try again later.",
      error: "SERVICE_TIMEOUT"
    });
  }
  
  if (error.response) {
    return res.status(error.response.status).json({
      success: false,
      message: error.response.data?.message || "Error from review service",
      error: error.response.data
    });
  }
  
  if (!error.response && error.request) {
    return res.status(503).json({
      success: false,
      message: "Unable to connect to review service. Please try again later.",
      error: "CONNECTION_FAILED"
    });
  }
  
  return res.status(500).json({
    success: false,
    message: error.message || "Internal Server Error",
    error: "INTERNAL_ERROR"
  });
};

const axiosConfig = {
  timeout: 100, 
};


module.exports = router;