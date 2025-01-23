const express = require('express');
const sharp = require('sharp');


const router = express.Router();


//MISSING AUTH TOKEN AND ADD TO DB
router.post('/process-image', async (req, res) => {
    try {
      const { videoFrame, stickers } = req.body;
  
      // Decode the Base64 video frame
      console.log("received", videoFrame, stickers);
      const videoBuffer = Buffer.from(videoFrame.split(',')[1], 'base64');
      let image = sharp(videoBuffer); // Load the video frame into Sharp
  
      // Prepare the stickers for compositing
      const composites = await Promise.all(
        stickers.map(async (sticker) => {
          const stickerResponse = await fetch(sticker.src);
          const stickerBuffer = await stickerResponse.buffer();
          return {
            input: stickerBuffer, // Sticker image buffer
            top: Math.round(sticker.y), // Y position
            left: Math.round(sticker.x), // X position
            blend: 'over', // Overlay the sticker
          };
        })
      );
  
      // Composite the stickers onto the video frame
      image = await image.composite(composites);
  
      // Convert to PNG and send back the result
      const finalBuffer = await image.png().toBuffer();
      res.set('Content-Type', 'image/png').send(finalBuffer);
    } 
    catch (error) {
      console.error('Error processing image:', error);
      res.status(500).send('Failed to process the image.');
    }
  });

  module.exports = router;