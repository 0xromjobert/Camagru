const express = require('express');
const path = require('path');
const {authToken} = require('../middleware/tokenJWT');

// Create an express router
const router = express.Router();

router.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/signup.html'));
    //res.send('Welcome to login Page!');
});

router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/login.html'));
    //res.send('Welcome to login Page!');
});

router.get('/welcome', authToken, (req, res) => {
    res.send(`Welcome, you are logged in`);
    //res.send(`Welcome ${req.user.username}`);
});
module.exports = router;