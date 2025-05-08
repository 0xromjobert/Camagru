# Camagru

**Camagru** is a full-stack photo-editing web application built as part of the **42 school advanced curriculum**. It challenges students to build a responsive, secure, and fully containerized web app without relying on third-party frameworks beyond what is allowed in the PHP standard library (or its equivalent in another stack). This project was developed using a modern JavaScript/Node.js stack in strict adherence to the subject’s constraints.

---

## School Project Context

This application is a **mandatory evaluation project at 42**, where students must:

- Build a photo editing web application (webcam + sticker overlays).
- Implement image superposition on the **server side**.
- Ensure all images are **likeable** and **commentable**, with pagination.
- Allow account creation with **email confirmation** and password reset.
- Build **containerized** services with up-to-date practices (Docker).
- Use **no unauthorized libraries** and maintain full security (CSRF/XSS safe).

### Project Constraints

As per the 42 subject:

- **Server-side** may use any language, but only with **standard library equivalents to PHP**.
- **Frontend** must be written in HTML5, CSS3, and **vanilla JavaScript** (no frontend frameworks).
- Image processing (superimposing stickers, saving uploads) must be done **on the backend**.
- All containers must be orchestrated via **Docker Compose**.
- The app must handle:
  - User authentication via JWT (homemade implementation).
  - Secure forms, cookies, and CSRF protection.
  - WebSocket-free interaction (only HTTP/Fetch).
- Bonus features (e.g., infinite scroll, animated GIFs, live previews) are evaluated **only if mandatory parts are perfect**.

---

## Interface Preview

_You can insert screenshots of the interface here_

```
[Insert screenshots here: signup page, gallery, editor, profile...]
```

---

## Application Architecture

### Tech Stack

- **Backend**: Node.js + Express.js  
- **Database**: PostgreSQL (low-level `pg` or Sequelize as fallback)  
- **Image Processing**: Sharp (server-side manipulation of uploaded or captured images)  
- **Authentication**: Custom JWT with Base64-URL encoding using Node’s `crypto`  
- **Validation**: `express-validator`, secure password hashing via `bcrypt`  
- **Frontend**: Pure HTML/CSS + JavaScript (Bootstrap for layout, no external JS frameworks)  
- **Containerization**: Docker & Docker Compose (multi-service setup)

### Auth System

- Uses **homemade JWT**: header, payload, and signature signed with HMAC-SHA256 via `crypto`.
- Tokens are stored securely in **HttpOnly cookies** to avoid XSS.
- Middleware handles cookie validation and automatic redirect on invalid tokens.
- Includes **email verification** and **password reset** flow with expiring tokens.

### Image Editing

- Users can capture a picture using their **webcam** or **upload an image**.
- Stickers can be **dragged-and-positioned** before capture.
- A canvas is used client-side to **preview**, but all final rendering is **done server-side**.

### Gallery & Infinite Scroll

- Images are stored with associated metadata (creator, likes, comments).
- Users can **like**, **comment**, and view **paginated or infinite-scroll feeds**.
- Infinite scroll is implemented with a **sentinel** and `IntersectionObserver` to avoid heavy event listeners and race conditions.

### File Structure

```
camagru/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── views/
│   │   ├── middleware/
│   │   ├── utils/
│   │   ├── config/
│   │   └── app.js, server.js
├── public/
│   ├── css/
│   ├── js/
│   ├── assets/
│   └── uploads/
├── database/
│   ├── migrations/
│   ├── seeds/
├── docker-compose.yml
├── Dockerfile
├── README.md
└── .env
```

---


## Setup Instructions

### 1. Clone and Configure

```bash
git clone https://github.com/YOUR_USERNAME/camagru
cd camagru
cp .env.example .env  # Fill in the credentials
```

### 2. Build and Run with Docker

```bash
make all  # or
docker-compose up --build
```

Application will be available at: [http://localhost:3000](http://localhost:3000)

---

## ✅ Bonus Features Implemented

- [x] Infinite scroll gallery
- [x] Drag-and-drop stickers with accurate canvas overlay
- [x] AJAX-enhanced UI updates
- [x] Dynamic like/comment system with live updates

---

## License

This project is licensed under the MIT License – see the [LICENSE](./LICENSE) file for details.
