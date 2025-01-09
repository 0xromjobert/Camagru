const express = require('express')
const path = require('path');

const router = express.Router();

// Serve the gallery folder as static files
router.use('/gallery', express.static(path.join(__dirname, '../../gallery')));

router.get('/', async (req, res)=>{
    res.sendFile(path.join(__dirname, "../views/gallery.html"));
});

module.exports = router;