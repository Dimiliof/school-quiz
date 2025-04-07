import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  CardActions,
  Divider,
  Alert,
  CircularProgress,
  FormControlLabel,
  Switch,
  Chip,
  Stack,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { quizAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

// Predefined subjects
const subjects = [
  'Mathematics',
  'Science',
  'History',
  'Geography',
  'Literature',
  'Language',
  'Computer Science',
  'Art',
  'Music',
  'Physical Education',
  'Other',
];

// Empty question template
const emptyQuestion = {
  question: '',
  options: ['', ''],
  correctAnswer: 0,
  points: 1,
};

const QuizForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditMode = Boolean(id);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');
  const [timeLimit, setTimeLimit] = useState(30);
  const [questions, setQuestions] = useState([{ ...emptyQuestion }]);
  const [isActive, setIsActive] = useState(true);

  // UI states
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load quiz data if in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      const fetchQuiz = async () => {
        setLoading(true);
        setError(null);
        try {
          const quizData = await quizAPI.getQuizById(id);
          
          setTitle(quizData.title);
          setDescription(quizData.description || '');
          setSubject(quizData.subject);
          setTimeLimit(quizData.timeLimit);
          setQuestions(quizData.questions);
          setIsActive(quizData.isActive);
          
          setLoading(false);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to load quiz');
          setLoading(false);
        }
      };
      
      fetchQuiz();
    }
  }, [id, isEditMode]);

  // Check if user is a teacher
  useEffect(() => {
    if (user && user.role !== 'teacher') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDescription(e.target.value);
  };

  const handleSubjectChange = (e: React.ChangeEvent<{ value: unknown }>) => {
    setSubject(e.target.value as string);
  };

  const handleTimeLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    setTimeLimit(value > 0 ? value : 1);
  };

  const handleQuestionChange = (index: number, field: string, value: string) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value,
    };
    setQuestions(updatedQuestions);
  };

  const handleOptionChange = (questionIndex: number, optionIndex: number, value: string) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(updatedQuestions);
  };

  const handleCorrectAnswerChange = (questionIndex: number, optionIndex: number) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].correctAnswer = optionIndex;
    setQuestions(updatedQuestions);
  };

  const handlePointsChange = (questionIndex: number, value: string) => {
    const points = parseInt(value, 10);
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].points = points > 0 ? points : 1;
    setQuestions(updatedQuestions);
  };

  const addOption = (questionIndex: number) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options.push('');
    setQuestions(updatedQuestions);
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const updatedQuestions = [...questions];
    const question = updatedQuestions[questionIndex];
    
    // Don't remove if there are only 2 options
    if (question.options.length <= 2) return;
    
    // Remove the option
    question.options.splice(optionIndex, 1);
    
    // If the correct answer is the removed option or after it, adjust it
    if (question.correctAnswer >= optionIndex) {
      question.correctAnswer = Math.max(0, question.correctAnswer - 1);
    }
    
    setQuestions(updatedQuestions);
  };

  const addQuestion = () => {
    setQuestions([...questions, { ...emptyQuestion }]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length <= 1) return;
    
    const updatedQuestions = [...questions];
    updatedQuestions.splice(index, 1);
    setQuestions(updatedQuestions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!title || !subject || questions.length === 0) {
      setError('Please provide a title, subject, and at least one question');
      return;
    }
    
    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question) {
        setError(`Question ${i + 1} must have a question text`);
        return;
      }
      
      if (q.options.some(opt => !opt)) {
        setError(`All options in question ${i + 1} must have text`);
        return;
      }
    }
    
    setSaving(true);
    setError(null);
    setSuccess(null);
    
    const quizData = {
      title,
      description,
      subject,
      timeLimit,
      questions,
      isActive,
    };
    
    try {
      if (isEditMode && id) {
        await quizAPI.updateQuiz(id, quizData);
        setSuccess('Quiz updated successfully!');
      } else {
        await quizAPI.createQuiz(quizData);
        setSuccess('Quiz created successfully!');
      }
      
      // Navigate to dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save quiz');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4, mb: 6 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <IconButton 
              onClick={() => navigate('/dashboard')} 
              sx={{ mr: 2 }}
              aria-label="back"
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4" component="h1">
              {isEditMode ? 'Edit Quiz' : 'Create New Quiz'}
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
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="Quiz Title"
                value={title}
                onChange={handleTitleChange}
                margin="normal"
                variant="outlined"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal" required>
                <InputLabel>Subject</InputLabel>
                <Select
                  value={subject}
                  onChange={handleSubjectChange}
                  label="Subject"
                >
                  {subjects.map((sub) => (
                    <MenuItem key={sub} value={sub}>
                      {sub}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Time Limit (minutes)"
                type="number"
                value={timeLimit}
                onChange={handleTimeLimitChange}
                margin="normal"
                variant="outlined"
                inputProps={{ min: 1 }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box sx={{ mt: 3, display: 'flex', alignItems: 'center' }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Quiz is active and available to students"
                />
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description (optional)"
                value={description}
                onChange={handleDescriptionChange}
                margin="normal"
                variant="outlined"
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 4 }} />
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              Questions
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Add at least one question with multiple choice answers. Mark the correct answer.
            </Typography>
          </Box>
          
          {questions.map((question, questionIndex) => (
            <Card key={questionIndex} variant="outlined" sx={{ mb: 4, position: 'relative' }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <Chip 
                    label={`Question ${questionIndex + 1}`} 
                    color="primary" 
                    variant="outlined" 
                  />
                  <TextField
                    type="number"
                    label="Points"
                    value={question.points}
                    onChange={(e) => handlePointsChange(questionIndex, e.target.value)}
                    size="small"
                    inputProps={{ min: 1 }}
                    sx={{ width: 80 }}
                  />
                  <Box sx={{ flexGrow: 1 }} />
                  {questions.length > 1 && (
                    <IconButton 
                      onClick={() => removeQuestion(questionIndex)}
                      color="error"
                      size="small"
                      aria-label="remove question"
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Stack>
                
                <TextField
                  fullWidth
                  required
                  label="Question Text"
                  value={question.question}
                  onChange={(e) => handleQuestionChange(questionIndex, 'question', e.target.value)}
                  margin="normal"
                  variant="outlined"
                />
                
                <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
                  Answer Options
                </Typography>
                
                {question.options.map((option, optionIndex) => (
                  <Box key={optionIndex} sx={{ display: 'flex', mb: 2, alignItems: 'center' }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={question.correctAnswer === optionIndex}
                          onChange={(e) => handleCorrectAnswerChange(questionIndex, optionIndex)}
                          color="success"
                        />
                      }
                      label=""
                      sx={{ mr: 0 }}
                    />
                    <TextField
                      fullWidth
                      required
                      label={`Option ${optionIndex + 1}`}
                      value={option}
                      onChange={(e) => handleOptionChange(questionIndex, optionIndex, e.target.value)}
                      variant="outlined"
                      size="small"
                    />
                    {question.options.length > 2 && (
                      <IconButton
                        onClick={() => removeOption(questionIndex, optionIndex)}
                        color="error"
                        size="small"
                        aria-label="remove option"
                        sx={{ ml: 1 }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                ))}
                
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => addOption(questionIndex)}
                  size="small"
                  sx={{ mt: 1 }}
                >
                  Add Option
                </Button>
              </CardContent>
            </Card>
          ))}
          
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={addQuestion}
            sx={{ mb: 4 }}
          >
            Add Question
          </Button>
          
          <Divider sx={{ mb: 4 }} />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button 
              variant="outlined"
              onClick={() => navigate('/dashboard')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              disabled={saving}
            >
              {saving ? 'Saving...' : isEditMode ? 'Update Quiz' : 'Create Quiz'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default QuizForm; 