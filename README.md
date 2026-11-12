# CGPA Studio — Full-Stack Backend Integration
> **Node.js • Express.js • MongoDB Atlas • Mongoose • JWT Authentication • REST APIs**

An enterprise-grade, student-friendly full-stack web application extending the **CGPA Studio** relative grading simulator with a robust Node.js and Express backend, MongoDB Atlas database persistence, secure JWT authentication via HttpOnly cookies, and complete CRUD operations.

---

## 📋 Table of Contents
1. [Project Overview & Objectives](#-project-overview--objectives)
2. [Technology Stack](#-technology-stack)
3. [System Architecture & Directory Structure](#-system-architecture--directory-structure)
4. [Prerequisites](#-prerequisites)
5. [Step-by-Step MongoDB Atlas Setup Guide](#-step-by-step-mongodb-atlas-setup-guide)
6. [Environment Configuration (.env)](#-environment-configuration-env)
7. [Installation & Running the Application](#-installation--running-the-application)
8. [REST API Documentation & Examples](#-rest-api-documentation--examples)
9. [Postman Testing & Collection Import](#-postman-testing--collection-import)
10. [Automated Verification Test Suite](#-automated-verification-test-suite)
11. [Common Errors & Troubleshooting](#-common-errors--troubleshooting)
12. [Demonstration Screenshots (Placeholders)](#-demonstration-screenshots-placeholders)
13. [GitHub Submission Instructions](#-github-submission-instructions)

---

## 🎯 Project Overview & Objectives

**CGPA Studio** was originally developed as an academic simulator tailored for **BML Munjal University (BMU)** B.Tech Computer Science & Engineering students to model statistical relative grading curves ($\mathcal{N}(\mu, \sigma)$) and reverse-calculate minimum End-Sem marks required to attain a target CGPA.

This backend project fulfills all requirements of the **"Backend Tutorial (Node, Express and MongoDB)"** college assignment:
* **Separation of Concerns:** Modular Express application with dedicated controllers, routes, models, middleware, and utilities.
* **Database Modeling:** Real Mongoose schemas for `User` (with bcrypt password hashing) and `AcademicPlan` (structured academic records with embedded course objects).
* **Secure Authentication:** User registration, credential verification, and stateless JWT authorization delivered via `HttpOnly` cookies.
* **Full CRUD Functionality:** Create, Read (all/single), Update (partial PATCH), and Delete academic plans with strict ownership isolation.
* **Frontend-Backend Integration:** Connects the client-side calculator to the cloud database while preserving seamless local offline usage for guests.
* **Postman API Validation:** Complete, pre-configured Postman test collection with automated test assertions and variable extraction.

---

## 💻 Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Runtime & Server** | Node.js (v18+ / v20+ / v24+), Express.js 4 (ES Modules) |
| **Database & ODM** | MongoDB Atlas (Cloud Cluster), Mongoose 8 |
| **Authentication & Security** | JSON Web Tokens (`jsonwebtoken`), `bcryptjs` password hashing, `cookie-parser` (`HttpOnly`, `SameSite: Lax`) |
| **Environment Config** | `dotenv` |
| **Testing** | Node.js Native Test Runner (`node --test`), `mongodb-memory-server` (offline integration tests), Postman Desktop |
| **Frontend** | Vanilla JavaScript (ES Modules), HTML5 Canvas (Bell Curve), CSS3 (Aura Neo-Brutalist Design System) |

---

## 📁 System Architecture & Directory Structure

```text
CGPA-Studio-Backend/
├── public/                                # Static frontend assets served by Express
│   ├── index.html                         # Interactive UI, KPI stats, charts, modal windows
│   ├── styles.css                         # Aura Neo-Brutalist design system & millimeter grid
│   ├── app.js                             # Client-side state manager & cloud sync controller
│   ├── api.js                             # Reusable fetch client with credential forwarding
│   ├── curriculum.js                      # BMU B.Tech CSE Semester 1-8 curriculum database
│   ├── relative-engine.js                 # Statistical Gaussian distribution & cutoff engine
│   ├── endsem-solver.js                   # Target SGPA reverse marks solver
│   ├── ai-advisor.js                      # Conversational academic copilot & wizard
│   └── assets/                            # Design previews and branding assets
├── backend/
│   ├── config/
│   │   └── database.js                    # Mongoose connection logic & status reporter
│   ├── models/
│   │   ├── user.model.js                  # User schema with bcrypt pre-save hashing & safe JSON
│   │   └── academicPlan.model.js          # AcademicPlan schema with embedded courses
│   ├── controllers/
│   │   ├── auth.controller.js             # Register, Login, Logout, and GetMe handlers
│   │   └── academicPlan.controller.js     # Complete CRUD business logic with ownership checks
│   ├── routes/
│   │   ├── auth.routes.js                 # Authentication route declarations
│   │   └── academicPlan.routes.js         # Protected Academic Plan CRUD route declarations
│   ├── middleware/
│   │   ├── auth.middleware.js             # JWT verification from cookies or Bearer header
│   │   └── error.middleware.js            # Centralized JSON error & 404 handler
│   └── utils/
│       └── generateToken.js               # JWT signing & HttpOnly cookie setter
├── postman/
│   └── CGPA-Studio-API.postman_collection.json # Exported Postman collection with tests & variables
├── tests/
│   ├── backend.test.js                    # Automated integration tests for all REST endpoints
│   ├── curriculum.test.js                 # Curriculum data integrity tests
│   ├── relative-engine.test.js            # Statistical math unit tests
│   ├── endsem-solver.test.js              # Reverse solver unit tests
│   └── ai-advisor.test.js                 # Academic advisor reasoning tests
├── .env.example                           # Example environment template (no credentials)
├── .gitignore                             # Git exclusion rules
├── package.json                           # Node.js project configuration & dependencies
├── server.js                              # Express application entry point
└── README.md                              # Project documentation
```

---

## ⚙️ Prerequisites

* **Node.js**: Version 18.x, 20.x, or 24.x installed ([Download Node.js](https://nodejs.org/)).
* **npm**: Version 9.x or later (bundled with Node.js).
* **Git**: Installed for version control.
* **Postman Desktop Application**: For endpoint verification ([Download Postman](https://www.postman.com/downloads/)).
* **A Web Browser**: Google Chrome, Mozilla Firefox, Microsoft Edge, or Safari.

Check your installation in your terminal:
```bash
node -v
npm -v
git --version
```

---

## ☁️ Step-by-Step MongoDB Atlas Setup Guide

Follow these steps to create your free online MongoDB database cluster:

### Step 1: Create a Free MongoDB Atlas Account
1. Visit [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas/register).
2. Sign up with your email or Google account and accept the terms.

### Step 2: Deploy a Free M0 Shared Cluster
1. On the Atlas dashboard, click **"Create"** or **"Build a Database"**.
2. Select the **M0 Free** (Shared) tier.
3. Choose a cloud provider and region close to you (e.g., AWS / `ap-south-1` Mumbai).
4. Give your cluster a name (e.g., `Cluster0`) and click **"Create Deployment"**.

### Step 3: Create a Database User
1. Under **"Security Quickstart"**, choose **"Username and Password"**.
2. Enter a username (e.g., `cgpa_admin`).
3. Enter or generate a secure password (avoid special characters like `@` or `:` inside the password to prevent URI encoding issues, or URL-encode them).
4. Click **"Create User"**. *Remember these credentials!*

### Step 4: Configure Network Access (IP Whitelist)
1. In the same setup screen (or via the left sidebar under **Security > Network Access**):
2. Click **"Add IP Address"**.
3. Choose **"Allow Access from Anywhere"** (`0.0.0.0/0`) so you can connect from your home Wi-Fi, college campus, or laptop hotspot.
4. Click **"Confirm"**.

### Step 5: Obtain Your Connection String
1. Go to **Databases** on the left menu and click the **"Connect"** button next to your cluster.
2. Select **"Drivers"** (Node.js).
3. Copy the connection string provided. It will look like:
   ```text
   mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/?retryWrites=true&w=majority
   ```
4. Replace `<username>` and `<password>` with the credentials you created in Step 3.
5. Append your target database name (e.g., `/cgpa-studio`) right before the `?retryWrites=true`:
   ```text
   mongodb+srv://cgpa_admin:MyPassword123@cluster0.xxxx.mongodb.net/cgpa-studio?retryWrites=true&w=majority
   ```

---

## 🔐 Environment Configuration (.env)

In the root directory of `CGPA-Studio-Backend/`:

1. Copy `.env.example` to create your local `.env` file:
   * **PowerShell**:
     ```powershell
     Copy-Item .env.example .env
     ```
   * **Bash / Mac / Linux**:
     ```bash
     cp .env.example .env
     ```
2. Open `.env` and fill in your actual connection string and a secret key:
   ```env
   PORT=3000
   NODE_ENV=development
   MONGODB_URI=mongodb+srv://cgpa_admin:MyPassword123@cluster0.xxxx.mongodb.net/cgpa-studio?retryWrites=true&w=majority
   JWT_SECRET=my_ultra_secure_jwt_secret_key_bmu_2026_xyz
   ```

> [!CAUTION]
> **Security Rule:** Never commit your `.env` file to GitHub! The `.gitignore` file already excludes `.env` to protect your database credentials and secrets.

---

## 🚀 Installation & Running the Application

### 1. Install Dependencies
Open your terminal in `CGPA-Studio-Backend/` and run:
```bash
npm install
```

### 2. Start the Development Server (with Auto-Reload)
```bash
npm run dev
```

### 3. Start the Production Server
```bash
npm start
```

### 4. Open in Your Browser
Once started, navigate to:
👉 **[http://localhost:3000](http://localhost:3000)**

* Health Check: `http://localhost:3000/api/health`

---

## 📡 REST API Documentation & Examples

All API requests and responses use standard JSON (`Content-Type: application/json`).

### 1. Health Check
* **Endpoint:** `GET /api/health`
* **Access:** Public
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "CGPA Studio API is running",
    "database": "connected"
  }
  ```

---

### 2. Authentication APIs

#### Register Student
* **Endpoint:** `POST /api/auth/register`
* **Access:** Public
* **Request Body:**
  ```json
  {
    "name": "Pratham Singh",
    "email": "student@example.com",
    "password": "studentPassword123"
  }
  ```
* **Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Student account registered successfully",
    "data": {
      "_id": "6732f1a9b2c3d4e5f6789012",
      "name": "Pratham Singh",
      "email": "student@example.com",
      "createdAt": "2026-11-12T14:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```
  *(An `HttpOnly` cookie named `token` is automatically attached to the browser response).*

#### Login Student
* **Endpoint:** `POST /api/auth/login`
* **Access:** Public
* **Request Body:**
  ```json
  {
    "email": "student@example.com",
    "password": "studentPassword123"
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Logged in successfully",
    "data": {
      "_id": "6732f1a9b2c3d4e5f6789012",
      "name": "Pratham Singh",
      "email": "student@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

#### Get Current Logged-in Student Profile
* **Endpoint:** `GET /api/auth/me`
* **Access:** Protected (requires valid JWT cookie or `Authorization: Bearer <token>`)
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "_id": "6732f1a9b2c3d4e5f6789012",
      "name": "Pratham Singh",
      "email": "student@example.com",
      "createdAt": "2026-11-12T14:30:00.000Z"
    }
  }
  ```

#### Logout Student
* **Endpoint:** `POST /api/auth/logout`
* **Access:** Public
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Logged out successfully"
  }
  ```

---

### 3. Academic Plans CRUD APIs

#### Create Academic Plan (POST)
* **Endpoint:** `POST /api/plans`
* **Access:** Protected (Student must be logged in)
* **Request Body:**
  ```json
  {
    "name": "Semester 3 Planning",
    "currentCGPA": 7.82,
    "completedCredits": 42,
    "targetCGPA": 8.50,
    "semester": 3,
    "programId": "cse",
    "relativePreset": "moderate",
    "mean": 62,
    "sd": 14,
    "courses": [
      {
        "code": "CSE201",
        "name": "Data Structures and Algorithms",
        "credits": 4,
        "type": "Core Computing",
        "internalMarks": 36,
        "maxInternal": 50,
        "maxEndSem": 50,
        "endSemMarks": 38
      },
      {
        "code": "CSE202",
        "name": "Discrete Mathematical Structures",
        "credits": 4,
        "type": "Core Science",
        "internalMarks": 35,
        "maxInternal": 50,
        "maxEndSem": 50,
        "endSemMarks": 36
      }
    ]
  }
  ```
* **Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Academic plan created successfully",
    "data": {
      "_id": "6732f2b8c9d0e1f2a3b4c5d6",
      "user": "6732f1a9b2c3d4e5f6789012",
      "name": "Semester 3 Planning",
      "currentCGPA": 7.82,
      "completedCredits": 42,
      "targetCGPA": 8.50,
      "semester": 3,
      "programId": "cse",
      "relativePreset": "moderate",
      "mean": 62,
      "sd": 14,
      "courses": [...],
      "createdAt": "2026-11-12T14:35:00.000Z",
      "updatedAt": "2026-11-12T14:35:00.000Z"
    }
  }
  ```

#### Get All Academic Plans (READ ALL)
* **Endpoint:** `GET /api/plans`
* **Access:** Protected
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "count": 1,
    "data": [
      {
        "_id": "6732f2b8c9d0e1f2a3b4c5d6",
        "name": "Semester 3 Planning",
        "targetCGPA": 8.5,
        "semester": 3,
        "courses": [...]
      }
    ]
  }
  ```

#### Get Single Academic Plan (READ ONE)
* **Endpoint:** `GET /api/plans/:id`
* **Access:** Protected (ownership verified)
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "_id": "6732f2b8c9d0e1f2a3b4c5d6",
      "name": "Semester 3 Planning",
      "targetCGPA": 8.5
    }
  }
  ```

#### Update Academic Plan (PATCH)
* **Endpoint:** `PATCH /api/plans/:id`
* **Access:** Protected (ownership verified)
* **Request Body:**
  ```json
  {
    "name": "Semester 3 Planning (Target 8.75)",
    "targetCGPA": 8.75
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Academic plan updated successfully",
    "data": {
      "_id": "6732f2b8c9d0e1f2a3b4c5d6",
      "name": "Semester 3 Planning (Target 8.75)",
      "targetCGPA": 8.75
    }
  }
  ```

#### Delete Academic Plan (DELETE)
* **Endpoint:** `DELETE /api/plans/:id`
* **Access:** Protected (ownership verified)
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Academic plan deleted successfully"
  }
  ```

---

## 📮 Postman Testing & Collection Import

A complete, production-ready Postman collection is included in the project:
`postman/CGPA-Studio-API.postman_collection.json`

### How to Import and Run the Tests in Postman:
1. Open the **Postman Desktop Application**.
2. Click **"Import"** in the top-left corner.
3. Drag and drop `postman/CGPA-Studio-API.postman_collection.json` (or browse to it).
4. Select the imported collection: **`CGPA Studio Backend API`**.
5. The collection is organized into 3 logical folders:
   * **1. Health Check**
     * `System & Database Health`
   * **2. Authentication**
     * `Register Student`
     * `Login Student`
     * `Get Current User Profile`
     * `Logout Student`
   * **3. Academic Plans CRUD**
     * `Create Academic Plan (POST /api/plans)` *(automatically saves returned `_id` into the collection variable `planId`)*
     * `Get All Academic Plans (GET /api/plans)`
     * `Get Single Academic Plan (GET /api/plans/:id)`
     * `Update Academic Plan (PATCH /api/plans/:id)`
     * `Delete Academic Plan (DELETE /api/plans/:id)`
     * `Verify Plan Deleted (GET /api/plans/:id -> 404)`
6. **Execute Collection:**
   * Right-click the collection name in Postman and select **"Run collection"**.
   * Click **"Run CGPA Studio Backend API"**.
   * All test assertions will execute in sequence and display green **PASS** checkmarks!

---

## 🧪 Automated Verification Test Suite

The project includes an automated integration test suite utilizing Node's native test runner and `mongodb-memory-server` to test all routes, controllers, and MongoDB operations in an isolated environment without needing active cloud credentials:

```bash
npm test
```

### Test Coverage Highlights:
* `✔ GET /api/health should return 200 with database status`
* `✔ POST /api/auth/register should create student and set cookie`
* `✔ POST /api/auth/register should reject duplicate email with 409 Conflict`
* `✔ POST /api/auth/login should authenticate user and issue cookie`
* `✔ POST /api/auth/login should reject invalid credentials with 401`
* `✔ GET /api/auth/me should return authenticated user profile`
* `✔ POST /api/plans should create an academic plan in MongoDB`
* `✔ GET /api/plans should retrieve all plans for logged-in user`
* `✔ GET /api/plans/:id should retrieve a single plan by ObjectId`
* `✔ PATCH /api/plans/:id should update permitted fields`
* `✔ DELETE /api/plans/:id should delete the plan from MongoDB`
* `✔ GET /api/plans/:id should return 404 for deleted plan`
* `✔ GET /api/plans/invalid-id should return 400 for bad ObjectId format`
* `✔ Protected routes should reject unauthenticated requests with 401`
* `✔ POST /api/auth/logout should clear session`
* `✔ Curriculum data integrity verification tests`
* `✔ Relative grading Gaussian distribution tests`
* `✔ Reverse marks calculation solver tests`
* `✔ AI Academic Advisor recommendation tests`

---

## 🛠️ Common Errors & Troubleshooting

### 1. `MONGODB_URI is missing or unconfigured in .env file`
* **Cause:** The server was started with an empty or placeholder connection string in `.env`.
* **Fix:** Open `.env` and replace `your_mongodb_atlas_connection_string` with your actual MongoDB Atlas cluster connection URI.

### 2. `MongoServerSelectionError: connection timed out` or `bad auth : Authentication failed`
* **Cause:** Incorrect database username/password or IP address not whitelisted in Atlas.
* **Fix:**
  1. Verify your database username and password in Atlas under **Security > Database Access**.
  2. Verify that your current IP address (or `0.0.0.0/0`) is whitelisted under **Security > Network Access**.

### 3. Port 3000 is Already in Use (`EADDRINUSE`)
* **Cause:** Another process is running on port 3000.
* **Fix (PowerShell)**:
  ```powershell
  # Change PORT in .env to 3001 or kill the running process:
  Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force
  ```

### 4. Cookies Not Saved in Postman
* **Cause:** Postman cookie jar is disabled for localhost.
* **Fix:** Postman automatically stores cookies from `set-cookie`. In addition, both the `/register` and `/login` endpoints return a `token` in the response JSON body so you can also use `Bearer <token>` in the Authorization header.

---

## 📸 Demonstration Screenshots (Placeholders)

*Capture and insert your actual demonstration screenshots here for college lab submission:*

### 1. Web Application Running (Aura Neo-Brutalist Dashboard)
```text
[ INSERT SCREENSHOT: CGPA Studio Home Dashboard at http://localhost:3000 ]
```

### 2. Student Authentication (Registration & Login)
```text
[ INSERT SCREENSHOT: Student Login & Registration Modal ]
```

### 3. Cloud Academic Plans Loaded from MongoDB Atlas
```text
[ INSERT SCREENSHOT: "My Saved Academic Plans" Modal Showing MongoDB Documents ]
```

### 4. Postman API Test Suite Results
```text
[ INSERT SCREENSHOT: Postman Collection Runner Displaying 100% Passed Tests ]
```

### 5. MongoDB Atlas Database Cluster Collections
```text
[ INSERT SCREENSHOT: MongoDB Atlas Cloud Browser Showing `users` and `academicplans` Collections ]
```

---

## 🐙 GitHub Submission Instructions

This project is prepared as an independent repository ready to be published to your new GitHub repository:

```bash
# 1. Initialize Git in the project folder
git init

# 2. Stage all project files
git add .

# 3. Create your initial commit
git commit -m "feat: complete CGPA Studio full-stack backend with Express and MongoDB Atlas"

# 4. Set main as the default branch
git branch -M main

# 5. Link to your new public GitHub repository
git remote add origin https://github.com/<your-username>/CGPA-Studio-Backend.git

# 6. Push code to GitHub
git push -u origin main
```

---

## 📄 License
MIT License. Built for BML Munjal University (BMU) B.Tech Computer Science & Engineering.

