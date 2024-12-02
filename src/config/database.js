const {Sequelize} = require('sequelize');

// Load environment variables from .env file
require('dotenv').config({ path: '../../.env' });

const sequelize = new Sequelize(
    process.env.DB_NAME, 
    process.env.DB_USER, 
    process.env.DB_PASSWORD, 
    {
        host: process.env.DB_HOST,
        dialect: 'postgres',
        port: process.env.DB_PORT,
        logging: false,   
    });

// Test connection
sequelize.authenticate().then(() => {
  console.log('Database connection established');
})
.catch((error) => {
  console.error('Unable to connect to the database:', error);
});

module.exports = sequelize;