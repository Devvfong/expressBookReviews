
const express = require('express');
const axios = require('axios');
const books = require('./booksdb.js');
const { isValid, registerUser } = require('./auth_users.js');

const public_users = express.Router();

// Register a new user
public_users.post('/register', (req, res) => {
    const username = typeof req.body?.username === 'string'
        ? req.body.username.trim() : '';
    const password = req.body?.password;

    if (!username || typeof password !== 'string' || !password) {
        return res.status(400).json({
            message: 'Username and password are required'
        });
    }

    if (isValid(username)) {
        return res.status(409).json({
            message: 'Username already exists'
        });
    }

    registerUser(username, password);
    return res.status(201).json({
        message: 'User successfully registered'
    });
});

// Get all books
public_users.get('/', (req, res) => {
    return res.status(200).json(books);
});

// Get book by ISBN
public_users.get('/isbn/:isbn', (req, res) => {
    const book = books[req.params.isbn];

    if (!book) {
        return res.status(404).json({
            message: 'Book not found'
        });
    }

    return res.status(200).json(book);
});

// Get books by author
public_users.get('/author/:author', (req, res) => {
    const author = req.params.author.trim().toLowerCase();

    const result = Object.values(books).filter(
        book => book.author.toLowerCase() === author
    );

    return res.status(200).json(result);
});

// Get books by title
public_users.get('/title/:title', (req, res) => {
    const title = req.params.title.trim().toLowerCase();

    const result = Object.values(books).filter(
        book => book.title.toLowerCase() === title
    );

    return res.status(200).json(result);
});

// Get reviews by ISBN
public_users.get('/review/:isbn', (req, res) => {
    const book = books[req.params.isbn];

    if (!book) {
        return res.status(404).json({
            message: 'Book not found'
        });
    }

    return res.status(200).json(book.reviews);
});

// Axios exercises
const API_URL = process.env.API_BASE_URL ||
    'http://127.0.0.1:5000';

// Task 10: Async/Await
async function getAllBooksAsync() {
    const response = await axios.get(`${API_URL}/`);
    return response.data;
}

// Task 11: Promises
function getBookByISBNAsync(isbn) {
    return axios.get(
        `${API_URL}/isbn/${encodeURIComponent(isbn)}`
    ).then(response => response.data);
}

// Task 12: Async/Await
async function getBooksByAuthorAsync(author) {
    const response = await axios.get(
        `${API_URL}/author/${encodeURIComponent(author)}`
    );
    return response.data;
}

// Task 13: Async/Await
async function getBooksByTitleAsync(title) {
    const response = await axios.get(
        `${API_URL}/title/${encodeURIComponent(title)}`
    );
    return response.data;
}

module.exports.general = public_users;
module.exports.getAllBooksAsync = getAllBooksAsync;
module.exports.getBookByISBNAsync = getBookByISBNAsync;
module.exports.getBooksByAuthorAsync = getBooksByAuthorAsync;
module.exports.getBooksByTitleAsync = getBooksByTitleAsync;
