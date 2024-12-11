const express = require('express');
const signup = require('../controllers/signup');
const login = require('../controllers/login');
const { authToken } = require('../middleware/tokenJWT');
const {signupValidationRules, loginValidationRules, validate} = require('../middleware/authValidator.js');

// Create an express router
const router = express.Router();

// Define the routes for the signup endpoint
router.post('/signup', signupValidationRules, validate, signup);

router.get('/signup', (req, res) => {
    res.send('Welcome to signup Page!');
});

//same but for login
router.post('/login', loginValidationRules, validate, login);

router.get('/login', (req, res) => {
    res.send('Welcome to login Page!');
});

// Protected route (authentication required)
router.get('/test', authToken, (req, res) => {
    // If the authToken middleware validates the token, `req.user` will be populated
    res.status(200).json({ message: 'This is a protected route. Welcome :)', user: req.user });
});

module.exports = router;