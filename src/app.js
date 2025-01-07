const express = require('express');
const authRoutes = require('./routes/authPages');
const profileRoutes = require('./routes/profile');
const authAPI = require('./api/auth');
const userAPI = require('./api/userPage')
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

// Mount the auth routes at a specific path for html Pages
app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

module.exports = app;