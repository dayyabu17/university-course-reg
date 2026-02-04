const User = require('../models/User');

// Get all student slips with their registered courses
const getAllStudentSlips = async (req, res) => {
  try {
    // Find all users with role 'student' and populate their registered courses
    const students = await User.find({ role: 'student' })
      .populate('registeredCourses')
      .sort({ name: 1 }); // Sort by name in ascending order

    // Return the list of students with their course details
    res.status(200).json({
      status: 'success',
      count: students.length,
      data: students
    });

  } catch (error) {
    console.error('Error fetching student slips:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while fetching student slips',
      error: error.message
    });
  }
};

module.exports = {
  getAllStudentSlips
};
