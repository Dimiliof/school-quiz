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
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Chip,
  Grid,
  Divider,
  Stack,
} from '@mui/material';
import { quizAPI } from '../services/api';
import { Quiz, Question } from '../types';
import { useAuth } from '../contexts/AuthContext';

const QuizDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [showResults, setShowResults] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [score, setScore] = useState<number>(0);
  const [startTime, setStartTime] = useState<Date | null>(null);

  useEffect(() => {
    // Fetch quiz details from API
    const fetchQuiz = async () => {
      if (!id) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const quizData = await quizAPI.getQuizById(id);
        setQuiz(quizData);
        
        // Initialize answers array with -1 (unanswered) for each question
        setAnswers(new Array(quizData.questions.length).fill(-1));
        
        // Set the timer
        setTimeLeft(quizData.timeLimit * 60);
        
        // Record start time
        setStartTime(new Date());
        
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load quiz');
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [id]);

  useEffect(() => {
    if (!quiz || timeLeft <= 0) return;
    
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
  }, [quiz, timeLeft]);

  const handleAnswerChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = parseInt(event.target.value, 10);
    setAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < (quiz?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    if (!quiz || !id) return;
    
    // Don't submit if already submitting
    if (submitting) return;
    
    setSubmitting(true);
    
    try {
      // Filter out unanswered questions
      const validAnswers = answers.map(answer => answer === -1 ? 0 : answer);
      
      // Submit answers to the API
      const result = await quizAPI.submitQuiz(id, validAnswers);
      
      setScore(result.score);
      setShowResults(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const calculateProgress = (): number => {
    const answered = answers.filter(a => a !== -1).length;
    return (answered / answers.length) * 100;
  };

  const navigateToQuizzes = () => {
    navigate('/quizzes');
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Button variant="outlined" onClick={navigateToQuizzes}>
            Back to Quizzes
          </Button>
        </Paper>
      </Container>
    );
  }

  if (!quiz) {
    return (
      <Container sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Alert severity="warning">
            Quiz not found or has been removed.
          </Alert>
          <Button variant="outlined" onClick={navigateToQuizzes} sx={{ mt: 2 }}>
            Back to Quizzes
          </Button>
        </Paper>
      </Container>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 6 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              {quiz.title}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              <Chip label={quiz.subject} color="primary" size="small" />
              <Chip label={`${quiz.timeLimit} minutes`} size="small" />
              <Chip label={`${quiz.questions.length} questions`} size="small" />
            </Stack>
            <Typography variant="body1" color="text.secondary">
              {quiz.description}
            </Typography>
          </Box>
          
          <Divider sx={{ mb: 3 }} />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Time left: <Chip label={formatTime(timeLeft)} color={timeLeft < 60 ? "error" : "default"} />
            </Typography>
            <Typography variant="body2">
              Progress: {calculateProgress().toFixed(0)}% complete
            </Typography>
          </Box>
          
          <LinearProgress 
            variant="determinate" 
            value={calculateProgress()} 
            sx={{ mb: 3, height: 8, borderRadius: 4 }} 
          />
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Card variant="outlined" sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Question {currentQuestionIndex + 1} of {quiz.questions.length}
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {currentQuestion.question}
                  </Typography>
                  
                  <FormControl component="fieldset" sx={{ width: '100%' }}>
                    <RadioGroup
                      value={answers[currentQuestionIndex].toString()}
                      onChange={handleAnswerChange}
                    >
                      {currentQuestion.options.map((option, index) => (
                        <FormControlLabel
                          key={index}
                          value={index.toString()}
                          control={<Radio />}
                          label={option}
                          sx={{ 
                            mt: 1,
                            p: 1,
                            borderRadius: 1,
                            transition: 'all 0.2s',
                            '&:hover': { bgcolor: 'action.hover' }
                          }}
                        />
                      ))}
                    </RadioGroup>
                  </FormControl>
                </CardContent>
              </Card>
            
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                <Button
                  variant="outlined"
                  onClick={handlePrevQuestion}
                  disabled={currentQuestionIndex === 0}
                >
                  Previous
                </Button>
                {currentQuestionIndex < quiz.questions.length - 1 ? (
                  <Button
                    variant="contained"
                    onClick={handleNextQuestion}
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit}
                    disabled={submitting}
                  >
                    {submitting ? 'Submitting...' : 'Submit Quiz'}
                  </Button>
                )}
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Question Navigator
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {answers.map((answer, index) => (
                      <Chip
                        key={index}
                        label={index + 1}
                        color={answer !== -1 ? 'primary' : 'default'}
                        variant={currentQuestionIndex === index ? 'filled' : 'outlined'}
                        onClick={() => setCurrentQuestionIndex(index)}
                        sx={{ minWidth: 40 }}
                      />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>
      </Box>

      <Dialog
        open={showResults}
        onClose={() => {}}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Quiz Results</DialogTitle>
        <DialogContent>
          <Box sx={{ py: 2 }}>
            <Typography variant="h4" align="center" gutterBottom>
              {score}%
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={score} 
              color={score >= 70 ? "success" : score >= 50 ? "warning" : "error"}
              sx={{ height: 10, borderRadius: 5, mb: 3 }} 
            />
            <Typography variant="body1" gutterBottom>
              Thank you for completing the quiz!
            </Typography>
            {startTime && (
              <Typography variant="body2" color="text.secondary">
                Time taken: {Math.round((new Date().getTime() - startTime.getTime()) / 60000)} minutes
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={navigateToQuizzes} color="primary">
            Back to Quizzes
          </Button>
          {user?.role === 'student' && (
            <Button onClick={() => navigate('/dashboard')} color="primary" variant="contained">
              View All Results
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default QuizDetail; 