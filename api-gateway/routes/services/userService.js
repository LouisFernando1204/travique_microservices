const express = require("express");
const axios = require("axios");
const router = express.Router();
require("dotenv").config();

const BASE_URL =
  process.env.USER_SERVICE_URL || "http://user-service-user-service-1:7100/api";

router.post("/login", async (req, res) => {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, req.body);
    res.status(201).json(response.data);
  } catch (error) {
    console.error("POST /login error:", error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res
        .status(500)
        .json({ message: error.message || "Internal Server Error" });
    }
  }
});

router.post("/register", async (req, res) => {
  console.log("louis gay");
  console.log("BASE_URL:", process.env.USER_SERVICE_URL);
  try {
    const response = await axios.post(`${BASE_URL}/auth/register`, req.body);
    res.status(201).json(response.data);
  } catch (error) {
    console.error("POST /register error:", error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res
        .status(500)
        .json({ message: error.message || "Internal Server Error" });
    }
  }
});

router.patch("/edit_profile/:id", verifyToken, async (req, res) => {
  try {
    const response = await axios.patch(
      `${BASE_URL}/auth/edit_profile/${req.params.id}`,
      req.body,
      {
        headers: { Authorization: req.headers.authorization },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error("PATCH /edit_profile/:id error:", error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res
        .status(500)
        .json({ message: error.message || "Internal Server Error" });
    }
  }
});

async function verifyToken(req, res, next) {
  try {
    const response = await axios.get(
      `${BASE_URL}/auth/verify_token/${req.params.id}`,
      {
        headers: { Authorization: req.headers.authorization },
      }
    );
    if (response.data && response.data.status === "success") {
      next();
    } else {
      return res.status(403).json({ message: "Invalid user token" });
    }
  } catch (error) {
    console.error("GET /verify_token/:id error:", error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res
        .status(500)
        .json({ message: error.message || "Internal Server Error" });
    }
  }
}

module.exports = router;
