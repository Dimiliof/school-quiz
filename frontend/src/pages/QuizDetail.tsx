import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Button,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Quiz, Question } from '../types';

const QuizDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch quiz details from API
    const fetchQuiz = async () => {
      try {
        // Simulated API call
        const mockQuiz: Quiz = {
          _id: id || '1',
          title: 'Math Basics',
          description: 'Test your basic math skills',
          questions: [
            {
              _id: '1',
              question: 'What is 2 + 2?',
              options: ['3', '4', '5', '6'],
              correctAnswer: 1,
              points: 1,
            },
            {
              _id: '2',
              question: 'What is 5 × 3?',
              options: ['12', '15', '18', '20'],
              correctAnswer: 1,
              points: 1,
            },
          ],
          createdBy: {
            _id: '1',
            username: 'teacher1',
            email: 'teacher1@example.com',
            role: 'teacher',
            createdAt: new Date().toISOString(),
          },
          subject: 'Mathematics',
          timeLimit: 30,
          isActive: true,
          createdAt: new Date().toISOString(),
        };
        setQuiz(mockQuiz);
        setTimeLeft(mockQuiz.timeLimit * 60);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching quiz:', error);
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [id]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeLeft]);

  const handleAnswerChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = parseInt(event.target.value);
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestionIndex < (quiz?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = () => {
    setShowResults(true);
  };

  const calculateScore = () => {
    if (!quiz) return 0;
    return answers.reduce((score, answer, index) => {
      if (answer === quiz.questions[index].correctAnswer) {
        return score + quiz.questions[index].points;
      }
      return score;
    }, 0);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <Container>
        <Typography>Loading quiz...</Typography>
      </Container>
    );
  }

  if (!quiz) {
    return (
      <Container>
        <Typography>Quiz not found</Typography>
      </Container>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {quiz.title}
        </Typography>
        <Typography color="textSecondary" paragraph>
          {quiz.description}
        </Typography>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Time Remaining: {formatTime(timeLeft)}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={(timeLeft / (quiz.timeLimit * 60)) * 100}
          />
        </Box>
        <Paper elevation={3} sx={{ p: 3, mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Question {currentQuestionIndex + 1} of {quiz.questions.length}
          </Typography>
          <Typography variant="body1" paragraph>
            {currentQuestion.question}
          </Typography>
          <FormControl component="fieldset">
            <RadioGroup
              value={answers[currentQuestionIndex]?.toString() || ''}
              onChange={handleAnswerChange}
            >
              {currentQuestion.options.map((option, index) => (
                <FormControlLabel
                  key={index}
                  value={index.toString()}
                  control={<Radio />}
                  label={option}
                />
              ))}
            </RadioGroup>
          </FormControl>
        </Paper>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            variant="contained"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
          >
            Previous
          </Button>
          {currentQuestionIndex === quiz.questions.length - 1 ? (
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
            >
              Submit
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
            >
              Next
            </Button>
          )}
        </Box>
      </Box>

      <Dialog open={showResults} onClose={() => navigate('/quizzes')}>
        <DialogTitle>Quiz Results</DialogTitle>
        <DialogContent>
          <Typography variant="h6" gutterBottom>
            Your Score: {calculateScore()} / {quiz.questions.reduce((total, q) => total + q.points, 0)}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => navigate('/quizzes')}>
            Back to Quizzes
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default QuizDetail; 