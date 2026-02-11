const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');

dotenv.config();

const makeRandom = (len) => crypto.randomBytes(len).toString('hex');

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const suffix = makeRandom(4);
    const studentPassword = `Stu${makeRandom(4)}!`;
    const adminPassword = `Adm${makeRandom(4)}!`;

    const student = {
      name: 'Test Student',
      regNo: `UG15/CS/${makeRandom(3)}`,
      email: `student_${suffix}@example.com`,
      password: await bcrypt.hash(studentPassword, 10),
      level: '100',
      role: 'student'
    };

    const admin = {
      name: 'Test Admin',
      regNo: `UG15/CS/${makeRandom(3)}`,
      email: `admin_${suffix}@example.com`,
      password: await bcrypt.hash(adminPassword, 10),
      level: '100',
      role: 'admin'
    };

    await User.create([student, admin]);

    console.log('Created users:');
    console.log(`Student: ${student.email} / ${studentPassword} (regNo: ${student.regNo})`);
    console.log(`Admin:   ${admin.email} / ${adminPassword} (regNo: ${admin.regNo})`);

    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
};

seedUsers();
