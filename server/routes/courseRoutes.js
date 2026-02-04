const express = require('express');
const { getAllCourses, registerCourses } = require('../controllers/courseController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// GET /all - Fetch all available courses (public)
router.get('/all', getAllCourses);

// POST /register - Register courses (protected - logged in students only)
router.post('/register', protect, registerCourses);

module.exports = router;
