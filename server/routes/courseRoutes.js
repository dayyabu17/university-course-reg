const express = require('express');
const { getAllCourses, registerCourses, getRegisteredCourses } = require('../controllers/courseController');
const { protect } = require('../middleware/authMiddleware');
const { validateCourseRegistration } = require('../middleware/validation');

const router = express.Router();

// GET /all - Fetch all available courses (public)
router.get('/all', getAllCourses);

// POST /register - Register courses (protected - logged in students only)
router.post('/register', protect, validateCourseRegistration, registerCourses);

// GET /registered - Fetch registered courses (protected)
router.get('/registered', protect, getRegisteredCourses);

module.exports = router;
