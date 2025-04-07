const mongoose = require('mongoose');

const quizResultSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  answers: {
    type: [Number],
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  timeSpent: {
    type: Number, // in seconds
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const QuizResult = mongoose.model('QuizResult', quizResultSchema);

module.exports = QuizResult; 