require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path'); // Import the path module
const os = require('os');   // Import the os module

const app = express();

// --- THIS IS THE FIX ---
// This configuration will use your Vercel URL when deployed,
// and fall back to your localhost for local development.
const allowedOrigins = [
    process.env.FRONTEND_URL, // This will be your Vercel URL
    'http://localhost:3000'
];

const corsOptions = {
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// Middleware
app.use(express.json());

// Serve uploaded images statically from the temporary directory
app.use('/uploads', express.static(path.join(os.tmpdir(), 'uploads')));

// DB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully.'))
  .catch(err => console.error('MongoDB connection error:', err));

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/predict', require('./routes/predictionRoutes'));

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Export the app for Vercel
module.exports = app;
