
const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const books = require('./booksdb.js');

const regd_users = express.Router();

const users = [];

const isValid = (username) => {
    return users.some(user => user.username === username);
};

const registerUser = (username, password) => {
    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = crypto.scryptSync(
        password, salt, 64
    ).toString('hex');

    users.push({ username, salt, passwordHash });
};

const authenticatedUser = (username, password) => {
    const user = users.find(
        user => user.username === username
    );

    if (!user || typeof password !== 'string') {
        return false;
    }

    const expected = Buffer.from(user.passwordHash, 'hex');
    const actual = crypto.scryptSync(password, user.salt, 64);

    return expected.length === actual.length &&
        crypto.timingSafeEqual(expected, actual);
};

// Login
regd_users.post('/login', (req, res) => {
    const username = typeof req.body?.username === 'string'
        ? req.body.username.trim() : '';
    const password = req.body?.password;

    if (!username || typeof password !== 'string' || !password) {
        return res.status(400).json({
            message: 'Username and password are required'
        });
    }

    if (!authenticatedUser(username, password)) {
        return res.status(401).json({
            message: 'Invalid username or password'
        });
    }

    const token = jwt.sign(
        { username },
        process.env.JWT_SECRET || 'bookshop_course_demo_secret',
        { expiresIn: '1h' }
    );

    req.session.authorization = {
        accessToken: token,
        username
    };

    return res.status(200).json({
        message: 'Login successful',
        token
    });
});

// Add or update book review
regd_users.put('/auth/review/:isbn', (req, res) => {
    const { isbn } = req.params;

    if (!Object.prototype.hasOwnProperty.call(books, isbn)) {
        return res.status(404).json({
            message: 'Book not found'
        });
    }

    const review = req.body?.review ?? req.query.review;

    if (typeof review !== 'string' || !review.trim()) {
        return res.status(400).json({
            message: 'Review is required'
        });
    }

    books[isbn].reviews[req.user.username] = review.trim();

    return res.status(200).json({
        message: 'Review added or updated',
        reviews: books[isbn].reviews
    });
});

// Delete user's own review
regd_users.delete('/auth/review/:isbn', (req, res) => {
    const { isbn } = req.params;

    if (!Object.prototype.hasOwnProperty.call(books, isbn)) {
        return res.status(404).json({
            message: 'Book not found'
        });
    }

    if (!Object.prototype.hasOwnProperty.call(
        books[isbn].reviews, req.user.username
    )) {
        return res.status(404).json({
            message: 'You have no review for this book'
        });
    }

    delete books[isbn].reviews[req.user.username];

    return res.status(200).json({
        message: 'Review deleted successfully'
    });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.registerUser = registerUser;
module.exports.authenticatedUser = authenticatedUser;
module.exports.users = users;
