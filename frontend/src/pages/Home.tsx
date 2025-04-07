import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Box,
} from '@mui/material';

const Home: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 8, mb: 4, textAlign: 'center' }}>
        <Typography variant="h2" component="h1" gutterBottom>
          Welcome to School Quiz
        </Typography>
        <Typography variant="h5" color="textSecondary" paragraph>
          An interactive platform for creating and taking quizzes
        </Typography>
        <Button
          component={RouterLink}
          to="/quizzes"
          variant="contained"
          color="primary"
          size="large"
          sx={{ mt: 2 }}
        >
          Start Taking Quizzes
        </Button>
      </Box>

      <Grid container spacing={4} sx={{ mt: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom>
                For Students
              </Typography>
              <Typography color="textSecondary">
                Take quizzes, track your progress, and improve your knowledge
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom>
                For Teachers
              </Typography>
              <Typography color="textSecondary">
                Create and manage quizzes, track student performance
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom>
                Features
              </Typography>
              <Typography color="textSecondary">
                Multiple choice questions, timed quizzes, instant feedback
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Home; 