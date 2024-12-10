const express = require('express');
const signup = require('../controllers/signup');
const {signupValidationRules, validate} = require('../middleware/authValidator.js');

// Create an express router
const router = express.Router();

// Define the routes for the signup endpoint
router.post('/signup', signupValidationRules, validate, signup);

router.get('/signup', (req, res) => {
    res.send('Welcome to signup Page!');
});

module.exports = router;