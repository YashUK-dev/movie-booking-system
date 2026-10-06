import app from './app.js';
import { connectDB } from './config/database.js';
import { logger } from './config/logger.js';
import { config } from './config/env.js';
import { startSeatLockCleanupJob } from './jobs/seatLockCleanup.job.js';

const startServer = async () => {
  try {
    await connectDB();
    
    const server = app.listen(config.port, () => {
      logger.info(`Server running in ${config.env} mode on port ${config.port}`);
    });

    // Start background jobs
    startSeatLockCleanupJob();

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
      logger.error(`Unhandled Rejection: ${err.message}`);
      // Close server & exit process
      server.close(() => process.exit(1));
    });

  } catch (error) {
    logger.error(`Error starting server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
