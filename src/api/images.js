const { query } = require('../config/database');
const express = require('express')
const path = require('path');
const fs = require('fs').promises; // Use fs.promises for async operations

const router = express.Router();

router.get('/', async (req, res) => {
    const galleryFolder = path.join(__dirname, '../../gallery'); // Path to the folder
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 6; // Default to 6 images per page
    const offset = (page - 1) * limit;

    try {
        // Step 1: Fetch all files in the folder
        const files = await fs.readdir(galleryFolder);

        // Step 2: Query the database for image metadata
        const dbImages = await query(
            'SELECT id, title, url, created_at FROM images ORDER BY created_at DESC LIMIT $1 OFFSET $2',
            [limit, offset]
        );

        //step 2-2 : get the number of images
        const querImg = await query("SELECT COUNT(*) As total FROM images");
        const totalImg = querImg.rows[0].total;
        
        
        // Step 3: Map database entries to file paths
        const images = dbImages.rows.map((dbImage) => {
            
            // Extract the file name from the URL
            const dbFileName = dbImage.url.split('/').pop(); // Get the file name from the path

            // Match the file name with the files array
            const filePath = files.find((file) => file === dbFileName);
            //const filePath = files.find((file) => dbImage.url.includes(file)); // Match db URL to file
            return filePath
                ? {
                      id: dbImage.id,
                      title: dbImage.title,
                      url: `/api/images/${filePath}`, // Endpoint to retrieve the file
                      created_at: dbImage.created_at,
                  }
                : null;
        }).filter(Boolean); // Remove null entries

        // Step 4: Return paginated images
        res.json({
            page,
            total: totalImg,
            images,
        });
    } catch (err) {
        console.error('Error fetching images:', err);
        res.status(500).json({ error: 'Failed to load images' });
    }
});

/* 
GET endpoint for a spefici url 
*/
router.get('/:filename', async (req, res) => {
    const galleryFolder = path.join(__dirname, '../../gallery');
    const filePath = path.join(galleryFolder, req.params.filename);

    try {
        // Validate file existence
        await fs.access(filePath);
        res.sendFile(filePath); // Send the file securely
    } catch (err) {
        res.status(404).json({ error: 'File not found' });
    }
});

module.exports = router;