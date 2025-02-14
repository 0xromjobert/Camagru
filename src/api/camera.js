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
      console.log("in process-image");
        if (!req.user)
            return res.status(403).redirect('/');
        
        //get from json as b64 -> decode to buffer and allocate random uuid name
        const busboy = Busboy({ headers: req.headers, limits: 10* 1024 * 1024 }); //10mb limits size
        const uuid = uuidv4();
        const filename = uuid.concat('.png');
        const uploadsDir = path.join(__dirname,'../../gallery');
        const stickDir = path.join(__dirname,'../../public/assets/stickers');

        // Ensure the uploads directory exists
        if (!fs.existsSync(uploadsDir))
            fs.mkdirSync(uploadsDir);

        const savedFilePath = path.join(uploadsDir, filename);
        let stickers = [];

        // Field event: Triggered for each non-file form field
        busboy.on('field', (name, value) => {
          stickers = JSON.parse(value);
          stickers = stickers.map((sticker) => {
            return {...sticker, path: `${stickDir}/${sticker.imgSrc}`};
          });
        });

        // Handle file upload
        busboy.on('file', (fieldname, file, info) => {
          const { filename, encoding, mimeType } = info; // Get file info from Busboy
          const tmpName = `tmp-${filename}`;
          tmpFilePath = path.join(uploadsDir, tmpName);
          const writeStream = fs.createWriteStream(tmpFilePath);
          file.pipe(writeStream);
          
          fileWritePromise = new Promise((resolve, reject) => {
            writeStream.on('finish', async () => {
                try {
                    // Ensure the file is valid by checking its metadata
                    await sharp(tmpFilePath).metadata();
                    resolve();
                } catch (error) {
                    console.error("Error processing image with Sharp:", error);
                    reject(new Error("Uploaded file is not a valid image."));
                }
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
              await processImage(tmpFilePath, stickers, savedFilePath);

              // Cleanup temp file
              fs.promises.unlink(tmpFilePath);
              
              //save to db and response
              const result = await query("INSERT INTO images (title, url, user_id) VALUES ($1, $2, $3) RETURNING id;",[filename, savedFilePath, req.user.user_id]);
              const imgId = result.rows[0].id;
              res.status(200).json({'image created with id':imgId});
          }
          catch (error) {
              console.error('Error processing image:', error);
              res.status(400).json({error: 'Failed to process the image, try with webcam or upload jpg/png content' });
          }
      });
        
      req.pipe(busboy);
    }
    catch (error) {
        console.error('Error processing image:', error);
        res.status(500).send('Failed to process the image.');
    }
});

/*
api route to get all the previous picture taken by user, this is used to build the thumbnails of all 
previoulsy taken images by this user
*/
router.get('/allPictures', authToken, async (req, res) => {
  if (!req.user)
    return res.status(403).redirect('/'); //redirect user if not loggedin
  try {
      const result = await query("SELECT id, title, url, created_at FROM images WHERE user_id = $1 ORDER BY created_at;", [req.user.user_id]);
      const allImages = result.rows;
      const userImages = allImages.map((img) => {
        return {
          id: img.id,
          title: img.title,
          url : `/api/images/${img.url.split('/').pop()}`,
          created_at : img.created_at,
        };
      });
      res.status(200).json({user_img:userImages});
  }
  catch(error){
    console.error("Error loading usr images", error);
  }
});

/*
recompute the stickers as image with their scaled size from the metadata array (path and grid position / dimension)
*/
async function processImage(backgroundPath, stickers, filename) {

  let image = sharp(backgroundPath);
  // const { width: bgWidth, height: bgHeight } = await image.metadata();

  // // Step 1: load background FIRST to buffer
  // const resizedBackgroundBuffer = await image.toBuffer();

   // **1. Get Original Image Dimensions**
   const { width: bgWidth, height: bgHeight } = await image.metadata();

   // **2. Convert Background to Buffer**
   const resizedBackgroundBuffer = await image.toBuffer();

   // **3. Get Dimensions After Buffer Conversion**
   const { width: bufferWidth, height: bufferHeight } = await sharp(resizedBackgroundBuffer).metadata();


  const overlays = await Promise.all(stickers.map(async (sticker) => {
      try {
          // Scale sticker position and size based on new background dimensions
          let newX = Math.round(sticker.x);
          let newY = Math.round(sticker.y);
          let newW = Math.round(sticker.w);
          let newH = Math.round(sticker.h);

          // Ensure stickers do not go outside the resized image
          newX = Math.max(0, Math.min(newX, bgWidth - newW));
          newY = Math.max(0, Math.min(newY,bgHeight - newH));

          const stickerBuffer = await sharp(sticker.path)
              .resize({ width: newW, height: newH, fit: 'inside' })
              .toBuffer();

          return {
              input: stickerBuffer,
              top: newY,
              left: newX,
          };
      } catch (error) {
          console.error(`Error processing sticker ${sticker.path}:`, error);
          return null;
      }
  }));

  // Remove any failed stickers
  const validOverlays = overlays.filter(sticker => sticker !== null);

  if (validOverlays.length === 0) {
      throw new Error("All sticker processing failed.");
  }

  // Step 3: Apply stickers on the resized background
  await sharp(resizedBackgroundBuffer)
      .composite(validOverlays)
      .toFile(filename);
}


  
  module.exports = router;
