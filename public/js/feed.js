import { showAlert } from "./components/alertComponent.js";

/**
 * GalleryFeed - custom HTML element for dynamically fetching, displaying,
 * and interacting with an image gallery.
 * 
 * Features:
 * - Fetch images from a paginated API and render them in a grid layout.
 * - Supports likes and comments with dynamic updates via API calls.
 * - Includes pagination controls for navigation between pages.
 */
class GalleryFeed extends HTMLElement {
    constructor() {
        super();
        // Initialize properties : track current page, inage per laod, loading state, and more images to load
        this.page = 1;
        this.limit = 6;
        this.loading = false;
        this.hasMoreImg = true;
    }

    /**
    * Lifecycle method called when the element is added to the DOM.
    * Initializes the gallery layout and triggers the image fetch process.
    */
    connectedCallback() {

        // Set the inner HTML of the element - then load the images and set up infinite scroll
        this.innerHTML = `
            <div class="row g-4" id="gallery"></div>
            <div class="d-flex justify-content-center mt-4" id="pagination"></div>
        `;
        this.fetchImages();
        this.infiniteScroll(); 
    }
    
    /*
    Fetch images from the server and render them in the gallery.
    */
    async fetchImages(page = this.page, limit = this.limit) {
        
        //flag for loading to avoid concurrent fetch
        if (this.loading || !this.hasMoreImg) return;
        this.loading = true;
        
        try {
            const response = await fetch(`/api/images?page=${page}&limit=${limit}`);
            if (!response.ok) throw new Error('Failed to fetch images');

            const data = await response.json();
            const gallery = this.querySelector('#gallery');
            
            //gallery.innerHTML = ''; // Clear previous images

            //avoid loading if no more images
            if (data.images.length === 0){
                this.hasMoreImg = false;
                return;
            }

            //Render each image as a card with strict ordering
            for (const image of data.images) {

                //create the image with bounded function
                const col = this.renderCard(image);
                gallery.appendChild(col);
            
                //update the likes and comments dynamically
                await this.updateLike(image.id, col);
                await this.updateComment(image.id, col);
            
                // Bind the comment button to the comment tag display
                const commentButton = col.querySelector(`#comment-button-${image.id}`);
                commentButton.addEventListener('click', async () => {
                    await this.showComments(image.id, col);
                });

                //Bind the like buttoon to POST route / Bind the textinput comment to the endpoint
                this.bindLikeButton(image.id, col);
                this.bindCommentText(image.id, col);
            }

            // Update pagination controls
            this.page++;
            
        } catch (err) {
            console.error(err);
            this.querySelector('#gallery').innerHTML = '<p>Error loading images</p>';
        }
        finally { //WHY FINALLY HERE
            this.loading = false; // Reset the loading flag
        }
    }

