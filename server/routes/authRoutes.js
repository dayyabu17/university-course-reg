const express = require('express');
const { signUp, signIn } = require('../controllers/authController');

const router = express.Router();

// POST /signup - Register a new user
router.post('/signup', signUp);

// POST /login - Authenticate user and get token
router.post('/login', signIn);

module.exports = router;
