import { ShowSeat } from '../models/ShowSeat.js';
import { logger } from '../config/logger.js';

export const cleanupExpiredLocks = async () => {
  try {
    const result = await ShowSeat.updateMany(
      {
        status: 'LOCKED',
        lockedUntil: { $lt: new Date() }
      },
      {
        $set: {
          status: 'AVAILABLE',
          lockedBy: null,
          lockedUntil: null
        }
      }
    );

    if (result.modifiedCount > 0) {
      logger.info(`Cleaned up ${result.modifiedCount} expired seat locks`);
    }
  } catch (error) {
    logger.error(`Error in seat lock cleanup job: ${error.message}`);
  }
};

// Start the periodic job
export const startSeatLockCleanupJob = () => {
  // Run every 1 minute
  setInterval(cleanupExpiredLocks, 60 * 1000);
  logger.info('Seat lock cleanup job started');
};
