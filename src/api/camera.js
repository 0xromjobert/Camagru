const express = require('express');
const sharp = require('sharp'); //equivalent to PHP GD
const path = require('path');
const Busboy = require('busboy'); //to handle multipart form -> similar PHP $_FILES['file']['tmp_name']
const {authToken} = require('../middleware/tokenJWT');
const {query} = require('../config/database');
const { v4: uuidv4 } = require('uuid'); //to gen uuid -> similar to PHP uuid_create(UUID_TYPE_RANDOM);
const fs = require('fs')


const router = express.Router();

/*
Serving stikcers as asset path from staticly served folder, uins glater on to rebuild hte imag serverside
*/
router.get('/stickers', authToken, async (req, res)=>{
  try {
    const stickDir = '/assets/stickers';
    const stickers = [
      "saltbae.png",
      "doge.png",
      "morpheus.png",
      "robert.png",
      "smart.png",
      "bitcoin.png",
      "svalley.png",
    ];
    const resPath = stickers.map((sticker) => `${stickDir}/${sticker}`);
    res.json(resPath);

  }
  catch(error){
    console.error('Error fetching stickers:', error);
  }
});

/*
reading multipart format into busboy -> eventloop base ingestion on HTTP
three key events ->
generate a uuid for the image file (a png) (avoid name conflict and ingestion)
piping the req params (a stream itself) to busboy object (another stream)
 on file -> ingest the file param, piped to a writable stream that goes to disk on the uuid.png
 on end -> resize the file and clear the tmp
*/
router.post('/process-image', authToken, async (req, res) => {
    try {
        if (!req.user)
            return res.status(403).redirect('/');
        
        //get from json as b64 -> decode to buffer and allocate random uuid name
        const busboy = Busboy({ headers: req.headers });
        const uuid = uuidv4();
        const filename = uuid.concat('.png');
        const uploadsDir = path.join(__dirname,'../../gallery');
        const stickDir = path.join(__dirname,'../../public/assets/stickers');

        console.log(req.body);
        // Ensure the uploads directory exists
        if (!fs.existsSync(uploadsDir))
            fs.mkdirSync(uploadsDir);

        let fileSaved = false;
        const savedFilePath = path.join(uploadsDir, filename);
        let stickers = [];

        // Field event: Triggered for each non-file form field
        busboy.on('field', (name, value) => {
          stickers = JSON.parse(value);
          stickers = stickers.map((sticker) => {
            return {...sticker, path: `${stickDir}/${sticker.imgSrc}`};
          });
          console.log("stickers", stickers);
        });

        // Handle file upload
        busboy.on('file', (fieldname, file, info) => {
          const tmpName = `tmp-${filename}`;
          tmpFilePath = path.join(uploadsDir, tmpName);
          console.log('Temporary file path:', tmpFilePath);
          const writeStream = fs.createWriteStream(tmpFilePath);
          file.pipe(writeStream);
          
          fileWritePromise = new Promise((resolve, reject) => {
              writeStream.on('finish', () => {
                  console.log(`File successfully written: ${tmpFilePath}`);
                  resolve();
              });
              writeStream.on('error', (err) => {
                  console.error('Error writing file:', err);
                  reject(err);
              });
          });
        });

        // Finish event: Wait for file save before processing
        busboy.on('finish', async () => {
          try {
              // Ensure the file is fully saved before processing
              await fileWritePromise;

              // Process the image
              const processedFilePath = await processImage(tmpFilePath, stickers, savedFilePath);
              
              res.status(200).json({ message: 'Image processed successfully'+ processedFilePath });

              // Cleanup temp file
              fs.unlink(tmpFilePath, () => console.log(`Temp file deleted: ${tmpFilePath}`));
          } catch (error) {
              console.error('Error processing image:', error);
              res.status(500).json({ error: 'Failed to process the image.' });
          }
      });
        
        req.pipe(busboy);
        //SILENT FOR TEST await query("INSERT INTO images (title, url, user_id) VALUES ($1, $2, $3);",[filename, resPath, req.user.user_id]);
    }
    catch (error) {
        console.error('Error processing image:', error);
        res.status(500).send('Failed to process the image.');
    }
  });

  async function processImage(backgroundPath, stickers, filename) {
    console.log("Starting image processing with sharp...");

    let image = sharp(backgroundPath);
    const { width: bgWidth, height: bgHeight } = await image.metadata();
    console.log(`Background image dimensions: ${bgWidth}x${bgHeight}`);
    // Load all stickers and apply overlays
    const overlays = await Promise.all(stickers.map(async (sticker) => {
        console.log(`Processing sticker: ${sticker.imgSrc}`)
        console.log(`Sticker processed: ${sticker.imgSrc} - dimensions: x-y${sticker.x}x${sticker.y} - widthxheight: ${sticker.w} - height: ${sticker.h}`);
        return {
            input: sticker.path, // Sticker file path
            top: Math.round(sticker.y), // Position Y
            left: Math.round(sticker.x), // Position X
            width: Math.round(sticker.w), // Resize width
            height: Math.round(sticker.h) // Resize height
        };
    }));

    // Apply overlays using `composite`
    image = await image.composite(overlays)
    // Save the final image
    await image.toFile(filename)
    console.log(`Final image saved: ${filename}`)
    return outputFilePath;
}
  
  module.exports = router;
