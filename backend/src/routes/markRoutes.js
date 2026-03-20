const express = require('express');
const router = express.Router();
const { 
  addMark, 
  updateMark, 
  getStudentMarks, 
  getClassReport, 
  deleteMark,
  getClassSummary,
  getToppers,
  getSubjectAnalysis,
  bulkUploadMarks // Added
} = require('../controllers/markController');
const { protect, authorize } = require('../middleware/authMiddleware');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// Base Route: /api/marks

// CRUD Operations
router.route('/add')
  .post(protect, authorize('FACULTY', 'ADMIN'), addMark);

router.route('/bulk-upload')
  .post(protect, authorize('FACULTY', 'ADMIN'), upload.single('file'), bulkUploadMarks);

router.route('/update/:id')
  .put(protect, authorize('FACULTY', 'ADMIN'), updateMark);

router.route('/student/:studentId')
  .get(protect, getStudentMarks); // Student can also view

router.route('/class/:classCode')
  .get(protect, authorize('FACULTY', 'ADMIN'), getClassReport);

router.route('/:id')
  .delete(protect, authorize('ADMIN'), deleteMark);

// Analytics Routes
router.route('/analytics/class-summary/:classCode')
  .get(protect, authorize('FACULTY', 'ADMIN'), getClassSummary);

router.route('/analytics/topper/:classCode')
  .get(protect, authorize('FACULTY', 'ADMIN'), getToppers);

router.route('/analytics/subject-analysis/:subject')
  .get(protect, authorize('FACULTY', 'ADMIN'), getSubjectAnalysis);

module.exports = router;
