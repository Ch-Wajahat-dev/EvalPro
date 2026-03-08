# EvalPro - Academic Project Evaluation Platform

A full-stack web application for managing academic project submissions and evaluations at Gomal University, United College Hazrat Sultan Bahoo (BSCS 2023 Batch).

---

## Overview

EvalPro streamlines the submission, evaluation, and management of academic projects through a centralized platform. Students can browse projects, submit proposals, and track evaluation status — while supervisors manage the entire evaluation pipeline.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Backend | Node.js, Express.js |
| Database | MongoDB (Atlas) via Mongoose |
| Auth | JWT (JSON Web Tokens) + bcryptjs |
| File Upload | Multer |
| Validation | express-validator |

---

## Project Structure

```
EvalPro/
├── backend/
│   ├── server.js              # Express app entry point
│   ├── seed.js                # Database seeder with sample data
│   ├── .env                   # Environment configuration
│   ├── config/
│   │   └── db.js              # MongoDB connection with auto-reconnect
│   ├── middleware/
│   │   └── authMiddleware.js  # JWT protection + admin-only guards
│   ├── models/
│   │   ├── User.js
│   │   ├── Project.js
│   │   ├── Submission.js
│   │   ├── Evaluation.js
│   │   └── Rubric.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── projects.js
│   │   ├── submissions.js
│   │   ├── evaluations.js
│   │   ├── rubrics.js
│   │   ├── newsletter.js
│   │   └── admin.js
│   └── uploads/               # Uploaded images and documents
└── web/
    ├── index.html             # Home page
    ├── login.html
    ├── signup.html
    ├── submission.html        # Browse and submit projects
    ├── submission-review.html
    ├── evaluations.html       # Student evaluation history
    ├── admin.html             # Supervisor dashboard
    ├── about.html
    ├── how-it-works.html
    ├── css/
    └── js/
        ├── main.js            # Shared auth, navbar
        ├── app.js
        ├── search.js          # AI-powered project search
        └── script.js
```

---

## Getting Started

### Prerequisites

- Node.js (v16+)
- MongoDB Atlas account (or local MongoDB)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd EvalPro

# Install backend dependencies
cd backend
npm install
```

### Environment Setup

Create a `.env` file in the `backend/` directory:

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

### Running the Application

```bash
# From the backend/ directory

# Development (auto-restart on file changes)
npm run dev

# Production
npm start

# Seed database with sample data
npm run seed
```

The server starts on `http://localhost:3000` and serves the frontend from the `/web` folder.

---

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin (Supervisor) | admin@evalpro.com | Admin@123 |
| Student | student@evalpro.com | Student@123 |

Run `npm run seed` from the `backend/` directory to populate these accounts and 12 sample projects.

---

## Features

### For Students
- **Browse Projects** — Search and filter approved projects by category (Web, Mobile, AI/ML, IoT, Data Science, Desktop)
- **Submit Projects** — Add projects to a submission basket and submit for evaluation
- **Propose Projects** — Upload new project proposals with images and documents
- **Track Evaluations** — View evaluation history, scores, feedback, and status

### For Supervisors (Admin)
- **Manage Projects** — Create, update, and delete projects with file uploads
- **Approve Proposals** — Review, approve, or reject student proposals with notes and scores
- **Create Rubrics** — Define grading criteria with deadlines and countdown timers
- **Evaluate Submissions** — Score student submissions, leave feedback, and update evaluation status

### Platform
- **AI-Powered Search** — Keyword-to-category mapping for smart project discovery
- **Role-Based Access Control** — Students vs. Supervisor permissions
- **JWT Authentication** — Secure 7-day token sessions
- **Responsive Design** — Mobile-first layout

---

## API Endpoints

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | Login and receive JWT | Public |
| GET | `/api/auth/me` | Get current user | Protected |

### Projects
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/projects` | List approved projects (filterable) | Public |
| GET | `/api/projects/:id` | Get single project | Public |
| POST | `/api/projects` | Create project (file upload) | Admin |
| PUT | `/api/projects/:id` | Update project | Admin |
| DELETE | `/api/projects/:id` | Delete project | Admin |
| GET | `/api/projects/admin-all` | All projects (any status) | Admin |
| GET | `/api/projects/proposals` | Student proposals | Admin |
| GET | `/api/projects/my-proposals` | My proposals | Protected |
| POST | `/api/projects/propose` | Submit proposal | Protected |
| PATCH | `/api/projects/:id/approval` | Approve/reject proposal | Admin |

### Submissions
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/submissions` | Get my submission | Protected |
| POST | `/api/submissions/add` | Add project to submission | Protected |
| PUT | `/api/submissions/:projectId` | Update item quantity | Protected |
| DELETE | `/api/submissions/:projectId` | Remove item | Protected |

### Evaluations
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/evaluations` | Create evaluation | Admin |
| GET | `/api/evaluations` | List all evaluations | Admin |
| GET | `/api/evaluations/my` | My evaluation history | Protected |
| PATCH | `/api/evaluations/:id/status` | Update status/score/feedback | Admin |

### Rubrics
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/rubrics` | Active, non-expired rubrics | Public |
| GET | `/api/rubrics/all` | All rubrics | Admin |
| POST | `/api/rubrics` | Create rubric | Admin |
| PATCH | `/api/rubrics/:id/toggle` | Toggle active state | Admin |
| DELETE | `/api/rubrics/:id` | Delete rubric | Admin |

---

## Data Models

### User
```
name, email (unique), password (bcrypt), role (user | admin)
```

### Project
```
name, description, score (0-100), category, image, document,
studentName, proposedBy (User ref), approvalStatus (approved | pending | rejected),
inStatus, rejectionNote
```

### Submission
```
user (User ref, unique), items: [{ project, quantity }]
```

### Evaluation
```
user (User ref), items: [{ project, quantity }], totalScore,
supervisorComments, phone, scoringMethod, status (Submitted | Under Review | Evaluated | Approved),
feedback, supervisorScore (0-100)
```

### Rubric
```
title, description, criteria: [{ name, maxScore, description }],
discountPercentage (0-100), image, endTime, isActive
```

---

## Workflows

### Student Project Submission
1. Browse and search approved projects on the submission page
2. Add selected projects to your submission basket
3. Review items on the submission review page
4. Submit for evaluation — creates an Evaluation record

### Project Proposal
1. Click "Propose New Project" on the submission page
2. Fill in project details and upload files
3. Proposal is created with `pending` status
4. Admin reviews and approves (with score) or rejects (with note)
5. Approved proposals appear publicly for all students

### Evaluation Pipeline
```
Submitted → Under Review → Evaluated → Approved
```
Admin updates status, supervisor score, and feedback at each stage.

---

## Project Categories

- Web Application
- Mobile Application
- AI/ML
- IoT
- Data Science
- Desktop Application

---

## Contact

**Developer**: muhammadhabeel633@gmail.com
**Institution**: Gomal University, United College Hazrat Sultan Bahoo
**Batch**: BSCS 2023
