const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');
const Mark = require('../models/Mark');
const User = require('../models/User');
const Student = require('../models/Student');

dotenv.config({ path: '../.env' });

const importData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log('Connected to DB...'.cyan);

    // Clear existing data
    await Mark.deleteMany();
    await User.deleteMany();
    await Student.deleteMany();
    console.log('Data destroyed...'.red.inverse);

    // 1. Create Faculty User
    const facultyUser = await User.create({
      name: 'Dr. Jane Smith',
      email: 'faculty@deptpro.edu',
      password: 'password123',
      role: 'FACULTY'
    });

    // 2. Create Students and their Login Accounts
    const studentData = [
      { name: 'John Doe', email: 'john@student.edu', reg: 'REG001' },
      { name: 'Alice Wong', email: 'alice@student.edu', reg: 'REG002' },
      { name: 'Bob Vance', email: 'bob@student.edu', reg: 'REG003' }
    ];

    const studentProfiles = [];

    for (const s of studentData) {
      const user = await User.create({
        name: s.name,
        email: s.email,
        password: 'password123',
        role: 'STUDENT'
      });

      const profile = await Student.create({
        registerNumber: s.reg,
        name: s.name,
        classCode: 'CSE-A-2024',
        email: s.email,
        userId: user._id
      });

      user.studentProfile = profile._id;
      await user.save();
      studentProfiles.push(profile);
    }

    // 3. Create Sample Marks
    const marks = [
      {
        studentId: studentProfiles[0]._id,
        classCode: 'CSE-A-2024',
        subject: 'Data Structures',
        cie1: 45, cie2: 42, cie3: 48,
        assignmentMark: 5, attendanceMark: 4, recordMark: 5, onlineTestMark: 5,
        semesterMark: 92,
        updatedBy: facultyUser._id
      },
      {
        studentId: studentProfiles[1]._id,
        classCode: 'CSE-A-2024',
        subject: 'Data Structures',
        cie1: 35, cie2: 38, cie3: 40,
        assignmentMark: 4, attendanceMark: 5, recordMark: 4, onlineTestMark: 3,
        semesterMark: 75,
        updatedBy: facultyUser._id
      }
    ];

    await Mark.create(marks);
    console.log('Users, Students, and Marks Imported!'.green.inverse);
    console.log('\n--- Credentials for Testing ---'.yellow);
    console.log('Faculty: faculty@deptpro.edu / password123'.white);
    console.log('Student: john@student.edu / password123'.white);

    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  // Simple delete logic
} else {
  importData();
}
