const express = require('express');
const userRoutes = require('./routes/authPages');
const authAPI = require('./api/auth');
const path = require('path');
const app = express();

app.use(express.json());

// Mounting public dir to Serve static files 
app.use(express.static(path.join(__dirname,'../public')));

//mounting api auth routes
app.use('/api/auth', authAPI);

// Mount the auth routes at a specific path
app.use('/auth', userRoutes);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

module.exports = app;