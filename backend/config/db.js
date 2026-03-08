const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      tls: true,
      tlsAllowInvalidCertificates: true,
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      retryWrites: true,
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected. Retrying in 5s...');
      setTimeout(connectDB, 5000);
    });
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB error:', err.message);
    });
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    setTimeout(connectDB, 5000);
  }
};

module.exports = connectDB;
