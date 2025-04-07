const express = require('express');
const router = express.Router();
const {
  getAllQuizzes,
  getActiveQuizzes,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  submitQuiz,
} = require('../controllers/quizController');
const { protect, teacherOnly } = require('../middleware/authMiddleware');

// Routes
router.get('/', protect, getAllQuizzes);
router.get('/active', protect, getActiveQuizzes);
router.get('/:id', protect, getQuizById);
router.post('/', protect, teacherOnly, createQuiz);
router.put('/:id', protect, teacherOnly, updateQuiz);
router.delete('/:id', protect, teacherOnly, deleteQuiz);
router.post('/:id/submit', protect, submitQuiz);

module.exports = router; 