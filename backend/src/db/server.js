// server.js
import app from './app'; // Import your Express app
import connectDB from '../db/index.js'; // Adjust the path
import pino from 'pino';

const logging = pino();

const startServer = async () => {
  try {
    await connectDB(); // Wait for the DB connection
    const PORT = process.env.PORT || PORT; // Use the port from environment variables

    app.listen(PORT, () => {
      logging.info(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    logging.error('Error starting server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();
