require('dotenv').config();

const express = require('express');
const app = express();
const path = require('path');
const { logger, logEvents } = require('./middleware/logEvents')
const errorHandler = require('./middleware/errorHandler');
const cookieParser = require('cookie-parser');
const credentials = require('./middleware/credentials');
const cors = require('cors');
const corsOptions = require('./config/corsOptions');
const { connectDB, getDbStatus } = require('./config/dbConn');
const mongoose = require('mongoose');
const PORT = process.env.PORT || 3500;
const verifyUser = require('./middleware/verifyUser');

console.log("ENVIRONMENT:", process.env.NODE_ENV);

connectDB();

app.use((req, res, next) => {
    if (!getDbStatus()) {
        return res.status(503).json({
            message: "Service unavailable: Database connection failed"
        });
    }
    next();
});

app.use(logger);

app.use(credentials);

app.use(cors(corsOptions));

app.use(express.urlencoded({ extended: false }));

app.use(express.json());

app.use(cookieParser());

app.use('/', express.static(path.join(__dirname, 'public')));

app.use('/', require('./routes/root'));
app.use('/touristspots', require('./routes/api/touristSpotRoute'));
app.use('/bookings', verifyUser, require('./routes/api/bookingRoute'));

app.all('*', (req, res) => {
    res.status(404);
    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html'));
    } else if (req.accepts('json')) {
        res.json({ error: "404 Not Found" });
    } else {
        res.type('txt').send('404 Not Found');
    }
});

app.use(errorHandler);

mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running on port ${process.env.PORT}`));
});

mongoose.connection.on('error', err => {
    console.log(err);
    logEvents(`${err.errno}: ${err.code}\t${err.syscall}\t${err.hostname}`, 'mongoErrLog.log');
    return res.status(503).json({
        message: "Service unavailable: Database error"
    });
});