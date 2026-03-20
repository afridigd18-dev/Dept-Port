# Academic Evaluation Module - Handover Report

## 1. Feature Implementation Map

### A. Auto-Calculation Engine (Backend)
**File:** `backend/src/models/Mark.js`
- **Mechanism:** Mongoose `pre('save')` middleware.
- **Logic:** 
  - Automatically normalizes CIE marks (50 → 10).
  - Aggregates internal components (Assignments, Attendance, etc.).
  - Converts Semester marks (100 → 50).
  - **Auto-Grades:** Assigns 'O' through 'RA' based on `finalTotal`.
  - **Result Logic:** Sets PASS/FAIL based on a `< 50` threshold.

### B. Real-Time Calculation Preview (Frontend)
**File:** `frontend/src/pages/FacultyMarkEntry.jsx`
- **Mechanism:** React `useEffect` hook monitoring `formData`.
- **Logic:** Replicates the backend calculation logic in the browser to give immediate feedback to faculty before they submit, preventing errors.

### C. Role-Based Dashboards
**File:** `frontend/src/App.jsx` & `backend/src/middleware/authMiddleware.js`
- **Security:** JWT-based protected routes.
- **Faculty View:** Access to Mark Entry, Bulk Upload, and Class Analytics.
- **Student View:** Restricted access to `StudentDashboard.jsx` (only their own marks).

### D. Advanced Analytics
**File:** `backend/src/controllers/markController.js`
- **Mechanism:** MongoDB Aggregation Pipelines.
- **Metrics:**
  - Class Pass/Fail Percentage.
  - Topper identification (Top 5).
  - Subject-wise grade distribution.

### E. Bulk CSV Upload
**File:** `backend/src/controllers/markController.js` & `frontend/src/pages/BulkUpload.jsx`
- **Tech Stack:** `multer` for file handling, `csv-parser` for streaming processing.
- **Logic:** Validates Student IDs against the database for every row to ensure data integrity during bulk operations.

---

## 2. Quick Start Guide

### Prerequisites
- Node.js (v16+)
- MongoDB Running locally (Default port: 27017)

### Step 1: Backend Setup & Seeding
```bash
cd backend
npm install
npm run seed  # Populates DB with Faculty (Dr. Jane Smith) and Students
npm start
```

### Step 2: Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Step 3: Login Credentials (from Seeder)
| Role | Email | Password |
|------|-------|----------|
| **Faculty** | `faculty@deptpro.edu` | `password123` |
| **Student** | `john@student.edu` | `password123` |

---

## 3. API Endpoints

- **POST** `/api/marks/add` - Single Entry
- **POST** `/api/marks/bulk-upload` - CSV Upload
- **GET** `/api/marks/analytics/class-summary/:classCode` - Analytics
