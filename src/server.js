const app = require('./app');
const {connectToDatabase} = require('./config/database');
const applyMigrations = require('./utils/migrations');


const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await connectToDatabase();
    await applyMigrations();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
}

startServer();