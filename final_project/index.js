
const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');

const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
const customerSession = session({
    secret: process.env.SESSION_SECRET || 'fingerprint_customer',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: 'lax'
    }
});

app.use('/customer', customerSession);
app.use('/login', customerSession);

// JWT Authentication Middleware
app.use('/customer/auth', (req, res, next) => {
    const header = req.headers.authorization || '';

    const bearerToken = header.startsWith('Bearer ')
        ? header.slice(7)
        : null;

    const token = bearerToken ||
        req.session?.authorization?.accessToken;

    if (!token) {
        return res.status(401).json({
            message: 'Please log in first'
        });
    }

    try {
        req.user = jwt.verify(
            token,
            process.env.JWT_SECRET || 'bookshop_course_demo_secret'
        );

        return next();
    } catch (error) {
        return res.status(401).json({
            message: 'Invalid or expired token'
        });
    }
});

// Support login through /login
app.post('/login', (req, res, next) => {
    customer_routes(req, res, next);
});

// Existing routes
app.use('/customer', customer_routes);
app.use('/', genl_routes);

const PORT = Number(process.env.PORT || 5000);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
