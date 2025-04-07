import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  IconButton,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Fab,
  Tooltip,
  Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useAuth } from '../contexts/AuthContext';
import { quizAPI, userAPI } from '../services/api';
import { Quiz, User } from '../types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        if (user?.role === 'teacher') {
          // For teachers, fetch their created quizzes
          const data = await quizAPI.getAllQuizzes();
          setQuizzes(data.filter((quiz: Quiz) => (quiz.createdBy as User)._id === user._id));
        } else {
          // For students, fetch available quizzes
          const data = await quizAPI.getAllQuizzes();
          setQuizzes(data);
        }

        // Fetch quiz results for both teachers and students
        const resultsData = await userAPI.getQuizResults();
        setResults(resultsData);
      } catch (err) {
        setError('Failed to load dashboard data. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCreateQuiz = () => {
    navigate('/quiz/create');
  };

  const handleEditQuiz = (id: string) => {
    navigate(`/quiz/edit/${id}`);
  };

  const handleViewQuiz = (id: string) => {
    navigate(`/quizzes/${id}`);
  };

  const handleDeleteQuiz = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this quiz?')) {
      try {
        await quizAPI.deleteQuiz(id);
        setQuizzes(quizzes.filter(quiz => quiz._id !== id));
      } catch (err) {
        setError('Failed to delete quiz. Please try again.');
        console.error(err);
      }
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
      <Box sx={{ mt: 4, mb: 6 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Dashboard
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            Welcome back, {user?.username}!
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 3 }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="dashboard tabs">
              <Tab label="My Quizzes" id="dashboard-tab-0" aria-controls="dashboard-tabpanel-0" />
              <Tab label="Results" id="dashboard-tab-1" aria-controls="dashboard-tabpanel-1" />
              <Tab label="Settings" id="dashboard-tab-2" aria-controls="dashboard-tabpanel-2" />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            {user?.role === 'teacher' && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={handleCreateQuiz}
                >
                  Create New Quiz
                </Button>
              </Box>
            )}

            {quizzes.length === 0 ? (
              <Alert severity="info">
                {user?.role === 'teacher' 
                  ? 'You haven\'t created any quizzes yet. Click the button above to create your first quiz!' 
                  : 'No quizzes available yet.'}
              </Alert>
            ) : (
              <Grid container spacing={3}>
                {quizzes.map((quiz) => (
                  <Grid item xs={12} sm={6} md={4} key={quiz._id}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" component="h2" gutterBottom>
                          {quiz.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          {quiz.description}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                          <Chip 
                            label={quiz.subject} 
                            size="small" 
                            color="primary" 
                            variant="outlined" 
                          />
                          <Chip 
                            label={`${quiz.timeLimit} min`} 
                            size="small" 
                            variant="outlined" 
                          />
                          <Chip 
                            label={`${quiz.questions?.length || 0} questions`} 
                            size="small" 
                            variant="outlined" 
                          />
                        </Box>
                      </CardContent>
                      <Divider />
                      <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                        <Box>
                          {user?.role === 'teacher' ? (
                            <>
                              <Tooltip title="Edit Quiz">
                                <IconButton 
                                  size="small" 
                                  onClick={() => handleEditQuiz(quiz._id)}
                                  color="primary"
                                >
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete Quiz">
                                <IconButton 
                                  size="small" 
                                  onClick={() => handleDeleteQuiz(quiz._id)}
                                  color="error"
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip>
                            </>
                          ) : null}
                          <Tooltip title="View Quiz">
                            <IconButton 
                              size="small" 
                              onClick={() => handleViewQuiz(quiz._id)}
                              color="info"
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                        <Button 
                          size="small" 
                          variant="contained" 
                          onClick={() => handleViewQuiz(quiz._id)}
                        >
                          {user?.role === 'teacher' ? 'View Results' : 'Take Quiz'}
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            {results.length === 0 ? (
              <Alert severity="info">
                No quiz results yet.
              </Alert>
            ) : (
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Quiz</TableCell>
                      {user?.role === 'teacher' && <TableCell>Student</TableCell>}
                      <TableCell>Score</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {results.map((result, index) => (
                      <TableRow key={index}>
                        <TableCell>{result.quizTitle}</TableCell>
                        {user?.role === 'teacher' && (
                          <TableCell>{result.studentName}</TableCell>
                        )}
                        <TableCell>
                          <Chip 
                            label={`${result.score}%`} 
                            color={
                              result.score >= 70 ? 'success' : 
                              result.score >= 50 ? 'warning' : 'error'
                            } 
                            size="small" 
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(result.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell align="right">
                          <Button 
                            size="small" 
                            variant="outlined"
                            onClick={() => handleViewQuiz(result.quizId)}
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Alert severity="info">
              Settings functionality will be implemented in a future update.
            </Alert>
          </TabPanel>
        </Paper>
      </Box>

      {user?.role === 'teacher' && (
        <Tooltip title="Create New Quiz" placement="left">
          <Fab 
            color="primary" 
            aria-label="add" 
            sx={{ position: 'fixed', bottom: 16, right: 16 }}
            onClick={handleCreateQuiz}
          >
            <AddIcon />
          </Fab>
        </Tooltip>
      )}
    </Container>
  );
};

export default Dashboard; 