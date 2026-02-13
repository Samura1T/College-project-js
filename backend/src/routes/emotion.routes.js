const express = require('express');
const router = express.Router();
// Import the new controller functions we just wrote
const { saveEmotion, getEmotions } = require('../controllers/emotion.controller');

// Main route: /api/emotions
router.route('/')
    .post(saveEmotion)   // POST request -> Saves data
    .get(getEmotions);   // GET request -> Returns statistics

module.exports = router;