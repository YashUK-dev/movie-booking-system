import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config/env.js';
import { errorMiddleware } from './middlewares/error.middleware.js';
import { notFoundMiddleware } from './middlewares/notFound.middleware.js';
import { ApiResponse } from './utils/ApiResponse.js';
import authRoutes from './routes/auth.routes.js';
import movieRoutes from './routes/movie.routes.js';
import theatreRoutes from './routes/theatre.routes.js';
import screenRoutes from './routes/screen.routes.js';
import seatRoutes from './routes/seat.routes.js';
import showRoutes from './routes/show.routes.js';
import bookingRoutes from './routes/booking.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import adminRoutes from './routes/admin.routes.js';
import { setupSwagger } from '../docs/swagger.js';

const app = express();

// Security Middlewares
app.use(helmet());

// CORS Configuration
app.use(
  cors({
    origin: config.clientUrl,
    credentials: true,
  })
);

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api', limiter);

// Built-in Middleware
app.use(express.json({ limit: '10kb' })); // Body parser, limit payload size
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Health Check
app.get('/api/v1/health', (req, res) => {
  res.status(200).json(
    new ApiResponse(200, 'Server is healthy', {
      status: 'UP',
      database: 'CONNECTED', // Will update later with actual check if needed
    })
  );
});

// Setup Swagger
setupSwagger(app);

// Routes will be mounted here
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/movies', movieRoutes);
app.use('/api/v1/theatres', theatreRoutes);
app.use('/api/v1/shows', showRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/admin', adminRoutes);

// Nested routes
app.use('/api/v1/theatres/:theatreId/screens', screenRoutes);
app.use('/api/v1/screens/:screenId/seats', seatRoutes);

// Flat routes for screen and seat direct updates
app.use('/api/v1/screens', screenRoutes);
app.use('/api/v1/seats', seatRoutes);
// etc.

// 404 Handler
app.use(notFoundMiddleware);

// Global Error Handler
app.use(errorMiddleware);

export default app;
