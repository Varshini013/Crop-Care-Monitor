const { spawn } = require('child_process');
const mongoose = require('mongoose');
const Prediction = require('../models/Prediction');

// --- START: AI-Powered Remedy Functions ---
const askGeminiForStructuredRemedy = async (diseaseName) => {
    // ... (This function is correct and does not need changes)
};
const getRemedyDetails = async (req, res) => {
    // ... (This function is correct and does not need changes)
};
// --- END: AI-Powered Remedy Functions ---


const predictDisease = (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No image file uploaded.' });
    const imagePath = req.file.path;
    
    // --- THIS IS THE FINAL, DEFINITIVE FIX ---
    // This explicitly tells the system to use the Python 3 runtime.
    // This is the most robust way to call Python on a modern Linux server like Vercel.
    const pythonProcess = spawn('python3', ['api/model/predict.py', imagePath]);
    // --- END OF FIX ---

    let predictionResult = '';
    pythonProcess.stdout.on('data', (data) => { predictionResult += data.toString(); });
    pythonProcess.stderr.on('data', (data) => { console.error(`Python Script Error: ${data}`); });
    pythonProcess.on('close', async (code) => {
        if (code !== 0) {
            console.error("Prediction script exited with non-zero code:", code);
            return res.status(500).json({ message: 'Prediction script failed to execute.' });
        }
        const diseaseName = predictionResult.trim();
        if (!diseaseName) {
            return res.status(500).json({ message: 'Failed to get a valid prediction from the model.' });
        }
        
        const newPrediction = new Prediction({ user: req.user.id, diseaseName, imageUrl: `/${imagePath.replace(/\\/g, '/').split('/').pop()}`, remedy: "Click 'View Treatment Plan' for details." });
        await newPrediction.save();
        res.status(200).json(newPrediction);
    });
};

// ... (getHistory, getStats, deletePredictions, getWeeklyActivity functions are correct and do not need changes)
const getHistory = async (req, res) => { /* ... */ };
const getStats = async (req, res) => { /* ... */ };
const deletePredictions = async (req, res) => { /* ... */ };
const getWeeklyActivity = async (req, res) => { /* ... */ };

module.exports = {
    predictDisease,
    getHistory,
    getStats,
    deletePredictions,
    getRemedyDetails,
    getWeeklyActivity
};
