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
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { Quiz } from '../types';

const QuizList: React.FC = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch quizzes from API
    const fetchQuizzes = async () => {
      try {
        // Simulated API call
        const mockQuizzes: Quiz[] = [
          {
            _id: '1',
            title: 'Math Basics',
            description: 'Test your basic math skills',
            questions: [],
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
          },
          {
            _id: '2',
            title: 'Science Quiz',
            description: 'Basic science concepts',
            questions: [],
            createdBy: {
              _id: '2',
              username: 'teacher2',
              email: 'teacher2@example.com',
              role: 'teacher',
              createdAt: new Date().toISOString(),
            },
            subject: 'Science',
            timeLimit: 45,
            isActive: true,
            createdAt: new Date().toISOString(),
          },
        ];
        setQuizzes(mockQuizzes);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching quizzes:', error);
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  const filteredQuizzes = quizzes.filter(quiz =>
    quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quiz.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quiz.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Available Quizzes
        </Typography>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search quizzes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 4 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        {loading ? (
          <Typography>Loading quizzes...</Typography>
        ) : (
          <Grid container spacing={3}>
            {filteredQuizzes.map((quiz) => (
              <Grid item xs={12} sm={6} md={4} key={quiz._id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" component="h2" gutterBottom>
                      {quiz.title}
                    </Typography>
                    <Typography color="textSecondary" gutterBottom>
                      {quiz.description}
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Chip
                        label={quiz.subject}
                        color="primary"
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      <Chip
                        label={`${quiz.timeLimit} minutes`}
                        variant="outlined"
                        size="small"
                      />
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      color="primary"
                      onClick={() => navigate(`/quizzes/${quiz._id}`)}
                    >
                      Take Quiz
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Container>
  );
};

export default QuizList; 