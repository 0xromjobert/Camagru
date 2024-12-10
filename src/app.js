const express = require('express');
const signupRoutes = require('./routes/auth');

const app = express();

//
app.use(express.json());

// Mount the auth routes at a specific path
app.use('/auth', signupRoutes);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

module.exports = app;