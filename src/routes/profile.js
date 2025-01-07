const express = require('express');
const path = require('path');
const {authToken} = require('../middleware/tokenJWT');

const router = express.Router();

//getting user profile
router.get('/', authToken, (req, res) => {
    res.sendFile(path.join(__dirname, '../views/profile.html'));
});

router.get('/edit', authToken, (req, res) => {
    res.sendFile(path.join(__dirname, "../views/editprofile.html"));
});

module.exports = router;