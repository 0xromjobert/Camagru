class GalleryFeed extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.innerHTML = `
            <div class="row g-4" id="gallery"></div>
            <div class="d-flex justify-content-center mt-4" id="pagination"></div>
        `;

        this.fetchImages(); // Default to page 1
    }

    async fetchImages(page = 1, limit = 6) {
        try {
            const response = await fetch(`/api/images?page=${page}&limit=${limit}`);
            if (!response.ok) throw new Error('Failed to fetch images');

            const data = await response.json();
            //console.log("loaded data are", data);
            const gallery = this.querySelector('#gallery');
            gallery.innerHTML = ''; // Clear previous images

            // Render each image as a card
            data.images.forEach((image) => {
                const col = document.createElement('div');
                col.className = 'col-12 col-sm-6 col-md-4'; // Responsive grid layout
                col.innerHTML = `
                <div class="card h-100 border-0 shadow-sm image-card">
                <a href="/image/${image.id}" class="d-block">
                    <div class="card-img-container">
                        <img src="${image.url}" class="card-img-top" alt="${image.title}">
                    </div>
                </a>
            </div>
        `;
                gallery.appendChild(col);
            });

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
