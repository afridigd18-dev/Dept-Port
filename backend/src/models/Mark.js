const mongoose = require('mongoose');

const MarkSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student', // Ideally references a Student model
    required: [true, 'Student ID is required'],
    index: true
  },
  classCode: {
    type: String,
    required: [true, 'Class Code is required'],
    trim: true,
    index: true
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true
  },
  
  // Continuous Internal Exams (Max 50 each)
  cie1: { type: Number, min: 0, max: 50, default: 0 },
  cie2: { type: Number, min: 0, max: 50, default: 0 },
  cie3: { type: Number, min: 0, max: 50, default: 0 },

  // Converted CIE Scores (Calculated: Obtained / 50 * 10)
  convertedCie1: { type: Number, default: 0 },
  convertedCie2: { type: Number, default: 0 },
  convertedCie3: { type: Number, default: 0 },

  // Other Internal Components (Max 5 each)
  assignmentMark: { type: Number, min: 0, max: 5, default: 0 },
  attendanceMark: { type: Number, min: 0, max: 5, default: 0 },
  recordMark: { type: Number, min: 0, max: 5, default: 0 },
  onlineTestMark: { type: Number, min: 0, max: 5, default: 0 },

  // Aggregated Internal Total (Max 50)
  internalTotal: { type: Number, default: 0 },

  // Semester Exam (Max 100)
  semesterMark: { type: Number, min: 0, max: 100, default: 0 },
  
  // Converted Semester Mark (Calculated: Obtained / 100 * 50)
  semesterConverted: { type: Number, default: 0 },

  // Final Result (Internal + Semester Converted)
  finalTotal: { type: Number, default: 0 },
  
  result: {
    type: String,
    enum: ['PASS', 'FAIL'],
    default: 'FAIL'
  },
  grade: {
    type: String,
    enum: ['O', 'A+', 'A', 'B+', 'B', 'RA'], // RA = Reappear (Fail)
    default: 'RA'
  },
  remarks: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['Draft', 'Published'],
    default: 'Draft'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Faculty/Admin ID
  }
}, {
  timestamps: true
});

// Compound Index: Ensure a student has only one entry per subject
MarkSchema.index({ studentId: 1, subject: 1 }, { unique: true });

// =====================================================
// AUTO CALCULATION ENGINE (Middleware)
// =====================================================
MarkSchema.pre('save', function(next) {
  // 1. Convert CIEs (50 -> 10)
  this.convertedCie1 = parseFloat(((this.cie1 / 50) * 10).toFixed(2));
  this.convertedCie2 = parseFloat(((this.cie2 / 50) * 10).toFixed(2));
  this.convertedCie3 = parseFloat(((this.cie3 / 50) * 10).toFixed(2));

  const totalCieContribution = this.convertedCie1 + this.convertedCie2 + this.convertedCie3;

  // 2. Compute Internal Total (Max 50)
  // CIE (30) + Assignment (5) + Attendance (5) + Record (5) + Online Test (5) = 50
  const otherComponents = 
    this.assignmentMark + 
    this.attendanceMark + 
    this.recordMark + 
    this.onlineTestMark;

  this.internalTotal = parseFloat((totalCieContribution + otherComponents).toFixed(2));

  // 3. Convert Semester Mark (100 -> 50)
  this.semesterConverted = parseFloat(((this.semesterMark / 100) * 50).toFixed(2));

  // 4. Compute Final Total (Max 100)
  this.finalTotal = parseFloat((this.internalTotal + this.semesterConverted).toFixed(2));

  // 5. Determine Result (Pass Condition: >= 50)
  this.result = this.finalTotal >= 50 ? 'PASS' : 'FAIL';

  // 6. Assign Grade
  if (this.finalTotal >= 90) {
    this.grade = 'O';
  } else if (this.finalTotal >= 80) {
    this.grade = 'A+';
  } else if (this.finalTotal >= 70) {
    this.grade = 'A';
  } else if (this.finalTotal >= 60) {
    this.grade = 'B+';
  } else if (this.finalTotal >= 50) {
    this.grade = 'B';
  } else {
    this.grade = 'RA'; // Reappear/Fail
  }

  // Force Fail if total is < 50 regardless of grade logic (double check)
  if (this.finalTotal < 50) {
    this.grade = 'RA';
    this.result = 'FAIL';
  }

  next();
});

module.exports = mongoose.model('Mark', MarkSchema);
