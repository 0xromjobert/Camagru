import { showAlert } from "./components/alertComponent.js";

//global var for total stikcer
let stickerCounter = 0;

window.addEventListener("load", () => {
  camStream();
  addThumbnail();
  buildCarroussel();
});

document.getElementById('uploadImage').addEventListener("click", uploadImgFile);

document.getElementById('takePicture').addEventListener("click", async (e)=>{
    e.preventDefault();
    if (!(stickerCounter > 0))
      return;
    const {background, stickers} = captureScreen();
    
    //defensive check : empty background, no stickers or background built from no data [empty base64]
    if (!background || stickers.length === 0 || background === "data:,") {
      showAlert("No background image nor stickers found - try again with both", "danger");
      console.error(`{background, stickers} = {${background}, ${stickers}}`);
    }
    else
      await postPicture(background, stickers);
    
      setTimeout(async () => {
      await addThumbnail();
  }, 500);
});

async function camStream(){
    try{
        try {
          const stream = await navigator.mediaDevices.getUserMedia({video:true});
          const videoElem = document.querySelector('#webcam');
          videoElem.srcObject = stream;
          videoElem.play();
        }
        catch(error){
            showAlert("Webcam access error - please allow webcam or upload picture", "danger");
        }
        const picbutton = document.querySelector('#takePicture');
        if (stickerCounter === 0)
          picbutton.disabled = true;
    }
    catch(error){
        showAlert("could not load the camera page, please refresh", "danger");
    }
};

/*
responsible for sending an image (converted from a Base64 data URL to binary data) 
to the server using FormData and the fetch API. While no <form> HTML element is used, 
the FormData object allows us to simulate a multipart form-data request programmatically.
*/
async function postPicture(imgURL, stickers) {
  try {
    const binImg = dataURLToBlob(imgURL);

    //adding the background image as field of multipart from file
    const formData = new FormData();
    formData.append('image', binImg);

    //pass each Sticker metadata to be loaeded and rebuilt on serverside
    formData.append('metaData', JSON.stringify(stickers));

    const resp = await fetch("/api/camera/process-image", {
      method: 'POST',
      body: formData,
    });
    const rslt = await resp.json();
    if (resp.status !== 200 && rslt.error) {
      showAlert(rslt.error, "danger");
      return null;
    }
    return rslt;
  }
  catch (error) {
    console.error("error posting to db", error);
  }
};

