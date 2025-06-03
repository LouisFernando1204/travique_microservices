const express = require('express');
const dotenv = require('dotenv');
const reviewRoutes = require('./routes/reviewRoutes');

dotenv.config();

const app = express();
app.use(express.json());

app.use('/api/reviews', reviewRoutes);

module.exports = app;
