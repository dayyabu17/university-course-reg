const Course = require('../models/Course');
const User = require('../models/User');
const SystemConfig = require('../models/SystemConfig');

// Get all student slips with their registered courses
const getAllStudentSlips = async (req, res, next) => {
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
    next(error); // Forward to error handler
  }
};

// Get admin dashboard stats
const getAdminStats = async (req, res, next) => {
  try {
    const [studentCount, courseCount] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      Course.countDocuments(),
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        students: studentCount,
        courses: courseCount,
      },
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    next(error); // Forward to error handler
  }
};

// Get all courses (admin)
const getAllCoursesAdmin = async (req, res, next) => {
  try {
    const courses = await Course.find({}).sort({ level: 1, courseCode: 1 });

    res.status(200).json({
      status: 'success',
      count: courses.length,
      data: courses,
    });
  } catch (error) {
    console.error('Error fetching courses for admin:', error);
    next(error); // Forward to error handler
  }
};

// Create a new course (admin)
const createCourse = async (req, res, next) => {
  try {
    const { courseCode, courseName, semester, creditUnit, level } = req.body;

    const existingCourse = await Course.findOne({
      courseCode: courseCode.toUpperCase(),
    });

    if (existingCourse) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Course code already exists',
      });
    }

    const course = await Course.create({
      courseCode: courseCode.toUpperCase(),
      courseName,
      semester,
      creditUnit,
      level,
    });

    res.status(201).json({
      status: 'success',
      message: 'Course created successfully',
      data: course,
    });
  } catch (error) {
    console.error('Error creating course:', error);
    next(error); // Forward to error handler
  }
};

// Get registration period
const getRegistrationPeriod = async (req, res, next) => {
  try {
    const config = await SystemConfig.findOne({ key: 'registrationPeriod' });

    if (!config) {
      return res.status(404).json({
        status: 'error',
        message: 'Registration period not configured'
      });
    }

    res.status(200).json({
      status: 'success',
      data: config.value
    });
  } catch (error) {
    console.error('Error fetching registration period:', error);
    next(error);
  }
};

// Update registration period
const updateRegistrationPeriod = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.body;

    if (!startDate || !endDate) {
      return res.status(400).json({
        status: 'error',
        message: 'Start date and end date are required'
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      return res.status(400).json({
        status: 'error',
        message: 'End date must be after start date'
      });
    }

    const config = await SystemConfig.findOneAndUpdate(
      { key: 'registrationPeriod' },
      { value: { startDate: start, endDate: end } },
      { new: true, upsert: true }
    );

    res.status(200).json({
      status: 'success',
      message: 'Registration period updated successfully',
      data: config.value
    });
  } catch (error) {
    console.error('Error updating registration period:', error);
    next(error);
  }
};

module.exports = {
  getAllStudentSlips,
  getAdminStats,
  getAllCoursesAdmin,
  createCourse,
  getRegistrationPeriod,
  updateRegistrationPeriod,
};
