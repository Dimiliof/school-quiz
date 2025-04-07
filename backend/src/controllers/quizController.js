const Quiz = require('../models/Quiz');
const QuizResult = require('../models/QuizResult');

// @desc    Get all quizzes
// @route   GET /api/quizzes
// @access  Private
const getAllQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find()
      .populate('createdBy', 'username')
      .select('-questions.correctAnswer');
    
    res.json(quizzes);
  } catch (error) {
    res.status(500);
    res.json({ message: error.message });
  }
};

// @desc    Get active quizzes (for students)
// @route   GET /api/quizzes/active
// @access  Private
const getActiveQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ isActive: true })
      .populate('createdBy', 'username')
      .select('-questions.correctAnswer');
    
    res.json(quizzes);
  } catch (error) {
    res.status(500);
    res.json({ message: error.message });
  }
};

// @desc    Get a quiz by ID
// @route   GET /api/quizzes/:id
// @access  Private
const getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate('createdBy', 'username');
    
    if (!quiz) {
      res.status(404);
      throw new Error('Quiz not found');
    }

    // If user is a student, hide correct answers
    if (req.user.role === 'student') {
      // Create a copy of quiz object without correct answers
      const sanitizedQuiz = JSON.parse(JSON.stringify(quiz));
      
      sanitizedQuiz.questions = sanitizedQuiz.questions.map(question => {
        const { correctAnswer, ...rest } = question;
        return rest;
      });
      
      res.json(sanitizedQuiz);
    } else {
      res.json(quiz);
    }
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    res.json({ message: error.message });
  }
};

// @desc    Create a new quiz
// @route   POST /api/quizzes
// @access  Private/Teacher
const createQuiz = async (req, res) => {
  try {
    const { title, description, subject, timeLimit, questions } = req.body;

    if (!title || !subject || !questions || questions.length === 0) {
      res.status(400);
      throw new Error('Please provide title, subject, and at least one question');
    }

    // Validate questions
    questions.forEach(question => {
      if (!question.question || !question.options || question.options.length < 2) {
        res.status(400);
        throw new Error('Each question must have a question text and at least 2 options');
      }
      
      if (question.correctAnswer === undefined || question.correctAnswer < 0 || question.correctAnswer >= question.options.length) {
        res.status(400);
        throw new Error('Each question must have a valid correct answer');
      }
    });

    const quiz = await Quiz.create({
      title,
      description,
      subject,
      timeLimit: timeLimit || 30,
      questions,
      createdBy: req.user._id,
    });

    res.status(201).json(quiz);
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    res.json({ message: error.message });
  }
};

// @desc    Update a quiz
// @route   PUT /api/quizzes/:id
// @access  Private/Teacher
const updateQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    
    if (!quiz) {
      res.status(404);
      throw new Error('Quiz not found');
    }

    // Check if user is the creator of the quiz
    if (quiz.createdBy.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to update this quiz');
    }

    // Update quiz fields
    const { title, description, subject, timeLimit, questions, isActive } = req.body;

    if (title) quiz.title = title;
    if (description !== undefined) quiz.description = description;
    if (subject) quiz.subject = subject;
    if (timeLimit) quiz.timeLimit = timeLimit;
    if (isActive !== undefined) quiz.isActive = isActive;
    
    if (questions && questions.length > 0) {
      // Validate questions
      questions.forEach(question => {
        if (!question.question || !question.options || question.options.length < 2) {
          res.status(400);
          throw new Error('Each question must have a question text and at least 2 options');
        }
        
        if (question.correctAnswer === undefined || question.correctAnswer < 0 || question.correctAnswer >= question.options.length) {
          res.status(400);
          throw new Error('Each question must have a valid correct answer');
        }
      });

      quiz.questions = questions;
    }

    const updatedQuiz = await quiz.save();
    res.json(updatedQuiz);
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    res.json({ message: error.message });
  }
};

// @desc    Delete a quiz
// @route   DELETE /api/quizzes/:id
// @access  Private/Teacher
const deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    
    if (!quiz) {
      res.status(404);
      throw new Error('Quiz not found');
    }

    // Check if user is the creator of the quiz
    if (quiz.createdBy.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to delete this quiz');
    }

    await quiz.remove();
    res.json({ message: 'Quiz removed' });
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    res.json({ message: error.message });
  }
};

// @desc    Submit a quiz
// @route   POST /api/quizzes/:id/submit
// @access  Private
const submitQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    
    if (!quiz) {
      res.status(404);
      throw new Error('Quiz not found');
    }

    if (!quiz.isActive && req.user.role !== 'teacher') {
      res.status(400);
      throw new Error('This quiz is not active');
    }

    const { answers, timeSpent } = req.body;

    if (!answers || !Array.isArray(answers)) {
      res.status(400);
      throw new Error('Please provide answers');
    }

    // Calculate score
    let correctCount = 0;
    let totalPoints = 0;
    
    quiz.questions.forEach((question, index) => {
      const userAnswer = answers[index] !== undefined ? answers[index] : -1;
      
      if (userAnswer === question.correctAnswer) {
        correctCount++;
        totalPoints += question.points || 1;
      }
    });

    const maxPoints = quiz.questions.reduce((sum, q) => sum + (q.points || 1), 0);
    const scorePercentage = Math.round((totalPoints / maxPoints) * 100);

    // Create result record
    const result = await QuizResult.create({
      user: req.user._id,
      quiz: quiz._id,
      answers,
      score: scorePercentage,
      timeSpent: timeSpent || 0,
    });

    res.status(201).json({
      _id: result._id,
      score: scorePercentage,
      correctCount,
      totalQuestions: quiz.questions.length,
      timeSpent: result.timeSpent,
    });
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    res.json({ message: error.message });
  }
};

module.exports = {
  getAllQuizzes,
  getActiveQuizzes,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  submitQuiz,
}; 