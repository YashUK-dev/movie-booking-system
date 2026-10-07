# 🎬 Movie Booking System — Team Handover Guide

Welcome to the Movie Booking System project! This guide is designed to help everyone (even if you are completely new to Git or backend integration) understand exactly how to set up your environment, connect to the backend, and build your assigned module.

---

## 🏗️ 1. The Team Architecture

We are building a full-stack application. The **Backend** (Node.js/Express) is already 100% complete. It handles the database, security, and APIs. The **Frontend** (React/Vite) is split into 5 different modules.

### How Our Code is Organized (Branches)

We use Git branches to keep everyone's work safe. Think of a branch as a separate "save file" of the project.

```text
                GitHub
                  |
                main        (Stable final code. NEVER push here directly!)
                  |
               develop      (Integration branch. We combine our work here!)
                  |
   -------------------------------------------------
   |          |          |          |              |
 Teammate 1 Teammate 2 Teammate 3 Teammate 4     Teammate 5
   |          |          |          |              |
frontend/  frontend/  frontend/  frontend/      frontend/
  home    movie-shows seat-selection booking-payment profile-admin
```

*   **`main`**: The final, perfect version of our app.
*   **`develop`**: The "testing ground" where we combine everyone's finished features.
*   **`frontend/*` branches**: Your personal workspace. You only write code in your assigned branch.

To combine your work into `develop`, you will create a **Pull Request (PR)** on GitHub. A Pull Request simply means: *"Hey team, my feature is done, please review it and merge it into the main project (`develop`)."*

---

## 🛠️ 2. Step-by-Step Setup Guide

Follow these exact steps to get the project running on your computer.

### Step 1: Accept GitHub Invitation
Check your email for an invitation to the GitHub repository and accept it.

### Step 2: Install Required Software
Make sure you have installed:
1.  **Git** (to download and upload code).
2.  **Node.js** (to run our app).

### Step 3: Clone the Repository
Open your terminal (Command Prompt, PowerShell, or VS Code terminal) and type:

```bash
git clone https://github.com/YashUK-dev/movie-booking-system.git
cd movie-booking-system
```

### Step 4: Get the Latest Code
Download all the latest branches from GitHub and switch to the integration branch:

```bash
git fetch --all
git checkout develop
git pull origin develop
```

### Step 5: Switch to Your Assigned Branch
Look at the team assignments at the bottom of this document, find your branch name, and switch to it. For example, if you are Teammate 1:

```bash
git checkout frontend/home
```
*(Note: `git checkout <branch>` switches your active workspace to that branch. `git pull` downloads new code from the internet.)*

---

## 🚀 3. Running the Project Locally

Because the frontend talks to the backend, **you must have both running at the same time in two separate terminal windows.**

### Terminal 1: Start the Backend

1. Open a terminal and go to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create your environment file:
   Ask the backend developer for the `.env` credentials, or create a file named `.env` inside the `backend` folder and paste the credentials they give you. (This file connects you to the MongoDB database).
4. Start the server:
   ```bash
   npm run dev
   ```
   *You should see "Server running... MongoDB Connected". Leave this terminal open!*

### Terminal 2: Start the Frontend

1. Open a **new** terminal and go to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create the frontend environment file. Create a file named `.env` inside the `frontend` folder and add this exactly:
   ```text
   VITE_API_URL=http://localhost:5000/api/v1
   ```
4. Start the React app:
   ```bash
   npm run dev
   ```
   *Your frontend is now running at `http://localhost:3000`!*

---

## 🔌 4. How the Frontend Connects to the Backend (CRITICAL)

Our frontend is configured with a **Vite Proxy**. This makes it very easy to call backend APIs.

You do **NOT** need to write `http://localhost:5000` in your code!

Because of the proxy, if you want to get movies from the backend (`http://localhost:5000/api/v1/movies`), you just call `/api/v1/movies` in your frontend code:

**Example:**
```javascript
// ✅ Do this:
const response = await fetch('/api/v1/movies');
const movies = await response.json();

// ❌ Never do this:
const response = await fetch('http://localhost:5000/api/v1/movies');
```

### Authentication (Logging in)
Our backend uses **JWT Bearer Tokens**.
When a user logs in (`POST /api/v1/auth/login`), the backend gives you an `accessToken`.
1. Save this token in your browser: `localStorage.setItem('accessToken', token);`
2. Our setup uses `axios`. We have already configured `frontend/src/api/axiosInstance.js` to automatically attach this token to every request you make!
3. Therefore, always use `axiosInstance` for making API calls instead of standard `fetch`.

---

## 📝 5. Daily Git Workflow

Every day when you start working, you should get the latest code that your teammates finished, and then continue working on your branch.

