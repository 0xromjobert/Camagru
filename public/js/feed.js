class GalleryFeed extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <style>
                #gallery {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px;
                }
                #gallery img {
                    width: 200px;
                    height: auto;
                    border-radius: 8px;
                }
            </style>
            <div id="gallery"></div>
        `;
    }

    connectedCallback() {
        this.fetchImages();
    }

    async fetchImages() {
        try {
            const response = await fetch('/api/images');
            if (!response.ok) throw new Error('Failed to fetch images');

            const data = await response.json();
            const gallery = this.shadowRoot.querySelector('#gallery');

            data.images.forEach((image) => {
                const img = document.createElement('img');
                img.src = image;
                img.alt = 'Gallery Image';
                gallery.appendChild(img);
            });
        } catch (err) {
            console.error(err);
            this.shadowRoot.querySelector('#gallery').innerHTML = '<p>Error loading images</p>';
        }
    }
}

// Define the custom element
customElements.define('gallery-feed', GalleryFeed);
