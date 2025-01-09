const { authToken } = require('../middleware/tokenJWT');
const { query } = require('../config/database');
const express = require('express')
const path = require('path');
const fs = require('fs').promises; // Use fs.promises for async operations

const router = express.Router();

router.get('/', async (req, res) => {
    const galleryFolder = path.join(__dirname, '../../gallery'); // Path to the folder
    let images = [];

    try {
        // Read all files asynchronously
        const files = await fs.readdir(galleryFolder);

        // Filter image files and create relative paths
        images = files
            .filter((file) => /\.(jpg|jpeg|png|gif)$/i.test(file)) // Only include image files
            .map((file) => `/gallery/${file}`); // Create relative paths
    } catch (err) {
        console.error('Error reading gallery folder:', err);
        return res.status(500).json({ error: 'Failed to load images' });
    }

    res.json({ images });
});

module.exports = router;