**Daily Start Routine:**
```bash
# 1. Save any work you are currently doing
git add .
git commit -m "save work"

# 2. Go to the integration branch and get the latest updates
git checkout develop
git pull origin develop

# 3. Go back to your branch and merge the updates into your code
git checkout <your-branch-name>
git merge develop
```

**How to Save and Upload Your Work:**
When you finish a feature, upload it to GitHub:
```bash
git status                     # See what files you changed
git add .                      # Prepare all changed files for saving
git commit -m "Add movie cards" # Save the files with a descriptive message
git push origin <your-branch>  # Upload your save to GitHub
```

**Merge Conflicts?**
If you and a teammate edited the exact same line of code, Git will say "Merge Conflict". Don't panic! VS Code will highlight the conflict. Simply click "Accept Current Change" or "Accept Incoming Change", save the file, and run `git add .` followed by `git commit -m "Resolve conflict"`.

---

## ✋ 6. Important Frontend vs Backend Rule

The Backend Developer owns the database, APIs, security, and business logic.
You (Frontend Developers) own the UI, components, forms, API calls, and responsive design.

**DO NOT MODIFY BACKEND CODE.**

If you need a new API, or if an API is returning an error you don't understand:
1. Message the backend developer.
2. The backend developer will fix/add it.
3. They will tell you when it's done.
4. Run `git checkout develop`, `git pull origin develop`, `git checkout <your-branch>`, `git merge develop` to get their new backend code.

---

## 👩‍💻 7. Team Assignments & Tasks

Here is exactly what everyone is building, which branch to use, and which backend APIs to call.

### 👤 A. Backend Developer (Lead)
- **Branch:** `backend/core`
- **What you do:** You have already completed the backend! Moving forward, your job is to review Pull Requests, fix backend bugs if the frontend team finds any, and ensure the database remains stable.

### 👤 B. Teammate 1 (Home & Discovery)
- **Branch:** `frontend/home`
- **What you do:** Build the landing page, show a list of currently running movies, and allow users to search/filter movies.
- **APIs You Will Use:**
  - `GET /api/v1/movies` (List movies)
  - `GET /api/v1/movies?status=NOW_SHOWING` (Filter movies)

### 👤 C. Teammate 2 (Movie Details & Shows)
- **Branch:** `frontend/movie-shows`
- **What you do:** When a user clicks a movie, show its details. Then, let the user select a date and see which theatres are playing this movie and at what times (Shows).
- **APIs You Will Use:**
  - `GET /api/v1/movies/:movieId` (Get movie details)
  - `GET /api/v1/shows?movieId=XYZ&date=2026-10-08` (Get shows for this movie on a specific date)

### 👤 D. Teammate 3 (Seat Selection)
- **Branch:** `frontend/seat-selection`
- **What you do:** Build the interactive cinema seat layout. Show which seats are booked vs available. Let the user click to select seats, and lock them temporarily.
- **APIs You Will Use:**
  - `GET /api/v1/shows/:showId/seats` (Get the seat map and availability)
  - `POST /api/v1/shows/:showId/seats/lock` (Lock the chosen `seatId`s for 5 minutes)

### 👤 E. Teammate 4 (Booking & Payment)
- **Branch:** `frontend/booking-payment`
- **What you do:** Show the user their order summary, calculate convenience fees, create the booking, and simulate a payment gateway.
- **APIs You Will Use:**
  - `POST /api/v1/bookings` (Create a pending booking using the locked `seatId`s)
  - `POST /api/v1/payments` (Pay for the booking)

### 👤 F. Teammate 5 (Auth, Profiles & Admin)
- **Branch:** `frontend/profile-admin`
- **What you do:** Build the Login and Registration screens. Build a profile page where users can see their past bookings. Build a basic Admin dashboard showing platform stats.
- **APIs You Will Use:**
  - `POST /api/v1/auth/login` (Login user)
  - `POST /api/v1/auth/register` (Register user)
  - `GET /api/v1/bookings` (Get my past bookings)
  - `GET /api/v1/admin/dashboard` (Get admin stats - requires ADMIN login)

---

## ✅ 8. Your First Day Checklist

Before you write any code, ensure you can check off every box:

- [ ] Git installed on my computer.
- [ ] I accepted the GitHub repository invitation.
- [ ] I cloned the repository (`git clone ...`).
- [ ] I checked out the `develop` branch and ran `git pull`.
- [ ] I checked out my assigned `frontend/...` branch.
- [ ] I ran `npm install` inside the `backend` folder.
- [ ] I ran `npm install` inside the `frontend` folder.
- [ ] I created the `backend/.env` file with the database credentials.
- [ ] I created the `frontend/.env` file.
- [ ] I successfully started the backend (`npm run dev`).
- [ ] I successfully started the frontend (`npm run dev`).
- [ ] I understand my assigned module.

**Good luck, and have fun building the Movie Booking System!**
