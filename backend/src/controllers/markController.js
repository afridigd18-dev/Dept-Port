const Mark = require('../models/Mark');
const fs = require('fs');
const csv = require('csv-parser');
const Student = require('../models/Student');

// @desc    Bulk Upload Marks via CSV
// @route   POST /api/marks/bulk-upload
// @access  Private (Faculty/Admin)
exports.bulkUploadMarks = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Please upload a CSV file' });
  }

  const marks = [];
  const errors = [];
  let rowCount = 0;

  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (row) => {
      rowCount++;
      marks.push({ ...row, rowNumber: rowCount });
    })
    .on('end', async () => {
      const results = [];
      for (const m of marks) {
        try {
          // Find student by register number
          const student = await Student.findOne({ registerNumber: m.registerNumber });
          if (!student) {
            errors.push(`Row ${m.rowNumber}: Student with Reg ${m.registerNumber} not found.`);
            continue;
          }

          const markData = {
            studentId: student._id,
            classCode: student.classCode,
            subject: m.subject,
            cie1: Number(m.cie1),
            cie2: Number(m.cie2),
            cie3: Number(m.cie3),
            assignmentMark: Number(m.assignmentMark),
            attendanceMark: Number(m.attendanceMark),
            recordMark: Number(m.recordMark),
            onlineTestMark: Number(m.onlineTestMark),
            semesterMark: Number(m.semesterMark),
            updatedBy: req.user.id
          };

          // Check if already exists
          let existingMark = await Mark.findOne({ studentId: student._id, subject: m.subject });
          if (existingMark) {
            Object.assign(existingMark, markData);
            await existingMark.save();
          } else {
            await Mark.create(markData);
          }
          results.push(m.registerNumber);
        } catch (err) {
          errors.push(`Row ${m.rowNumber}: ${err.message}`);
        }
      }

      // Cleanup file
      fs.unlinkSync(req.file.path);

      res.status(200).json({
        success: true,
        count: results.length,
        errors: errors.length > 0 ? errors : undefined,
        message: `Successfully processed ${results.length} records.`
      });
    });
};

