document.addEventListener("DOMContentLoaded", camStream());

document.getElementById('takePicture').addEventListener("click", async (e)=>{
    e.preventDefault();
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

    // Draw each sticker onto the canvas
    stickers.forEach((sticker) => {
      const rect = sticker.getBoundingClientRect(); // Get sticker position
      const videoRect = videoStream.getBoundingClientRect(); // Get video position
      
      // Calculate sticker position relative to the video
      const x = rect.x - videoRect.x;
      const y = rect.y - videoRect.y;
      const width = rect.width;
      const height = rect.height;
      
      // Draw the sticker on the canvas
      context.drawImage(sticker, x, y, width, height);
    });

    const imgData = canva.toDataURL('image/png');
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
  if (!videoSpace){
    console.error("could not find videoCam or Image");
    return;
  }
  const sticker = document.createElement("img");
  sticker.src = imgSrc;
  sticker.className= "sticker-overlay";
  videoSpace.appendChild(sticker);
  console.log(sticker);
}