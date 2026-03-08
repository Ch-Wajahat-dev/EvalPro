const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const Project = require('./models/Project');

dotenv.config();

const projects = [
  {
    name: 'E-Commerce Shopping Platform',
    description: 'A full-stack e-commerce website with product listings, cart, user authentication, and payment integration using Node.js, React, and MongoDB.',
    score: 92,
    category: 'Web Application',
    studentName: 'Muhammad Habeel Ghaffar',
    inStatus: true
  },
  {
    name: 'Student Management System',
    description: 'A web-based system for managing student records, attendance, grades, and course enrollments with role-based access for admin and students.',
    score: 88,
    category: 'Web Application',
    studentName: 'Irsa Abad Ali',
    inStatus: true
  },
  {
    name: 'University Portal Website',
    description: 'A comprehensive university portal with news, announcements, department pages, event management, and faculty information sections.',
    score: 85,
    category: 'Web Application',
    studentName: 'Ayesha Yaqoob',
    inStatus: true
  },
  {
    name: 'Flutter Online Shopping App',
    description: 'A cross-platform mobile shopping app built with Flutter and Firebase featuring real-time product updates, wishlist, and order tracking.',
    score: 90,
    category: 'Mobile Application',
    studentName: 'Sharmeen Iftikhar',
    inStatus: true
  },
  {
    name: 'React Native Chat Application',
    description: 'A real-time messaging app with group chats, media sharing, push notifications, and end-to-end encryption built with React Native and Socket.io.',
    score: 87,
    category: 'Mobile Application',
    studentName: 'Tanzeela Shakoor',
    inStatus: true
  },
  {
    name: 'Image Classification with CNN',
    description: 'A deep learning project using Convolutional Neural Networks (CNN) with TensorFlow to classify images across 10 categories with 94% accuracy.',
    score: 95,
    category: 'AI/ML',
    studentName: 'Muhammad Habeel Ghaffar',
    inStatus: true
  },
  {
    name: 'Sentiment Analysis Tool',
    description: 'A natural language processing tool that analyzes social media text to determine positive, negative, or neutral sentiment using BERT and Python.',
    score: 91,
    category: 'AI/ML',
    studentName: 'Irsa Abad Ali',
    inStatus: true
  },
  {
    name: 'Smart Home Automation System',
    description: 'An IoT project that uses Arduino, Raspberry Pi, and MQTT protocol to control home appliances remotely via a mobile app with sensor monitoring.',
    score: 89,
    category: 'IoT',
    studentName: 'Ayesha Yaqoob',
    inStatus: true
  },
  {
    name: 'Weather Monitoring Station',
    description: 'An IoT weather station using ESP32 with temperature, humidity, and air quality sensors, displaying real-time data on an online dashboard.',
    score: 83,
    category: 'IoT',
    studentName: 'Sharmeen Iftikhar',
    inStatus: true
  },
  {
    name: 'Sales Analytics Dashboard',
    description: 'A data science project that uses Python, Pandas, and Matplotlib to analyze retail sales data with predictive analytics and interactive visualizations.',
    score: 88,
    category: 'Data Science',
    studentName: 'Tanzeela Shakoor',
    inStatus: true
  },
  {
    name: 'Student Performance Predictor',
    description: 'A machine learning model that predicts student academic performance based on study habits, attendance, and previous grades using scikit-learn.',
    score: 93,
    category: 'Data Science',
    studentName: 'Muhammad Habeel Ghaffar',
    inStatus: true
  },
  {
    name: 'Library Management System',
    description: 'A desktop application built with Java and SQLite for managing library books, member registrations, borrowing records, and fine calculations.',
    score: 82,
    category: 'Desktop Application',
    studentName: 'Irsa Abad Ali',
    inStatus: true
  }
];

const seedDB = async () => {
  await connectDB();

  try {
    await Project.deleteMany({});
    await User.deleteMany({ email: { $in: ['admin@evalpro.com', 'student@evalpro.com'] } });

    await Project.insertMany(projects);
    console.log(`Seeded ${projects.length} projects`);

    await User.create({
      name: 'Supervisor Admin',
      email: 'admin@evalpro.com',
      password: 'Admin@123',
      role: 'admin'
    });
    console.log('Supervisor user created: admin@evalpro.com / Admin@123');

    await User.create({
      name: 'Demo Student',
      email: 'student@evalpro.com',
      password: 'Student@123',
      role: 'user'
    });
    console.log('Demo student created: student@evalpro.com / Student@123');

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err.message);
    process.exit(1);
  }
};

seedDB();
