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
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Fab,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
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
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // TODO: Fetch user data and quizzes from API
    const fetchData = async () => {
      try {
        // Simulated API calls
        const mockUser: User = {
          _id: '1',
          username: 'teacher1',
          email: 'teacher1@example.com',
          role: 'teacher',
          createdAt: new Date().toISOString(),
        };

        const mockQuizzes: Quiz[] = [
          {
            _id: '1',
            title: 'Math Basics',
            description: 'Test your basic math skills',
            questions: [],
            createdBy: mockUser,
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
            createdBy: mockUser,
            subject: 'Science',
            timeLimit: 45,
            isActive: true,
            createdAt: new Date().toISOString(),
          },
        ];

        setUser(mockUser);
        setQuizzes(mockQuizzes);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCreateQuiz = () => {
    // TODO: Implement quiz creation
    console.log('Create new quiz');
  };

  if (loading) {
    return (
      <Container>
        <Typography>Loading dashboard...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="subtitle1" color="textSecondary" paragraph>
          Welcome back, {user?.username}!
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="My Quizzes" />
            <Tab label="Results" />
            <Tab label="Settings" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            {quizzes.map((quiz) => (
              <Grid item xs={12} sm={6} md={4} key={quiz._id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" component="h2" gutterBottom>
                      {quiz.title}
                    </Typography>
                    <Typography color="textSecondary" gutterBottom>
                      {quiz.description}
                    </Typography>
                    <Typography variant="body2">
                      Subject: {quiz.subject}
                    </Typography>
                    <Typography variant="body2">
                      Time Limit: {quiz.timeLimit} minutes
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small" color="primary">
                      Edit
                    </Button>
                    <Button size="small" color="primary">
                      View Results
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
          <Fab
            color="primary"
            sx={{ position: 'fixed', bottom: 16, right: 16 }}
            onClick={handleCreateQuiz}
          >
            <AddIcon />
          </Fab>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Quiz</TableCell>
                  <TableCell>Student</TableCell>
                  <TableCell>Score</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>Math Basics</TableCell>
                  <TableCell>student1</TableCell>
                  <TableCell>8/10</TableCell>
                  <TableCell>2024-02-20</TableCell>
                  <TableCell>
                    <Button size="small" color="primary">
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography>Settings content will go here</Typography>
        </TabPanel>
      </Box>
    </Container>
  );
};

export default Dashboard; 