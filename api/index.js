require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const os = require('os');

const app = express();

// --- THIS IS THE DEFINITIVE FIX ---
// This new configuration is smarter. It will allow requests from your local computer
// AND from any live URL that Vercel creates for your project.
const corsOptions = {
  origin: function (origin, callback) {
    // Allow localhost for local development and requests with no origin (like Postman)
    if (!origin || origin.startsWith('http://localhost')) {
      return callback(null, true);
    }
    // Allow any vercel.app subdomain for deployed previews and production
    // This is the key part that fixes the error.
    if (origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    
    const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
    return callback(new Error(msg), false);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));
// --- END OF FIX ---


// Middleware
app.use(express.json());
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
