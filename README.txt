================================================================================
                  EvalPro - Web-Based Project Evaluation & Management System
================================================================================

Developed for: Gomal University, United College Hazrat Sultan Bahoo
Program:       BSCS - 2023 Batch
Contact:       muhammadhabeel633@gmail.com

--------------------------------------------------------------------------------
PROJECT OVERVIEW
--------------------------------------------------------------------------------

EvalPro is a full-stack web application designed to streamline the submission,
evaluation, and management of academic projects. It provides a centralized
platform where students can browse projects, submit proposals, and track
evaluation progress, while supervisors (admins) manage the entire workflow
through a dedicated dashboard.

--------------------------------------------------------------------------------
TECHNOLOGY STACK
--------------------------------------------------------------------------------

Frontend:
  - HTML5, CSS3, Vanilla JavaScript
  - Responsive design (mobile, tablet, desktop)
  - Pages: index.html, submission.html, submission-review.html, evaluations.html,
           admin.html, login.html, signup.html, about.html, how-it-works.html,
           privacy.html, terms.html

Backend:
  - Node.js + Express.js (REST API)
  - MongoDB (via Mongoose ODM)
  - JWT (JSON Web Tokens) for authentication
  - bcryptjs for password hashing
  - Multer for file uploads (images & documents)
  - express-validator for input validation
  - dotenv for environment configuration
  - nodemon for development auto-restart

--------------------------------------------------------------------------------
PROJECT STRUCTURE
--------------------------------------------------------------------------------

group1/
├── backend/
│   ├── server.js              Entry point - Express app setup
│   ├── seed.js                Database seeder (sample projects + demo users)
│   ├── package.json
│   ├── config/
│   │   └── db.js              MongoDB connection with auto-reconnect
│   ├── middleware/
│   │   └── authMiddleware.js  JWT protect + adminOnly guards
│   ├── models/
│   │   ├── User.js            User schema (name, email, password, role)
│   │   ├── Project.js         Project schema (name, description, score, category, files)
│   │   ├── Submission.js      Submission schema (user -> project items)
│   │   ├── Evaluation.js      Evaluation schema (scores, status, feedback)
│   │   └── Rubric.js          Rubric schema (criteria, deadline, active flag)
│   ├── routes/
│   │   ├── auth.js            Auth routes (register, login, me)
│   │   ├── projects.js        Project CRUD + proposal workflow
│   │   ├── submissions.js     Submission management (add, update, remove)
│   │   ├── evaluations.js     Evaluation creation and status tracking
│   │   ├── rubrics.js         Rubric management
│   │   └── newsletter.js      Newsletter subscription
│   └── uploads/               Uploaded project images and documents
└── web/
    ├── index.html             Home page
    ├── submission.html        Browse & add projects to submission
    ├── submission-review.html View and manage submission before evaluation
    ├── evaluations.html       Student evaluation history
    ├── admin.html             Supervisor dashboard
    ├── login.html             Login page
    ├── signup.html            Registration page
    ├── about.html             About page
    ├── how-it-works.html      Platform guide
    ├── privacy.html           Privacy policy
    ├── terms.html             Terms of service
    ├── css/
    │   ├── style.css          Main stylesheet
    │   ├── styl.css
    │   └── Stylee.css
    └── js/
        ├── main.js            Core JS (navbar, auth state, loaders)
        ├── app.js             Application logic
        ├── script.js          Additional scripts
        └── search.js          AI-powered project search

--------------------------------------------------------------------------------
API ENDPOINTS
--------------------------------------------------------------------------------

Authentication  (/api/auth)
  POST   /register       Register a new user
  POST   /login          Login and receive JWT token
  GET    /me             Get current authenticated user (protected)

Projects  (/api/projects)
  GET    /               List all approved projects (public, supports ?category & ?search)
  GET    /:id            Get a single project by ID (public)
  POST   /               Create a new project (Admin only)
  PUT    /:id            Update a project (Admin only)
  DELETE /:id            Delete a project (Admin only)
  GET    /admin-all      List all projects regardless of status (Admin only)
  GET    /proposals       List all student proposals (Admin only)
  GET    /my-proposals   List the logged-in student's own proposals (protected)
  POST   /propose        Submit a new project proposal (protected, file upload)
  PATCH  /:id/approval   Approve or reject a proposal (Admin only)

Submissions  (/api/submissions)
  GET    /               View current submission (protected)
  POST   /add            Add a project to submission (protected)
  PUT    /:projectId     Update item quantity in submission (protected)
  DELETE /:projectId     Remove item from submission (protected)

Evaluations  (/api/evaluations)
  POST   /               Place a new evaluation from current submission (Admin only)
  GET    /               List all evaluations (Admin only)
  GET    /my             Get personal evaluation history (protected)
  PATCH  /:id/status     Update evaluation status, score & feedback (Admin only)

Rubrics  (/api/rubrics)
  GET    /               List active, non-expired rubrics (public)
  GET    /all            List all rubrics (Admin only)
  POST   /               Create a rubric (Admin only, supports image upload)
  PATCH  /:id/toggle     Toggle rubric active/inactive (Admin only)
  DELETE /:id            Delete a rubric (Admin only)

Newsletter  (/api/newsletter)
  POST   /subscribe      Subscribe an email to the newsletter (public)

Other
  GET    /api/health     Health check endpoint

--------------------------------------------------------------------------------
DATA MODELS
--------------------------------------------------------------------------------

