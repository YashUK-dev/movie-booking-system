# Movie Booking System

A full-stack, production-ready movie booking platform. This system includes a secure Node.js/Express/MongoDB backend and a modern React/Vite frontend.

## 🚀 Features
- **Authentication:** Secure JWT-based login, registration, and role management (USER/ADMIN).
- **Movies & Theatres:** Complete CRUD operations for movies, theatres, and screens.
- **Show Scheduling:** Advanced show scheduling with seat inventory generation and overlap prevention.
- **Seat Booking:** Real-time seat locking (5-minute timer) with concurrency control to prevent double booking.
- **Payments:** Mock payment gateway integration with booking confirmation workflows.
- **Admin Dashboard:** Revenue and booking statistics.

## 🛠️ Tech Stack
- **Frontend:** React, Vite (Proxy configured for seamless API integration).
- **Backend:** Node.js, Express.js.
- **Database:** MongoDB (with Mongoose ORM and Transaction support).
- **Security:** Helmet, Express Rate Limit, bcryptjs, JSON Web Tokens.

## 📂 Folder Structure
```
movie-booking-system/
├── backend/            # Express REST API, MongoDB Models, Controllers
├── frontend/           # React + Vite application
├── .gitignore          # Root Git ignore rules
└── README.md           # Project documentation
```

## ⚙️ Backend Setup & Running
1. `cd backend`
2. `npm install`
3. Create a `.env` file (ask the lead developer for development credentials, or refer to `.env.example`).
4. Run the development server: `npm run dev`
5. The API will start on `http://localhost:5000/api/v1`
6. API Documentation (Swagger) is available at `http://localhost:5000/api-docs`

## 🎨 Frontend Setup & Running
1. `cd frontend`
2. `npm install`
3. Create a `.env` file (copy from `.env.example`).
4. Run the development server: `npm run dev`
5. Access the app at `http://localhost:3000` (API requests are automatically proxied to port 5000).

## 🌿 Git Workflow & Branch Structure
This repository follows a feature-branching workflow for team collaboration.
- `main` - Stable production code. (Do not push here directly!)
- `develop` - Integration branch. All features merge here first.
- Feature Branches - e.g., `frontend/home`, `backend/core`.

**All team members should read the `TEAM_HANDOVER_GUIDE.md` before starting work.**
