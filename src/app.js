const express = require('express');
const userRoutes = require('./routes/auth');

const app = express();

//
app.use(express.json());

// Mount the auth routes at a specific path
app.use('/auth', userRoutes);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

module.exports = app;