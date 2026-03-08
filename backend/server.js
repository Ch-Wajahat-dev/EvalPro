const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, '../web')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../web/index.html'));
});

// Inline admin routes (avoid router prefix/path conflicts)
const Project = require('./models/Project');
const { protect, adminOnly } = require('./middleware/authMiddleware');

app.get('/api/admin/projects', protect, adminOnly, async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/evaluations', require('./routes/evaluations'));
app.use('/api/submissions', require('./routes/submissions'));
app.use('/api/rubrics', require('./routes/rubrics'));
app.use('/api/newsletter', require('./routes/newsletter'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'EvalPro API is running', timestamp: new Date() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
