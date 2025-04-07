const User = require('../models/User');
const Quiz = require('../models/Quiz');
const QuizResult = require('../models/QuizResult');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    res.json(user);
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    res.json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    user.username = req.body.username || user.username;
    user.email = req.body.email || user.email;

    if (req.body.password) {
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      role: updatedUser.role,
      createdAt: updatedUser.createdAt,
    });
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    res.json({ message: error.message });
  }
};

// @desc    Get user quiz results
// @route   GET /api/users/results
// @access  Private
const getQuizResults = async (req, res) => {
  try {
    let results;
    if (req.user.role === 'teacher') {
      // Get quizzes created by this teacher
      const quizzes = await Quiz.find({ createdBy: req.user._id }).select('_id');
      const quizIds = quizzes.map(q => q._id);
      
      // Get results for these quizzes
      results = await QuizResult.find({ quiz: { $in: quizIds } })
        .populate('user', 'username email')
        .populate('quiz', 'title subject');
    } else {
      // Get results for this student
      results = await QuizResult.find({ user: req.user._id })
        .populate('quiz', 'title subject');
    }

    // Format the results for the frontend
    const formattedResults = results.map(result => ({
      _id: result._id,
      quizId: result.quiz._id,
      quizTitle: result.quiz.title,
      studentName: result.user ? result.user.username : 'Anonymous',
      studentId: result.user ? result.user._id : null,
      score: result.score,
      answers: result.answers,
      date: result.createdAt,
    }));

    res.json(formattedResults);
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    res.json({ message: error.message });
  }
};

// @desc    Get a specific quiz result
// @route   GET /api/users/results/:id
// @access  Private
const getQuizResultById = async (req, res) => {
  try {
    const result = await QuizResult.findById(req.params.id)
      .populate('user', 'username email')
      .populate({
        path: 'quiz',
        populate: { path: 'questions' }
      });

    if (!result) {
      res.status(404);
      throw new Error('Result not found');
    }

    // Check if user has access to this result
    const isTeacher = req.user.role === 'teacher';
    const isCreator = result.quiz.createdBy.toString() === req.user._id.toString();
    const isOwner = result.user._id.toString() === req.user._id.toString();

    if (!(isTeacher && isCreator) && !isOwner) {
      res.status(403);
      throw new Error('Not authorized to access this result');
    }

    res.json({
      _id: result._id,
      quizId: result.quiz._id,
      quizTitle: result.quiz.title,
      studentName: result.user.username,
      studentId: result.user._id,
      score: result.score,
      answers: result.answers,
      questions: result.quiz.questions,
      date: result.createdAt,
    });
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    res.json({ message: error.message });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  getQuizResults,
  getQuizResultById,
}; 