// @desc    Add new marks (Faculty/Admin only)
// @route   POST /api/marks/add
// @access  Private (Faculty/Admin)
exports.addMark = async (req, res) => {
  try {
    const { studentId, classCode, subject, cie1, cie2, cie3, assignmentMark, attendanceMark, recordMark, onlineTestMark, semesterMark } = req.body;

    // Validation
    if (cie1 > 50 || cie2 > 50 || cie3 > 50) return res.status(400).json({ error: 'CIE marks cannot exceed 50' });
    if (semesterMark > 100) return res.status(400).json({ error: 'Semester marks cannot exceed 100' });
    if (assignmentMark > 5 || attendanceMark > 5 || recordMark > 5 || onlineTestMark > 5) return res.status(400).json({ error: 'Other internal marks cannot exceed 5' });
    if (cie1 < 0 || cie2 < 0 || cie3 < 0 || semesterMark < 0 || assignmentMark < 0 || attendanceMark < 0 || recordMark < 0 || onlineTestMark < 0) return res.status(400).json({ error: 'Marks cannot be negative' });

    // Check for existing marks
    const existingMark = await Mark.findOne({ studentId, subject });
    if (existingMark) {
      return res.status(400).json({ error: `Marks already exist for this student in ${subject}. Use PUT to update.` });
    }

    const newMark = new Mark({
      studentId,
      classCode,
      subject,
      cie1, cie2, cie3,
      assignmentMark, attendanceMark, recordMark, onlineTestMark,
      semesterMark,
      updatedBy: req.user ? req.user.id : null // Assuming auth middleware sets req.user
    });

    // Calculations happen in pre-save hook
    await newMark.save();

    res.status(201).json({ success: true, data: newMark });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Update marks
// @route   PUT /api/marks/update/:id
// @access  Private (Faculty/Admin)
exports.updateMark = async (req, res) => {
  try {
    const mark = await Mark.findById(req.params.id);
    if (!mark) return res.status(404).json({ error: 'Mark entry not found' });

    // Update fields
    const fieldsToUpdate = ['cie1', 'cie2', 'cie3', 'assignmentMark', 'attendanceMark', 'recordMark', 'onlineTestMark', 'semesterMark', 'remarks', 'status'];
    
    fieldsToUpdate.forEach(field => {
      if (req.body[field] !== undefined) mark[field] = req.body[field];
    });

    mark.updatedBy = req.user ? req.user.id : null;

    // Triggers pre-save hook for recalculation
    await mark.save();

    res.status(200).json({ success: true, data: mark });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get all marks for a student
// @route   GET /api/marks/student/:studentId
// @access  Private (Student/Faculty/Admin)
exports.getStudentMarks = async (req, res) => {
  try {
    const marks = await Mark.find({ studentId: req.params.studentId }).sort({ subject: 1 });
    res.status(200).json({ success: true, count: marks.length, data: marks });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get class report
// @route   GET /api/marks/class/:classCode
// @access  Private (Faculty/Admin)
exports.getClassReport = async (req, res) => {
  try {
    const marks = await Mark.find({ classCode: req.params.classCode }).sort({ studentId: 1 });
    res.status(200).json({ success: true, count: marks.length, data: marks });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Delete a mark entry
// @route   DELETE /api/marks/:id
// @access  Private (Faculty/Admin)
exports.deleteMark = async (req, res) => {
  try {
    const mark = await Mark.findById(req.params.id);
    if (!mark) return res.status(404).json({ error: 'Mark entry not found' });

    await mark.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// =====================================================
// ADVANCED ANALYTICS
// =====================================================

// @desc    Get Class Summary Stats
// @route   GET /api/analytics/class-summary/:classCode
exports.getClassSummary = async (req, res) => {
  try {
    const stats = await Mark.aggregate([
      { $match: { classCode: req.params.classCode } },
      {
        $group: {
          _id: '$classCode',
          averageFinal: { $avg: '$finalTotal' },
          highestFinal: { $max: '$finalTotal' },
          lowestFinal: { $min: '$finalTotal' },
          totalStudents: { $sum: 1 },
          passCount: {
            $sum: { $cond: [{ $eq: ['$result', 'PASS'] }, 1, 0] }
          },
          failCount: {
            $sum: { $cond: [{ $eq: ['$result', 'FAIL'] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          _id: 0,
          averageFinal: { $round: ['$averageFinal', 2] },
          highestFinal: 1,
          lowestFinal: 1,
          totalStudents: 1,
          passCount: 1,
          failCount: 1,
          passPercentage: { $round: [{ $multiply: [{ $divide: ['$passCount', '$totalStudents'] }, 100] }, 2] },
          failPercentage: { $round: [{ $multiply: [{ $divide: ['$failCount', '$totalStudents'] }, 100] }, 2] }
        }
      }
    ]);

    if (!stats.length) return res.status(404).json({ error: 'No data found for this class' });

    res.status(200).json({ success: true, data: stats[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get Class Toppers
// @route   GET /api/analytics/topper/:classCode
exports.getToppers = async (req, res) => {
  try {
    const toppers = await Mark.find({ classCode: req.params.classCode })
      .sort({ finalTotal: -1 })
      .limit(5)
      .select('studentId subject finalTotal grade'); // Assuming you'd populate studentId with name in real app

    res.status(200).json({ success: true, data: toppers });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get Subject Analysis
// @route   GET /api/analytics/subject-analysis/:subject
exports.getSubjectAnalysis = async (req, res) => {
  try {
    const analysis = await Mark.aggregate([
      { $match: { subject: req.params.subject } },
      {
        $group: {
          _id: '$subject',
          averageScore: { $avg: '$finalTotal' },
          maxScore: { $max: '$finalTotal' },
          minScore: { $min: '$finalTotal' },
          gradeDistribution: { $push: '$grade' } // Collect all grades for distribution
        }
      },
      {
        $project: {
          _id: 0,
          subject: '$_id',
          averageScore: { $round: ['$averageScore', 2] },
          maxScore: 1,
          minScore: 1,
          gradeDistribution: 1
        }
      }
    ]);
    
    res.status(200).json({ success: true, data: analysis[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
