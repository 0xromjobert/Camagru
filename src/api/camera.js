const express = require('express');
const sharp = require('sharp');
const path = require('path');
const Busboy = require('busboy'); //to handle multipart form -> similar PHP $_FILES['file']['tmp_name']
const {authToken} = require('../middleware/tokenJWT');
const {query} = require('../config/database');
const { v4: uuidv4 } = require('uuid'); //to gen uuid -> similar to PHP uuid_create(UUID_TYPE_RANDOM);
const fs = require('fs')


const router = express.Router();


//MISSING AUTH TOKEN AND ADD TO DB
router.post('/process-image', authToken, async (req, res) => {
    try {
        if (!req.user)
            return res.status(403).redirect('/');
        
        //get from json as b64 -> decode to buffer and allocate random uuid name
        const busboy = Busboy({ headers: req.headers });
        const uuid = uuidv4();
        const filename = uuid.concat('.png');
        const resPath = '/gallery/'.concat(filename);
        const uploadsDir = path.join(__dirname,'../../gallery');

        // Ensure the uploads directory exists
        if (!fs.existsSync(uploadsDir))
            fs.mkdirSync(uploadsDir);

        let fileSaved = false;
        let savedFilePath = '';

        busboy.on('file', (fieldname, file, busfilename, encoding, mimetype) => {
          console.log('File event triggered:', busfilename);
          const tmpFilePath = path.join(uploadsDir, `tmp-${filename}`);
          console.log('save file path', savedFilePath, 'temp is', tmpFilePath);
          const writeStream = fs.createWriteStream(tmpFilePath);
          
          file.pipe(writeStream);

        
          file.on('end', async () => {
            const savedFilePath = path.join(uploadsDir, filename);
            console.log(`File saved to: ${savedFilePath}`);
            await sharp(tmpFilePath).resize(300, 400, { 
                fit: 'contain', 
                background: { r: 255, g: 255, b: 255, alpha: 1 }
              }).toFile(savedFilePath);
            
            fileSaved = true;
            console.log("file is saved", fileSaved);
          });
            
          // Log errors during file upload
          writeStream.on('error', (err) => {
              console.error('Error writing file:', err);

          });
          file.on('error', (err) => {
            console.error('Error during file upload:', err);
          });
        });
        
        req.pipe(busboy);
        await query("INSERT INTO images (title, url, user_id) VALUES ($1, $2, $3);",[filename, resPath, req.user.user_id]);
        //DELETE TEMP FILE -> Don't forget  d

    }
    catch (error) {
        console.error('Error processing image:', error);
        res.status(500).send('Failed to process the image.');
    }
  });

  module.exports = router;


     // try {
    //     const { videoFrame, stickers } = req.body;

    //     // Decode the Base64 video frame
    //     console.log("received", videoFrame, stickers);
    //     const videoBuffer = Buffer.from(videoFrame.split(',')[1], 'base64');
    //     let image = sharp(videoBuffer); // Load the video frame into Sharp

    //     // Prepare the stickers for compositing
    //     const composites = await Promise.all(
    //         stickers.map(async (sticker) => {
    //             const stickerResponse = await fetch(sticker.src);
    //             const stickerBuffer = await stickerResponse.buffer();
    //             return {
    //                 input: stickerBuffer, // Sticker image buffer
    //                 top: Math.round(sticker.y), // Y position
    //                 left: Math.round(sticker.x), // X position
    //                 blend: 'over', // Overlay the sticker
    //             };
    //         })
    //     );

    //     // Composite the stickers onto the video frame
    //     image = await image.composite(composites);

    //     // Convert to PNG and send back the result
    //     const finalBuffer = await image.png().toBuffer();
    //     res.set('Content-Type', 'image/png').send(finalBuffer);
    // }