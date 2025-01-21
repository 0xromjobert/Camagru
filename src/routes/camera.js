const express = require('express');
const path = require('path');
const {authToken} = require('../middleware/tokenJWT');

const router = express.Router();

router.get('/', authToken, (req, res) => {
    if (!req.user)
        return res.status(401). redirect('/auth/login');
    return res.status(200).sendFile(path.join(__dirname,"../views/camera.html"));
});

module.exports = router;