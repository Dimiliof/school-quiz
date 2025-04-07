import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Paper,
  Grid,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Divider,
  Card,
  CardContent,
  CardActions,
  Alert,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAuth } from '../contexts/AuthContext';
import { quizAPI } from '../services/api';
import { Quiz, Question } from '../types';

const QuizForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [quiz, setQuiz] = useState<Partial<Quiz>>({
    title: '',
    description: '',
    subject: '',
    timeLimit: 30,
    questions: [],
  });

  useEffect(() => {
    if (id) {
      setLoading(true);
      quizAPI.getQuizById(id)
        .then((data) => {
          setQuiz(data);
        })
        .catch((err) => {
          setError('Failed to load quiz. Please try again.');
          console.error(err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setQuiz((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setQuiz((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setQuiz((prev) => ({
      ...prev,
      [name]: parseInt(value, 10) || 0,
    }));
  };

  const addQuestion = () => {
    setQuiz((prev) => ({
      ...prev,
      questions: [
        ...(prev.questions || []),
        {
          question: '',
          options: ['', '', '', ''],
          correctAnswer: 0,
          points: 1,
        },
      ],
    }));
  };

  const removeQuestion = (index: number) => {
    setQuiz((prev) => ({
      ...prev,
      questions: prev.questions?.filter((_, i) => i !== index),
    }));
  };

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    setQuiz((prev) => {
      const updatedQuestions = [...(prev.questions || [])];
      updatedQuestions[index] = {
        ...updatedQuestions[index],
        [field]: value,
      };
      return {
        ...prev,
        questions: updatedQuestions,
      };
    });
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    setQuiz((prev) => {
      const updatedQuestions = [...(prev.questions || [])];
      const updatedOptions = [...updatedQuestions[questionIndex].options];
      updatedOptions[optionIndex] = value;
      updatedQuestions[questionIndex] = {
        ...updatedQuestions[questionIndex],
        options: updatedOptions,
      };
      return {
        ...prev,
        questions: updatedQuestions,
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (id) {
        await quizAPI.updateQuiz(id, quiz);
        setSuccess('Quiz updated successfully!');
      } else {
        await quizAPI.createQuiz(quiz as any);
        setSuccess('Quiz created successfully!');
      }
      
      // Navigate to dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      setError('Failed to save quiz. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && id) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 6 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Tooltip title="Back to Dashboard">
              <IconButton onClick={() => navigate('/dashboard')} sx={{ mr: 2 }}>
                <ArrowBackIcon />
              </IconButton>
            </Tooltip>
            <Typography variant="h4" component="h1">
              {id ? 'Edit Quiz' : 'Create New Quiz'}
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {success}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Quiz Title"
                  name="title"
                  value={quiz.title}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={quiz.description}
                  onChange={handleChange}
                  multiline
                  rows={3}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Subject</InputLabel>
                  <Select
                    name="subject"
                    value={quiz.subject}
                    onChange={handleSelectChange}
                    label="Subject"
                    required
                  >
                    <MenuItem value="Mathematics">Mathematics</MenuItem>
                    <MenuItem value="Science">Science</MenuItem>
                    <MenuItem value="History">History</MenuItem>
                    <MenuItem value="Geography">Geography</MenuItem>
                    <MenuItem value="Literature">Literature</MenuItem>
                    <MenuItem value="Language">Language</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Time Limit (minutes)"
                  name="timeLimit"
                  type="number"
                  value={quiz.timeLimit}
                  onChange={handleNumberChange}
                  inputProps={{ min: 1 }}
                  required
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 4 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5">Questions</Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={addQuestion}
                color="primary"
              >
                Add Question
              </Button>
            </Box>

            {quiz.questions?.map((question, questionIndex) => (
              <Card key={questionIndex} sx={{ mb: 3 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6">Question {questionIndex + 1}</Typography>
                    <IconButton
                      color="error"
                      onClick={() => removeQuestion(questionIndex)}
                      aria-label="delete question"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                  <TextField
                    fullWidth
                    label="Question Text"
                    value={question.question}
                    onChange={(e) => updateQuestion(questionIndex, 'question', e.target.value)}
                    margin="normal"
                    required
                  />
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    {question.options.map((option, optionIndex) => (
                      <Grid item xs={12} sm={6} key={optionIndex}>
                        <TextField
                          fullWidth
                          label={`Option ${optionIndex + 1}`}
                          value={option}
                          onChange={(e) => updateOption(questionIndex, optionIndex, e.target.value)}
                          required
                        />
                      </Grid>
                    ))}
                  </Grid>
                  <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                    <FormControl sx={{ minWidth: 200 }}>
                      <InputLabel>Correct Answer</InputLabel>
                      <Select
                        value={question.correctAnswer}
                        onChange={(e) => updateQuestion(questionIndex, 'correctAnswer', e.target.value)}
                        label="Correct Answer"
                        required
                      >
                        {question.options.map((_, index) => (
                          <MenuItem key={index} value={index}>
                            Option {index + 1}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <TextField
                      label="Points"
                      type="number"
                      value={question.points}
                      onChange={(e) => updateQuestion(questionIndex, 'points', parseInt(e.target.value, 10) || 0)}
                      inputProps={{ min: 1 }}
                      sx={{ width: 100 }}
                      required
                    />
                  </Box>
                </CardContent>
              </Card>
            ))}

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                startIcon={<SaveIcon />}
                disabled={loading || !quiz.questions?.length}
              >
                {loading ? 'Saving...' : id ? 'Update Quiz' : 'Create Quiz'}
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default QuizForm; 