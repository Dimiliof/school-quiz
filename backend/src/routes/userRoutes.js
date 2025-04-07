const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  updateUserProfile,
  getQuizResults,
  getQuizResultById,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// Routes
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.get('/results', protect, getQuizResults);
router.get('/results/:id', protect, getQuizResultById);

module.exports = router; 