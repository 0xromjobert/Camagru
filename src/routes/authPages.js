const express = require('express');
const path = require('path');
const {authToken} = require('../middleware/tokenJWT');

// Create an express router
const router = express.Router();

router.get('/signup', authToken, (req, res) => {
    if (!req.user)
        res.sendFile(path.join(__dirname, '../views/signup.html'));
    else
        res.redirect("/profile");
    //res.send('Welcome to login Page!');
});

router.get('/login', authToken,(req, res) => {
    if (!req.user)
        res.sendFile(path.join(__dirname, '../views/login.html'));
    else
        res.redirect("/profile");
});


module.exports = router;