    //infinite scroll
    infiniteScroll() {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                this.fetchImages(this.page);
            }
        }, {
            root: null,            // Viewport is the root
            rootMargin: "100px",   // Load new content 300px before reaching the sentinel
            threshold: 1.0
        });
    
        // Create sentinel *above* the footer
        const sentinel = document.createElement("div");
        sentinel.id = "sentinel";
        
        // Insert before the footer
        const footer = document.querySelector("site-footer");
        footer.parentNode.insertBefore(sentinel, footer);
    
        observer.observe(sentinel);
    }


    /**
    * Show or hide the comments section for a specific image.
    * @param {number} imageId - The ID of the image.
    * @param {HTMLElement} col - The container element for the image card.
    * @param {boolean} keep - If true, keeps the comments section open even if already visible.
    */
    async showComments(imageId, col, keep = false) {
        const commentsSection = col.querySelector(`#comments-section-${imageId}`);
        commentsSection.innerHTML = '<p class="text-muted">Loading comments...</p>'; // Placeholder while loading
        
        //unless precised, we close any open comment section on event (so same button open/close section)
        if (commentsSection.classList.contains('visible') && !keep){
            commentsSection.innerHTML = "";
            commentsSection.classList.remove('visible');
            return;
        }
        commentsSection.classList.add('visible');
        try {
            const response = await fetch(`/api/images/comment/${imageId}`);
            if (!response.ok) throw new Error('Failed to fetch comments');
    
            const data = await response.json();
            if (data.comments && data.comments.length > 0) {
                commentsSection.innerHTML = data.comments.map(comment => `
                    <div class="comment">
                        <p><strong>${comment.user || 'Anonymous'}</strong>: ${comment.comment}</p>
                        <p class="text-muted small">${new Date(comment.at).toLocaleString()}</p>
                    </div>
                `).join('');
            } else {
                commentsSection.innerHTML = '<p class="text-muted">No comments available.</p>';
            }
            // Create a close button
            const closeButton = document.createElement('button');
            closeButton.type = 'button';
            closeButton.className = 'btn-close mt-2';
            closeButton.ariaLabel = 'Close';
            closeButton.addEventListener('click', () => {
                commentsSection.innerHTML = ''; // Clear the comments section
                commentsSection.classList.remove('visible');
            });
            commentsSection.appendChild(closeButton);
        } catch (error) {
            commentsSection.innerHTML = '<p class="text-danger">Error loading comments.</p>';
            console.error(error);
        }
    }
    
    //udate the count and logo for likes - used at loeading card or after like
    async updateLike(imageId, col){    
        // Update the likes
        const likeData = await fetch(`/api/images/like/${imageId}`);
        if (likeData.ok) {
            const likeJson = await likeData.json();
            col.querySelector(`#likes-${imageId}`).innerText = likeJson.total;
            if (likeJson.isliked)
                col.querySelector(`#like-icon-${imageId}`).setAttribute('src', '/assets/liked.png');
            else
                col.querySelector(`#like-icon-${imageId}`).setAttribute('src', '/assets/like.png');
        }
    }
    
    //Same but for Comments
    //update the count - used at loading card or after like
    async updateComment(imageId, col){    
        // Update the likes
        const comntData = await fetch(`/api/images/comment/t/${imageId}`);
        if (comntData.ok) {
            const comntJson = await comntData.json();
            col.querySelector(`#comments-${imageId}`).innerText = comntJson.total;
        }
    }

    async bindLikeButton(imageid, col){
        const likeButton = col.querySelector(`#like-button-${imageid}`);
        likeButton.addEventListener('click', async () => {
            const resp = await fetch(`/api/images/like/${imageid}`, {
                method: 'POST',
                body: JSON.stringify({
                  imageId: imageid,
                }),
                headers: { 'Content-Type': 'application/json' },
              });
            const result = await resp.json();
            if (!resp.ok)
                result.message?showAlert(result.message):null;
            await this.updateLike(imageid, col); //reload the button function async to diplay state change
        });
    }

    async bindCommentText(imageid, col){
        const commentForm = col.querySelector(`#comment-form-${imageid}`);
        commentForm.addEventListener('keypress', async (e) => {
            if (e.key === "Enter"){ 
                e.preventDefault();
                const commentInput = commentForm.value.trim();
                commentForm.value ='';
                try{
                    const resp = await fetch(`api/images/comment/${imageid}`,{
                        method: 'POST',
                        body: JSON.stringify({comment : commentInput}),
                        headers: {'Content-Type': 'application/json'}
                    });
                    const result = await resp.json();
                    if (!resp.ok){
                        result.message? showAlert(result.message) :null;
                        return;
                    }
                    await this.updateComment(imageid, col);
                    //check the comment section -> if it was open -> add comment with keep flag
                    const commentSec = col.querySelector(`#comments-section-${imageid}`);
                    if (commentSec.classList.contains("visible"))
                        await this.showComments(imageid, col, true);
                    }
                catch(error)
                {
                    console.error("Error event submit", error);
                }
            }
        });
    }

    
    renderCard(image){
        const col = document.createElement('div');
                col.className = 'col-12 col-sm-6 col-md-4'; // Responsive grid layout
                col.innerHTML = `
                <div class="card h-100 border-0 shadow-sm image-card">
                    <!-- Image -->
                    <div class="card-img-container">
                        <div class="placeholder"></div> <!-- Placeholder -->
                        <img src="${image.url}" class="card-img-top d-none" alt="${image.title}" onload="this.classList.remove('d-none'); this.previousElementSibling.style.display='none';">
                    </div>
                    <!-- Card Body -->
                    <div class="card-body d-flex justify-content-start align-items-center py-2 gap-3">
                        <div class="d-flex align-items-center">
                            <button class="like-button" id="like-button-${image.id}">
                                <img src="./assets/like.png" alt="Like" class="like-icon" id="like-icon-${image.id}">
                            </button>
                            <span class="like-count ms-1" id="likes-${image.id}">0</span> <!-- Likes -->
                        </div>
                        <div class="d-flex align-items-center">
                            <button class="like-button" id="comment-button-${image.id}">
                                <img src="./assets/comment.png" alt="comment" class="like-icon">
                            </button>
                            <span class="like-count ms-1" id="comments-${image.id}">0</span> <!-- Comments -->
                        </div>
                    </div>
                    <!-- Card Footer -->
                    <div class="card-footer bg-light p-2">
                        <div id="comments-section-${image.id}" class="comments-section mt-2"> </div><!-- Comments will be dynamically loaded here -->
                        <input type="text" class="form-control form-control-sm" placeholder="Add a comment..." id="comment-form-${image.id}">
                    </div>
                </div>
                `;
            return  col;
    }
    
}


// Define the custom element
customElements.define('gallery-feed', GalleryFeed);