User
  - name (String, required)
  - email (String, unique, required)
  - password (String, bcrypt hashed, min 6 chars)
  - role (Enum: 'user' | 'admin', default: 'user')

Project
  - name, description (required)
  - score (Number, 0-100)
  - category (Enum: Web Application | Mobile Application | AI/ML | IoT |
                     Data Science | Desktop Application)
  - image, document (file paths, stored in /uploads)
  - studentName (String)
  - proposedBy (ref: User)
  - approvalStatus (Enum: 'approved' | 'pending' | 'rejected')
  - inStatus (Boolean, active flag)
  - rejectionNote (String)

Submission (one per user)
  - user (ref: User)
  - items [ { project (ref: Project), quantity } ]

Evaluation
  - user (ref: User)
  - items [ { project (ref: Project), quantity } ]
  - totalScore (auto-calculated from project scores)
  - supervisorComments, phone, giftMessage
  - scoringMethod (Enum: Standard | Rubric-Based | Peer Review | Supervisor Only)
  - status (Enum: Submitted | Under Review | Evaluated | Approved)
  - feedback, supervisorScore (0-100, set by admin)

Rubric
  - title, description (required)
  - criteria [ { name, maxScore, description } ]
  - discountPercentage (0-100)
  - image (file path)
  - endTime (Date, deadline required)
  - isActive (Boolean)

--------------------------------------------------------------------------------
EVALUATION WORKFLOW
--------------------------------------------------------------------------------

1. Student registers / logs in
2. Student browses approved projects and adds them to Submission
3. Student reviews Submission and submits for evaluation
4. Supervisor (Admin) reviews the evaluation in the admin panel
5. Supervisor updates the status:
      Submitted -> Under Review -> Evaluated -> Approved
6. Supervisor provides score (supervisorScore) and written feedback
7. Student views evaluation history and feedback on evaluations.html

Project Proposal Workflow:
1. Student proposes a new project via /api/projects/propose (with files)
2. Project is created with approvalStatus: 'pending'
3. Supervisor reviews proposals in admin panel and approves or rejects
4. Approved projects become visible to all users on the browse page

--------------------------------------------------------------------------------
SETUP & INSTALLATION
--------------------------------------------------------------------------------

Prerequisites:
  - Node.js v16 or higher
  - MongoDB (Atlas or local instance)

Step 1 - Install backend dependencies:
  cd backend
  npm install

Step 2 - Create environment file:
  Create a file named .env inside the backend/ folder with:

      MONGO_URI=your_mongodb_connection_string
      JWT_SECRET=your_secret_key_here
      PORT=5000

Step 3 - (Optional) Seed the database with sample data:
  cd backend
  npm run seed

  This creates:
    - 12 sample academic projects across all categories
    - Admin account:   admin@evalpro.com   / Admin@123
    - Student account: student@evalpro.com / Student@123

Step 4 - Start the server:
  Production:  npm start
  Development: npm run dev

Step 5 - Open in browser:
  http://localhost:5000

The backend serves the web/ frontend as static files, so no separate frontend
server is required.

--------------------------------------------------------------------------------
USER ROLES
--------------------------------------------------------------------------------

Student (role: user)
  - Browse and search approved projects
  - Add projects to submission
  - Propose new project ideas (with files)
  - View own proposals and their approval status
  - View personal evaluation history and feedback

Supervisor (role: admin)
  - All student capabilities
  - Access Supervisor Panel (admin.html)
  - Create, edit, and delete projects
  - Approve or reject student project proposals
  - Create and manage evaluation rubrics
  - View and manage all evaluations
  - Update evaluation status, scores, and feedback

--------------------------------------------------------------------------------
PROJECT CATEGORIES
--------------------------------------------------------------------------------

  - Web Application
  - Mobile Application
  - AI / Machine Learning (AI/ML)
  - IoT (Internet of Things)
  - Data Science
  - Desktop Application

--------------------------------------------------------------------------------
KEY FEATURES
--------------------------------------------------------------------------------

  - JWT-based authentication with 7-day token expiry
  - bcrypt password hashing (salt rounds: 10)
  - Role-based access control (user / admin)
  - File upload support for project images and documents
  - AI-powered search (client-side search with live results)
  - Evaluation rubrics with live countdown timers
  - Evaluation status tracking through 4 stages
  - Project proposal workflow with approval/rejection
  - Newsletter subscription endpoint
  - MongoDB auto-reconnect on disconnect
  - CORS enabled for cross-origin requests
  - Fully responsive frontend (mobile-first)

--------------------------------------------------------------------------------
DEVELOPMENT SCRIPTS
--------------------------------------------------------------------------------

  npm start       Start server with node
  npm run dev     Start server with nodemon (auto-restarts on file changes)
  npm run seed    Seed database with sample projects and demo users

--------------------------------------------------------------------------------
DEPENDENCIES
--------------------------------------------------------------------------------

Production:
  bcryptjs          ^2.4.3    Password hashing
  cors              ^2.8.5    Cross-Origin Resource Sharing
  dotenv            ^16.3.1   Environment variables
  express           ^4.18.2   Web framework
  express-validator ^7.0.1    Request validation
  jsonwebtoken      ^9.0.0    JWT auth tokens
  mongoose          ^7.3.1    MongoDB ODM
  multer            ^1.4.5    File upload handling

Development:
  nodemon           ^3.0.1    Auto-restart on file change

================================================================================
                             End of README
================================================================================
