// api/index.js

import app from '../backend/src/app.js'; // Adjust the path if necessary
import connectDB from '../backend/src/db/index.js'; // Adjust the path if necessary
import pino from 'pino';

const logging = pino();

const startServer = async () => {
  try {
    await connectDB(); // Wait for the DB connection

    // Vercel handles this differently; you don't need to use app.listen
    app.listen(process.env.PORT || 8000, () => {
      logging.info(`Server running for Vercel on port ${process.env.PORT || 8000}`);
    });
  } catch (error) {
    logging.error('Error starting Vercel server:', error);
    process.exit(1);
  }
};

startServer();