/*
1. Captures the current **video frame** from a `<video>` element (e.g., webcam).
2. **Overlays "stickers"** (e.g., `<img>` elements) onto the video.
3. Combines the video and stickers into a **single image** using a `<canvas>` element.
4. Returns the final image as a **Base64-encoded string**.
*/
function captureScreen(){
  try {
    const videoStream = document.querySelector('#webcam');
    const stickers = document.querySelectorAll(".sticker-overlay");

    // Select container for dimensions
    const containerRect = document.querySelector("#videoContainer").getBoundingClientRect();
    const videoRect = videoStream.getBoundingClientRect();

    // Create a canvas element
    const canva = document.createElement('canvas');
    let sourceWidth, sourceHeight;

    // Detect if webcam is a <video> or an <img>
    if (videoStream.tagName === "VIDEO") {
        // Webcam Mode - Use the actual video resolution
        sourceWidth = videoStream.videoWidth;
        sourceHeight = videoStream.videoHeight;
    } else if (videoStream.tagName === "IMG") {
        // Uploaded Image Mode - Use the natural resolution
        sourceWidth = videoStream.naturalWidth;
        sourceHeight = videoStream.naturalHeight;

        // If the image size is undefined (issue with loading), return error
        if (!sourceWidth || !sourceHeight) {
            console.error("Uploaded image dimensions are undefined.");
            return null;
        }
    } else {
        console.error("Unsupported webcam source.");
        return null;
    }

    // // Ensure canvas size matches the **displayed size**, not the full resolution
    // Preserve aspect ratio while setting canvas size
    const aspectRatio = sourceWidth / sourceHeight;
    let newCanvasWidth = containerRect.width;
    let newCanvasHeight = containerRect.width / aspectRatio; // Adjust height based on aspect ratio

    // If the new height exceeds the container height, adjust width instead
    if (newCanvasHeight > containerRect.height) {
        newCanvasHeight = containerRect.height;
        newCanvasWidth = containerRect.height * aspectRatio;
    }

    canva.width = newCanvasWidth;
    canva.height = newCanvasHeight;

    const context = canva.getContext('2d');

    // Draw webcam frame or uploaded image
    context.drawImage(videoStream, 0, 0, canva.width, canva.height);

    // Compute scale factor for positioning stickers correctly
    const videoWidthRatio = canva.width / videoRect.width;
    const videoHeightRatio = canva.height / videoRect.height;

    // Overlay stickers on the captured image
    const stickCanvas = [];
    stickers.forEach((sticker) => {
      const rect = sticker.getBoundingClientRect(); 
      const stickerX = (rect.x - videoRect.x) * videoWidthRatio; 
      const stickerY = (rect.y - videoRect.y) * videoHeightRatio;
      let width = rect.width * videoWidthRatio;
      let height = rect.height * videoHeightRatio;

      // Ensure stickers fit inside the background
      width = Math.min(width, canva.width - stickerX);http://localhost:3000/assets/stickers/doge.png
      height = Math.min(height, canva.height - stickerY);

      // Convert to integer values before sending
      const finalX = Math.round(stickerX);
      const finalY = Math.round(stickerY);
      const finalW = Math.round(width);
      const finalH = Math.round(height);

      // Add sticker data
      const stickerId = sticker.src.split("/").pop();
      stickCanvas.push({ imgSrc: stickerId, x: finalX, y: finalY, w: finalW, h: finalH });
    });

    const imgData = { background: canva.toDataURL('image/png'), stickers: stickCanvas };

    if (imgData.background === "data:,") {
      console.error("Captured image is empty.");
      return null;
    }

    return imgData;
  }
  catch (error) {
    console.error("Error capturing the screen:", error);
    return null;
  }
}

/* 
query endpoit yo get all the images for this user, stacked from last to first -> user get route
re-load after picture, add hover with delte picture button
*/
async function addThumbnail(imageData) {
    const thumbnailsContainer = document.getElementById('thumbnails');
    thumbnailsContainer.innerHTML = "";
    
    // Create a new <img> element
    const resp = await fetch("/api/camera/allPictures");
    const result = await resp.json();
    const allImages = result.user_img;

    allImages.forEach((img) => {
      const thumbnail = document.createElement('img');
      thumbnail.src = img.url; // Set the captured image as the source
      thumbnail.alt = img.title;
      //thumbnail.style.maxHeight = "50vh";
      thumbnail.classList.add('img-thumbnail'); // Add Bootstrap thumbnail class for styling

      // Create the delete button (attached directly to the image)
      const deleteButton = document.createElement('button');
      deleteButton.innerHTML = "❌";
      deleteButton.classList.add('delete-btn');
      
      // Attach delete event
      deleteButton.addEventListener("click", async (event) => {
          event.stopPropagation(); // Prevent triggering other events on the image
          await deleteImage(img.id);
      });

      // Create a container div
      const thumbnailWrapper = document.createElement('div');
      thumbnailWrapper.classList.add('thumbnail-wrapper');

      // Append the button as a child of the image (absolute positioning)
      thumbnailWrapper.appendChild(deleteButton);
      thumbnailWrapper.appendChild(thumbnail);
  
      // Append the thumbnail to the container
      thumbnailsContainer.prepend(thumbnailWrapper);
    });
}

async function deleteImage(imgId) {
  try {
    const resp = await fetch(`/api/images/${imgId}`, {
      method: 'DELETE',
    });

    if (resp.status !== 204){
      const data = await resp.json();
      console.log(data);
    }
    // Remove the deleted image from the UI
    await addThumbnail(); // Reload the thumbnails after deletion
  } catch (error) {
    console.error("Error deleting the resource:", error);
  }
}

