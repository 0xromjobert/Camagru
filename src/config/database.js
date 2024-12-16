const { Pool } = require('pg');
require('dotenv').config({ path: '../../.env' }); // Load environment variables

// Create a new connection pool
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Function to test the connection
async function connectToDatabase() {
  try {
      const client = await pool.connect(); // Attempt to connect
      console.log('Database connection established');
      client.release(); // Release the connection back to the pool
  } catch (error) {
      console.error('Failed to connect to the database:', error);
      throw error; // Let the caller handle the error
  }
}

// Export a helper for executing queries
async function query(text, params) {
    const client = await pool.connect(); // Get a connection from the pool
    try {
        const result = await client.query(text, params); // Execute query
        return result; // Return the result rows
    } finally {
        client.release(); // Release client back to the pool
    }
}

module.exports = { query, connectToDatabase };


// const {Sequelize} = require('sequelize');

// // Load environment variables from .env file
// require('dotenv').config({ path: '../../.env' });

// const sequelize = new Sequelize(
//     process.env.DB_NAME, 
//     process.env.DB_USER, 
//     process.env.DB_PASSWORD, 
//     {
//         host: process.env.DB_HOST,
//         dialect: 'postgres',
//         port: process.env.DB_PORT,
//         logging: false,   
//     });

// // Test connection
// sequelize.authenticate().then(() => {
//   console.log('Database connection established');
// })
// .catch((error) => {
//   console.error('Unable to connect to the database:', error);
// });

// module.exports = sequelize;