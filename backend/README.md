# Academic Evaluation & Performance Analytics Module

A robust MERN Stack module for managing academic performance, featuring automated calculation engines, role-based access control, and advanced analytics.

## Features

- **Automated Calculations:** 
  - Converts 3 CIEs (50 marks each) to a 30-mark weightage.
  - Aggregates Assignments, Attendance, Records, and Online Tests (20 marks).
  - Converts Semester Exams (100 marks) to 50-mark weightage.
  - Auto-assigns Grades (O, A+, A, B+, B, RA) and Results (PASS/FAIL).
- **Validation Layer:** Enforces academic regulations (e.g., max marks, no negative values).
- **Advanced Analytics:** 
  - Class Performance Summary (Pass %, Average, Highest/Lowest).
  - Topper Identification.
  - Subject-wise Analysis.
- **Security:** Role-Based Access Control (RBAC) stubs for Faculty/Admin vs Student.

## Getting Started

### Prerequisites

- Node.js & npm
- MongoDB (Local or Atlas)

### Installation

1.  **Clone the repository**
    ```bash
    git clone <repo_url>
    cd backend
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env` file in the root directory:
    ```env
    NODE_ENV=development
    PORT=5000
    MONGO_URI=mongodb://localhost:27017/academic_evaluation
    JWT_SECRET=your_jwt_secret
    ```

4.  **Seed Database (Optional)**
    Populate with sample data to test analytics:
    ```bash
    npm run seed
    ```

5.  **Start Server**
    ```bash
    npm start
    ```

## API Endpoints

### Marks Management

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/marks/add` | Add new marks (auto-calc) | Faculty/Admin |
| PUT | `/api/marks/update/:id` | Update marks & recalculate | Faculty/Admin |
| GET | `/api/marks/student/:studentId` | Get student performance | Student/Faculty |
| GET | `/api/marks/class/:classCode` | Get entire class report | Faculty/Admin |
| DELETE | `/api/marks/:id` | Remove mark entry | Admin |

### Analytics

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/analytics/class-summary/:classCode` | Class averages, pass/fail % | Faculty/Admin |
| GET | `/analytics/topper/:classCode` | Top 5 students | Faculty/Admin |
| GET | `/analytics/subject-analysis/:subject` | Subject grade distribution | Faculty/Admin |

## Frontend Integration (JSON Structure)

**POST /api/marks/add Payload:**

```json
{
  "studentId": "65123...",
  "classCode": "CSE-A-2024",
  "subject": "Data Structures",
  "cie1": 45,
  "cie2": 42,
  "cie3": 48,
  "assignmentMark": 5,
  "attendanceMark": 5,
  "recordMark": 5,
  "onlineTestMark": 5,
  "semesterMark": 92
}
```

**Response (Auto-Calculated):**

```json
{
  "success": true,
  "data": {
    "convertedCie1": 9.0,
    "convertedCie2": 8.4,
    "convertedCie3": 9.6,
    "internalTotal": 47.0,
    "semesterConverted": 46.0,
    "finalTotal": 93.0,
    "result": "PASS",
    "grade": "O"
  }
}
```