async function buildCarroussel() {

  //get asset path frm the server
  const resp = await fetch("/api/camera/stickers");
  const stickers = await resp.json();
  
  // Clear any existing content inside the custom element
  const carousContainer = document.getElementById('stickcarous')
  // Dynamically add images to the carousel
  stickers.forEach((sticker) => {
    const img = document.createElement("img");
    img.src = sticker;
    //img.src = `${stickPath}/${sticker}`;
    img.alt = sticker.split("/").pop().split(".")[0]; // Optional: Use filename as alt text
    img.style = "max-height: 100%; object-fit: contain;";
    img.addEventListener('click', () => addStickerToVideo(img.src));
    carousContainer.appendChild(img);
  });
  
}
/*

*/
async function uploadImgFile(event) {
  event.preventDefault();

  try {
      // Create a hidden input element to select a file
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/png, image/jpeg, image/jpg'; // Allowed formats
      input.click(); // Trigger file selection

      input.addEventListener('change', async () => {
          const file = input.files[0]; // Get the selected file

          if (!file) {
              console.warn("No file selected.");
              return;
          }

          // Validate file type
          const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp"];
          if (!allowedTypes.includes(file.type)) {
              alert("Invalid file type. Please upload a PNG, JPG, JPEG, GIF, or WebP image.");
              return;
          }

          // Convert the image file to a local URL
          const imageURL = URL.createObjectURL(file);

          // Replace the webcam stream with the uploaded image
          replaceWebcamWithImage(imageURL);
      });
  } catch (error) {
      console.error("Error loading image:", error);
      alert("An error occurred while loading the image.");
  }
}

/**
 * Replaces the webcam `<video>` with an `<img>` but keeps the same `id="webcam"`
 * so `captureScreen()` still works without modification.
 * @param {string} imageUrl - The local URL of the uploaded image
 */
function replaceWebcamWithImage(imageUrl) {
  const videoContainer = document.getElementById("videoContainer");
  const oldWebcam = document.getElementById("webcam");

  if (!oldWebcam) {
      console.error("Webcam element not found.");
      return;
  }

  // Stop the webcam stream if active
  if (oldWebcam.tagName === "VIDEO" && oldWebcam.srcObject) {
      const stream = oldWebcam.srcObject;
      stream.getTracks().forEach(track => track.stop()); // Stop the webcam
  }

  // Remove old webcam element
  oldWebcam.remove();

  // Create an image element with the same ID
  const uploadedImage = document.createElement("img");
  uploadedImage.src = imageUrl;
  uploadedImage.id = "webcam"; // Keep the same ID so `captureScreen()` still works
  uploadedImage.style.width = "100%";
  uploadedImage.style.height = "100%";
  uploadedImage.style.objectFit = "contain";

  // Append the new image element
  videoContainer.appendChild(uploadedImage);
}

/*******************************Adding sticker and drag and drop logic *******************/

function addStickerToVideo(imgSrc){
  const videoSpace = document.querySelector('#videoContainer');
  const videoStream = document.querySelector('#webcam');
  const h = videoStream.videoHeight;
  if (!videoSpace){
    console.error("could not find videoCam or Image");
    return;
  }
  //copy image src to build a sticker -> add it as overlay to the container video
  const sticker = document.createElement("img");
  sticker.src = imgSrc;
  sticker.className= "sticker-overlay";
  
  // Assign a unique ID to the sticker
  sticker.dataset.stickerId = ++stickerCounter;
  
  // sticker.dataset.leftPercent = 50; // Centered horizontally
  // sticker.dataset.topPercent = 50; // Centered vertically
  // sticker.dataset.widthPercent = 50; // 20% of container width initially
  // // Set initial size and position
  //  updateStickerSizeAndPosition(sticker);
  
  // **Set sticker position to the top-left corner**
  sticker.dataset.leftPercent = 0;  // **Aligns to the left edge**
  sticker.dataset.topPercent = 0;   // **Aligns to the top edge**
  sticker.dataset.widthPercent = 50; // Default width (adjust as needed)
  updateStickerSizeAndPosition(sticker);
  
  sticker.setAttribute('draggable', 'true');
  sticker.addEventListener("dragstart", handleDragStart);
  sticker.addEventListener("dragend", handleDragEnd);

  videoSpace.appendChild(sticker);
  //make picture bitton clickable
  const picbutton = document.querySelector('#takePicture');
  if (stickerCounter > 0)
      picbutton.disabled = false;
}

