//global var for total stikcer
let stickerCounter = 0;

document.addEventListener("DOMContentLoaded", camStream());

document.getElementById('takePicture').addEventListener("click", async (e)=>{
    e.preventDefault();
    if (!(stickerCounter > 0))
      return;
    const img = captureScreen();
    addThumbnail(img);
});

document.addEventListener('DOMContentLoaded', buildCarroussel());

async function camStream(){
    try{
        const stream = await navigator.mediaDevices.getUserMedia({video:true});
        const videoElem = document.querySelector('#webcam');
        videoElem.srcObject = stream;
        videoElem.play();
        const picbutton = document.querySelector('#takePicture');
        if (stickerCounter === 0)
            picbutton.disabled = true;
    }
    catch(error){
        console.error("wecam access error", error);
    }
};


function captureScreen(){
    
    //getting video and stickers [separated elements]
    const videoStream = document.querySelector('#webcam');
    const stickers = document.querySelectorAll(".sticker-overlay");

    //create a canva dynamically -> WHAT IS A CANVAS?
    const canva = document.createElement('canvas');
    canva.height = videoStream.videoHeight;
    canva.width = videoStream.videoWidth;
    const context = canva.getContext('2d');
    
    context.drawImage(videoStream, 0,0, canva.width, canva.height);

    // Get DOM dimensions of the video (CSS-rendered size)
    const videoRect = videoStream.getBoundingClientRect();
    const videoWidthRatio = canva.width / videoRect.width; // Scale factor for width
    const videoHeightRatio = canva.height / videoRect.height; // Scale factor for height
    
    // Draw each sticker onto the canvas
    stickers.forEach((sticker) => {
      const rect = sticker.getBoundingClientRect(); // Get sticker position
      const videoRect = videoStream.getBoundingClientRect(); // Get video position
      
      // Calculate sticker position relative to the video
      const x = (rect.x - videoRect.x)* videoWidthRatio; // Scaled X position;
      const y = (rect.y - videoRect.y) * videoHeightRatio;
      const width = rect.width * videoWidthRatio;
      const height = rect.height * videoHeightRatio;
      
      // Draw the sticker on the canvas
      context.drawImage(sticker, x, y, width, height);
    });

    const imgData = canva.toDataURL('image/png');
    console.log("about to send:", imgData);
    return imgData;
};



function addThumbnail(imageData) {
    const thumbnailsContainer = document.getElementById('thumbnails');
    
    // Create a new <img> element
    const thumbnail = document.createElement('img');
    thumbnail.src = imageData; // Set the captured image as the source
    thumbnail.alt = 'Thumbnail';
    thumbnail.classList.add('img-thumbnail'); // Add Bootstrap thumbnail class for styling
  
    // Append the thumbnail to the container
    thumbnailsContainer.prepend(thumbnail);
  }

function buildCarroussel() {
  const stickPath = "/assets/stickers";
  const stickers = [
    "saltbae.png",
    "doge.png",
    "morpheus.png",
    "robert.png",
    "smart.png",
    "bitcoin.png",
    "svalley.png",
  ];
  // Clear any existing content inside the custom element
  const carousContainer = document.getElementById('stickcarous')
  // Dynamically add images to the carousel
  stickers.forEach((sticker) => {
    const img = document.createElement("img");
    img.src = `${stickPath}/${sticker}`;
    img.alt = sticker.split(".")[0]; // Optional: Use filename as alt text
    img.style = "max-height: 100%; object-fit: contain;";
    img.addEventListener('click', () => addStickerToVideo(img.src));
    carousContainer.appendChild(img);
  });
  
}

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
  //sticker.style.height = `${0.5 * h}px`;
  //sticker.style.width = 'auto';
  sticker.className= "sticker-overlay";
  
  // Assign a unique ID to the sticker
  sticker.dataset.stickerId = ++stickerCounter;
  
  sticker.dataset.leftPercent = 50; // Centered horizontally
  sticker.dataset.topPercent = 50; // Centered vertically
  sticker.dataset.widthPercent = 20; // 20% of container width initially
   // Set initial size and position
   updateStickerSizeAndPosition(sticker);

  //make the newly created sticker drag & drop-able
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
      console.error("Dragged sticker not found");
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