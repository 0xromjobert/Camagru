const express = require('express');
const path = require('path');
const {authToken} = require('../middleware/tokenJWT');

const router = express.Router();

//getting user profile - if not loggedin redirect to login page
router.get('/', authToken, (req, res) => {
    if (!req.user)
        return res.redirect('/auth/login');
    res.sendFile(path.join(__dirname, '../views/profile.html'));
});

router.get('/edit', authToken, (req, res) => {
    if (!req.user)
        return res.redirect('/auth/login');
    res.sendFile(path.join(__dirname, "../views/editprofile.html"));
});

module.exports = router;