/*
Drag and Drop event hanlder : basically broadcast initial position via dataTrasnfer method bound to event
and monitor the event.ClientX/Y position -> then select sticker with ID passed at inception to recalibrate position
*/
function handleDragStart(event) {
  
  // Save initial position in the dataTransfer object and the stickerID
  //if we do not pass the stickerId it would be impossible to impossible what element to drop
  const rect = event.target.getBoundingClientRect();
  event.dataTransfer.setData("offsetX", event.clientX - rect.left);
  event.dataTransfer.setData("offsetY", event.clientY - rect.top);
  event.dataTransfer.setData("stickerID", event.target.dataset.stickerId);

  // Add visual feedback during drag
  event.target.style.opacity = 0.5;
}

function handleDragEnd(event) {
  event.target.style.opacity = 1; // Restore opacity after drag
}

document.addEventListener("dragover", (event) => {
  event.preventDefault(); // Allow dropping (by default not possible to drop -> would go back to init pos)
});

document.addEventListener("drop", (event) => {
  event.preventDefault(); // Prevent default behavior -> designed for inserting text, file ops or cancel

  //receiving initial position [mouse pointer ass offset to viewport positon object ]
  const offsetX = event.dataTransfer.getData("offsetX");
  const offsetY = event.dataTransfer.getData("offsetY");
  const stickId = event.dataTransfer.getData("stickerID");

  const videoSpace = document.querySelector("#videoContainer");
  const containerRect = videoSpace.getBoundingClientRect();

  // Calculate new position, keeping it within the container bounds
  const newX = event.clientX - containerRect.left - offsetX;
  const newY = event.clientY - containerRect.top - offsetY;

    // Apply the new position
    // Find the dragged sticker
    const sticker = document.querySelector(`[data-sticker-id="${stickId}"]`);

    if (!sticker) {
      //console.error("Dragged sticker not found");
      return;
  }
    // Apply new position (clamped to container bounds)
    sticker.style.left = `${Math.max(0, Math.min(newX, containerRect.width - sticker.offsetWidth))}px`;
    sticker.style.top = `${Math.max(0, Math.min(newY, containerRect.height - sticker.offsetHeight))}px`;
});


/*
stickers are superposed image so they do not resize like the flex container do (doesn't have built in responsivity)
we need to resize it 
*/
function updateStickerSizeAndPosition(sticker) {
  const videoSpace = document.querySelector("#videoContainer");
  const containerRect = videoSpace.getBoundingClientRect();

  // Calculate absolute position and size based on percentages
  sticker.style.left = `${(sticker.dataset.leftPercent / 100) * containerRect.width}px`;
  sticker.style.top = `${(sticker.dataset.topPercent / 100) * containerRect.height}px`;
  sticker.style.width = `${(sticker.dataset.widthPercent / 100) * containerRect.width}px`;
}

// Handle window resize
window.addEventListener("resize", () => {
  const stickers = document.querySelectorAll(".sticker-overlay");
  stickers.forEach((sticker) => updateStickerSizeAndPosition(sticker));
});


/********************** UTILS *******************/

/*
converts a Base64-encoded data URL (e.g., from canvas.toDataURL()) into a Blob object. 
This is useful for efficiently handling and transferring image data because 
Base64-encoded strings are significantly larger than their binary counterparts.
*/
function dataURLToBlob(dataURL) {
  const [metadata, base64Data] = dataURL.split(',');
  const binaryString = atob(base64Data);
  const byteArray = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    byteArray[i] = binaryString.charCodeAt(i);
  }
  return new Blob([byteArray], { type: metadata.split(':')[1].split(';')[0] });
}