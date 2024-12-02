require('dotenv').config(); // Load environment variables from .env

module.exports = {
  development: {
    username: process.env.DB_USER,      // Database username
    password: process.env.DB_PASSWORD, // Database password
    database: process.env.DB_NAME,     // Database name
    host: process.env.DB_HOST,         // Database host
    dialect: "postgres",               // Database dialect
    port: process.env.DB_PORT || 5432, // Database port (default: 5432)
    logging: console.log,              // Log SQL queries (use false to disable)
  },
};