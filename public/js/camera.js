document.addEventListener("DOMContentLoaded", camStream());

document.getElementById('takePicture').addEventListener("click", async (e)=>{
    e.preventDefault();
    const img = captureScreen();
    addThumbnail(img);
});


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
    const videoStream = document.querySelector('#webcam');
    const canva = document.createElement('canvas');
    canva.height = videoStream.videoHeight;
    canva.width = videoStream.videoWidth;
    const context = canva.getContext('2d');
    
    context.drawImage(videoStream, 0,0, canva.width, canva.height);
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
    thumbnailsContainer.appendChild(thumbnail);
  }


  
class stickeCarroussel extends HTMLElement {
    constructor(){
        super();
    }

    async connectedCallback(){
        this.innerHTML = `<div class="d-flex overflow-auto w-100 gap-2" style="height: 10%" id="stickerCarous"></div>`
        /* `
        <div class="d-flex justify-content-center align-items-center">
        <div id="cardCarousel" class="carousel slide w-100 mt-3" data-bs-ride="carousel" style="height: auto;">
        <div class="carousel-inner h-50">
          <div class="carousel-item active h-50">
            <div class="d-flex justify-content-center flex-wrap gap-3 align-items-center h-80" id="stickerCarous">
              <!-- Cards will be dynamically appended here -->
            </div>
          </div>
        </div>
      </div>
      </div>
        `;*/

        await this.buidCarroussel();

    };

    async buidCarroussel(){
        const stickPath = "/assets/stickers";
        const stickers = ["bitcoin.png", 'doge.png', 'morpheus.png', 'robert.png', 'saltbae.png', 'smart.png', 'svalley.png'];
        
        const carous = this.querySelector("#stickerCarous");
        console.log(carous);
        if (!carous) {
          console.error("#stickerCarous element not found");
          return;
        }
        stickers.forEach((stck) =>{
        
            const img = document.createElement("img");
            const src = `${stickPath}/${stck}`;
            img.src = src;
            img.alt = "Sticker";
            img.className = "rounded";
            //img.style.height = "100px"; // Fixed height for consistency
            carous.appendChild(img);
        });
    };
    
    buildCard(imagePath){
        // Create the card container
      // Create the container
      const container = document.createElement('div');
      container.className = 'image-container'; // Add a class for styling
  
      // Set innerHTML directly
      container.innerHTML = `
          <img src="${imagePath}" alt="Carousel Image" class="image">
      `;
      return container;
    };

};

customElements.define('sticker-car', stickeCarroussel);
