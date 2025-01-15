class GalleryFeed extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {

        //LATER ON MAKE THE MODAL A COMPONENT
        this.innerHTML = `
            <div class="row g-4" id="gallery"></div>
            <div class="d-flex justify-content-center mt-4" id="pagination"></div>

            <!-- Modal for Comments -->
            <div class="modal fade" id="commentsModal" tabindex="-1" aria-labelledby="commentsModalLabel" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="commentsModalLabel">Comments</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <!-- Comments will be dynamically loaded here -->
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.fetchImages(); // Default to page 1
    }

    async fetchImages(page = 1, limit = 6) {
        try {
            const response = await fetch(`/api/images?page=${page}&limit=${limit}`);
            if (!response.ok) throw new Error('Failed to fetch images');

            const data = await response.json();
            const gallery = this.querySelector('#gallery');
            gallery.innerHTML = ''; // Clear previous images

            //Render each image as a card with strict ordering
            for (const image of data.images) {
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
                            <button class="like-button">
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
                        <input type="text" class="form-control form-control-sm" placeholder="Add a comment...">
                    </div>
                </div>
                `;
            
                // Update the likes
                const likeData = await fetch(`/api/images/like/${image.id}`);
                if (likeData.ok) {
                    const likeJson = await likeData.json();
                    col.querySelector(`#likes-${image.id}`).innerText = likeJson.total;
                    if (likeJson.isliked) {
                        col.querySelector(`#like-icon-${image.id}`).setAttribute('src', '/assets/liked.png');
                    }
                }
            
                // Update the comments
                const comData = await fetch(`/api/images/comment/t/${image.id}`);
                if (comData.ok) {
                    const comJson = await comData.json();
                    col.querySelector(`#comments-${image.id}`).innerText = comJson.total;
                }
            
                // Bind the comment button to the modal
                const commentButton = col.querySelector(`#comment-button-${image.id}`);
                commentButton.addEventListener('click', async () => {
                    //not working so far
                    //await this.showCommentsModal(image.id);
                });
            
                gallery.appendChild(col);
            }

            // Update pagination controls
            this.createPaginationControls(page, data.total);
        } catch (err) {
            console.error(err);
            this.querySelector('#gallery').innerHTML = '<p>Error loading images</p>';
        }
    }

    createPaginationControls(currentPage, totalItems) {
        const pagination = this.querySelector('#pagination');
        pagination.innerHTML = ''; // Clear previous controls
        const limit = 6; // Items per page
        const totalPages = Math.ceil(totalItems / limit);

        for (let i = 1; i <= totalPages; i++) {
            const button = document.createElement('button');
            button.textContent = i;
            button.className = i === currentPage ? 'btn btn-primary' : 'btn btn-outline-primary';
            button.onclick = () => this.fetchImages(i); // Fetch images for the selected page
            pagination.appendChild(button);
        }
    }
}

// Define the custom element
customElements.define('gallery-feed', GalleryFeed);
