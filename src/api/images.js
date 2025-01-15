const { query } = require('../config/database');
const express = require('express')
const path = require('path');
const {authToken} = require('../middleware/tokenJWT');
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
        console.log(images);
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


router.get('/like/:imageId', authToken, async (req, res) => {
    try {
        const imageId = req.params.imageId;

        // Count total likes for the image
        const likeResult = await query("SELECT COUNT(*) as total FROM likes WHERE image_id = $1", [imageId]);
        const totalLikes = likeResult.rows[0]?.total || 0;

        // Determine if the user has liked the image
        let isLiked = false;
        if (req.user) {
            const likedResult = await query(
                "SELECT 1 FROM likes WHERE image_id = $1 AND user_id = $2 LIMIT 1",
                [imageId, req.user.user_id]
            );
            isLiked = likedResult.rows.length > 0;
        }

        res.status(200).json({ total: totalLikes, isliked: isLiked });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Server error", error: error.message });
    }
});


router.get('/comment/t/:Id', async (req, res) => {
    try {
        const { Id } = req.params;

        // Count total comments for the image
        const commentResult = await query("SELECT COUNT(*) as total FROM comments WHERE image_id = $1", [Id]);
        const totalComments = commentResult.rows[0]?.total || 0;

        res.status(200).json({ total: totalComments });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Server error", error: error.message });
    }
});


router.get('/comment/:Id', async (req, res) => {
    try {
        const { Id } = req.params;

        // Fetch all comments with usernames
        const commentResult = await query(`
            SELECT comments.text, comments.created_at, users.username 
            FROM comments 
            JOIN users ON comments.user_id = users.id 
            WHERE comments.image_id = $1
            ORDER BY comments.created_at ASC
        `, [Id]);

        if (!commentResult || commentResult.rows.length === 0) {
            return res.status(200).json({ msg: "There are no comments", comments: [] });
        }

        // Format the results
        const comments = commentResult.rows.map((row) => ({
            user: row.username,
            text: row.text,
            at: new Date(row.created_at),
        }));

        res.status(200).json({ comments });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Server error", error: error.message });
    }
});


module.exports = router;