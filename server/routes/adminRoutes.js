const express = require('express');
const { getAllStudentSlips } = require('../controllers/adminController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// GET /students - Get all student slips with registered courses (protected - admin only)
router.get('/students', protect, isAdmin, getAllStudentSlips);

module.exports = router;
