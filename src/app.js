const express = require('express');
const authRoutes = require('./routes/authPages');
const profileRoutes = require('./routes/profile');
const authAPI = require('./api/auth');
const userAPI = require('./api/userPage')
const imageAPI = require('./api/images')
const camAPI = require('./api/camera')
const galleryRoutes = require('./routes/gallery')
const cameraRoutes = require('./routes/camera');
const path = require('path');
const app = express();
const cookieparser = require('cookie-parser');

//using classic midware for json and cookie hanlding
app.use(express.json());
app.use(cookieparser());

// Mounting public dir to Serve static files 
app.use(express.static(path.join(__dirname,'../public')));

//mounting api routes
app.use('/api/auth', authAPI);
app.use('/api/user', userAPI);
app.use('/api/images', imageAPI);
app.use('/api/camera', camAPI);

// Mount the auth routes at a specific path for html Pages
app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);
app.use('/camera', cameraRoutes);

app.use('/', galleryRoutes); //binding the home to the galleryRoutes

app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, "./views/404.html"));
});

module.exports = app;