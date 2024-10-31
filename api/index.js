import app from '../backend/src/app.js'; // Adjust the path if necessary
import connectDB from '../backend/src/db/index.js'; // Adjust the path if necessary
import pino from 'pino';

const logging = pino();

const startServer = async () => {
  try {
    await connectDB(); // Wait for the DB connection
    logging.info('Database connected successfully'); // Optional logging
  } catch (error) {
    logging.error('Error connecting to the database:', error);
    process.exit(1);
  }
};

// Vercel handles requests differently; no need to call app.listen
startServer(); // Call the function to initialize DB connection
export default app; // Export the app for Vercel
