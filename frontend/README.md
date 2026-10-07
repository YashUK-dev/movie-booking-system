<<<<<<< HEAD
# Movie Booking Platform Backend

A production-ready REST API backend for a movie ticket booking platform, inspired by BookMyShow.

## Features

- **Authentication**: JWT-based auth (access and refresh tokens) with role-based access control (USER, ADMIN).
- **Core Entities**: Manage Movies, Theatres, Screens, and Seats.
- **Show Inventory**: Automatically generate seat inventory per show.
- **Seat Locking & Concurrency Control**: robust handling of concurrent bookings using MongoDB atomic updates to prevent double booking. Locks expire automatically via background jobs.
- **Booking & Payments**: Full transaction workflow from seat lock to pending booking, mock payment, and confirmation.
- **Admin Dashboard**: Real-time stats and metrics for administrators.
- **Validation**: Strict request validation using Zod.
- **Security**: Helmet, CORS, Rate Limiting, NoSQL injection protection.
- **Documentation**: Fully documented using Swagger/OpenAPI.

## Technology Stack
- Node.js & Express.js
- MongoDB & Mongoose
- JSON Web Tokens (JWT)
- bcryptjs
- Zod (Validation)
- Jest & Supertest (Testing)

## Architecture Overview

The backend uses a layered architecture:
`Client -> Routes -> Middlewares -> Controllers -> Services -> Models -> MongoDB`

- **Controllers**: Handle HTTP request/responses.
- **Services**: Contain all business logic.
- **Models**: Database schema and indexes.
- **Middlewares**: Cross-cutting concerns (Auth, Validation, Error Handling).

## Installation

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and configure your environment variables.
   ```bash
   cp .env.example .env
   ```

## Running Locally

To start the server in development mode:
```bash
npm run dev
```

To start the server in production mode:
```bash
npm start
```

## Seeding the Database

To create initial sample data (Admin user, regular user, movies, theatres, screens, seats, and shows):
```bash
npm run seed
```
**Demo Credentials:**
- Admin: `admin@bookmyshow.com` / `admin123`
- User: `user@bookmyshow.com` / `user123`

## Testing

To run the automated tests (including the critical concurrency double-booking prevention test):
```bash
npm test
```

## API Documentation

Swagger API documentation is automatically available when the server is running.
Visit: `http://localhost:5000/api-docs`

## Frontend Integration Guide

The backend is modularized for parallel consumption by 5 frontend developers:

1. **Member 1 (Home + Movie Listing)**: 
   - `GET /api/v1/movies`
   - `GET /api/v1/movies/:movieId`
2. **Member 2 (Movie Details + Shows)**: 
   - `GET /api/v1/shows` (filter by movieId)
   - `GET /api/v1/shows/:showId`
3. **Member 3 (Seat Selection)**: 
   - `GET /api/v1/shows/:showId/seats`
   - `POST /api/v1/shows/:showId/seats/lock`
4. **Member 4 (Booking + Payment)**: 
   - `POST /api/v1/bookings`
   - `POST /api/v1/payments`
5. **Member 5 (User Profile + Admin UI)**: 
   - `GET /api/v1/auth/me`
   - `GET /api/v1/bookings`
   - `GET /api/v1/admin/dashboard`

**Authentication Contract:**
Login via `POST /api/v1/auth/login`. Extract the `accessToken` from the response.
Send the token in the `Authorization` header for protected routes:
`Authorization: Bearer <accessToken>`

## Git Workflow
- `main` and `develop` branches are maintained by the backend owner.
- Frontend developers should branch off (e.g. `feature/frontend-seat`) and strictly follow the API documentation. The backend acts as an immutable contract.

## Known Limitations & Future Improvements
- **Seat Locking Engine**: Currently relies on MongoDB atomic updates and a `setInterval` cron job for lock expiration. For extreme high-scale production, replace this with a Redis-based distributed lock and TTL keys.
- **Transactions**: MongoDB transactions require a Replica Set. If running on a standalone local MongoDB without replica sets, the `session` logic will fail. To test transactions locally, convert your standalone MongoDB into a single-node replica set.
- **Payment Gateway**: The current implementation uses a simulated mock. Integrate Stripe/Razorpay SDKs in `PaymentService`.
=======
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
>>>>>>> frontend/main
