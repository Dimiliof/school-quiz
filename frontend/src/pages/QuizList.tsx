import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  TextField,
  InputAdornment,
  Chip,
  Paper,
  CircularProgress,
  Alert,
  CardMedia,
  Divider,
  IconButton,
  Tooltip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import QuizIcon from '@mui/icons-material/Quiz';
import SubjectIcon from '@mui/icons-material/Subject';
import { Quiz } from '../types';
import { quizAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

// Function to generate a color based on the subject
const getSubjectColor = (subject: string): string => {
  const subjects: Record<string, string> = {
    'Mathematics': '#2196f3',
    'Science': '#4caf50',
    'History': '#ff9800',
    'Geography': '#9c27b0',
    'Literature': '#e91e63',
    'Language': '#3f51b5',
  };
  
  return subjects[subject] || '#607d8b'; // default color for other subjects
};

const QuizList: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState<Quiz[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<string[]>([]);

  useEffect(() => {
    // Fetch quizzes from API
    const fetchQuizzes = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Get active quizzes for students, or all quizzes for teachers
        const quizData = user?.role === 'teacher' 
          ? await quizAPI.getAllQuizzes()
          : await quizAPI.getActiveQuizzes();
          
        setQuizzes(quizData);
        
        // Extract unique subjects for the filter
        const uniqueSubjects = Array.from(
          new Set(quizData.map((quiz: Quiz) => quiz.subject))
        ).sort();
        
        setSubjects(uniqueSubjects);
        
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load quizzes');
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, [user]);

  // Filter quizzes based on search term and subject filter
  useEffect(() => {
    let filtered = [...quizzes];
    
    // Apply search filter
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(quiz => 
        quiz.title.toLowerCase().includes(term) || 
        quiz.description.toLowerCase().includes(term) ||
        quiz.subject.toLowerCase().includes(term)
      );
    }
    
    // Apply subject filter
    if (subjectFilter !== 'all') {
      filtered = filtered.filter(quiz => quiz.subject === subjectFilter);
    }
    
    setFilteredQuizzes(filtered);
  }, [quizzes, searchTerm, subjectFilter]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSubjectFilterChange = (e: SelectChangeEvent) => {
    setSubjectFilter(e.target.value);
  };

  const handleTakeQuiz = (id: string) => {
    navigate(`/quizzes/${id}`);
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
      <Box sx={{ mt: 4, mb: 6 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              Available Quizzes
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Browse and take quizzes on various subjects
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 4 }}>
            <TextField
              fullWidth
              placeholder="Search quizzes by title, description or subject..."
              value={searchTerm}
              onChange={handleSearchChange}
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            
            <FormControl sx={{ minWidth: { xs: '100%', sm: 200 } }}>
              <InputLabel>Filter by Subject</InputLabel>
              <Select
                value={subjectFilter}
                onChange={handleSubjectFilterChange}
                label="Filter by Subject"
                startAdornment={
                  <InputAdornment position="start">
                    <FilterListIcon fontSize="small" />
                  </InputAdornment>
                }
              >
                <MenuItem value="all">All Subjects</MenuItem>
                {subjects.map((subject) => (
                  <MenuItem key={subject} value={subject}>{subject}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {filteredQuizzes.length === 0 ? (
            <Alert severity="info">
              {quizzes.length === 0 
                ? 'No quizzes available at the moment.' 
                : 'No quizzes match your search criteria.'}
            </Alert>
          ) : (
            <Grid container spacing={3}>
              {filteredQuizzes.map((quiz) => (
                <Grid item xs={12} sm={6} md={4} key={quiz._id}>
                  <Card 
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
                      },
                    }}
                  >
                    <CardMedia
                      sx={{ 
                        height: 140, 
                        bgcolor: getSubjectColor(quiz.subject),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography 
                        variant="h5" 
                        component="div"
                        color="white"
                        sx={{ 
                          fontWeight: 600,
                          textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                        }}
                      >
                        {quiz.subject}
                      </Typography>
                    </CardMedia>
                    <CardContent sx={{ flexGrow: 1, pt: 3 }}>
                      <Typography variant="h6" component="h2" gutterBottom>
                        {quiz.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {quiz.description}
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AccessTimeIcon fontSize="small" color="action" />
                          <Typography variant="body2">
                            {quiz.timeLimit} minutes
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <QuizIcon fontSize="small" color="action" />
                          <Typography variant="body2">
                            {quiz.questions?.length || 0} questions
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <SubjectIcon fontSize="small" color="action" />
                          <Typography variant="body2">
                            Created by {quiz.createdBy.username}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                    <Divider />
                    <CardActions sx={{ p: 2 }}>
                      <Button 
                        fullWidth
                        variant="contained" 
                        onClick={() => handleTakeQuiz(quiz._id)}
                        color="primary"
                      >
                        Take Quiz
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default QuizList; 