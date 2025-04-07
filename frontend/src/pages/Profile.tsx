import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Paper,
  Grid,
  Avatar,
  Divider,
  Alert,
  CircularProgress,
  IconButton,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import SchoolIcon from '@mui/icons-material/School';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { useAuth } from '../contexts/AuthContext';
import { userAPI } from '../services/api';
import { User } from '../types';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [profile, setProfile] = useState<Partial<User>>({
    username: '',
    email: '',
    role: '',
  });
  const [quizResults, setQuizResults] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      setProfile({
        username: user.username,
        email: user.email,
        role: user.role,
      });
      
      // Fetch user profile data
      setLoading(true);
      Promise.all([
        userAPI.getProfile(),
        userAPI.getQuizResults()
      ])
        .then(([profileData, resultsData]) => {
          setProfile(profileData);
          setQuizResults(resultsData);
        })
        .catch((err) => {
          setError('Failed to load profile data. Please try again.');
          console.error(err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await userAPI.updateProfile(profile);
      setSuccess('Profile updated successfully!');
      setEditMode(false);
    } catch (err) {
      setError('Failed to update profile. Please try again.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
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
            <Avatar
              sx={{ width: 80, height: 80, mr: 3, bgcolor: 'primary.main' }}
            >
              {profile.username?.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="h4" component="h1">
                {profile.username}
              </Typography>
              <Chip
                label={profile.role === 'teacher' ? 'Teacher' : 'Student'}
                color={profile.role === 'teacher' ? 'primary' : 'secondary'}
                size="small"
                sx={{ mt: 1 }}
              />
            </Box>
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

          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader
                  title="Profile Information"
                  action={
                    !editMode ? (
                      <IconButton onClick={() => setEditMode(true)}>
                        <EditIcon />
                      </IconButton>
                    ) : (
                      <Box>
                        <IconButton onClick={() => setEditMode(false)} color="error">
                          <CancelIcon />
                        </IconButton>
                      </Box>
                    )
                  }
                />
                <Divider />
                <CardContent>
                  {editMode ? (
                    <form onSubmit={handleSubmit}>
                      <TextField
                        fullWidth
                        label="Username"
                        name="username"
                        value={profile.username}
                        onChange={handleChange}
                        margin="normal"
                        required
                      />
                      <TextField
                        fullWidth
                        label="Email"
                        name="email"
                        type="email"
                        value={profile.email}
                        onChange={handleChange}
                        margin="normal"
                        required
                      />
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                        <Button
                          type="submit"
                          variant="contained"
                          color="primary"
                          startIcon={<SaveIcon />}
                          disabled={saving}
                        >
                          {saving ? 'Saving...' : 'Save Changes'}
                        </Button>
                      </Box>
                    </form>
                  ) : (
                    <List>
                      <ListItem>
                        <ListItemIcon>
                          <PersonIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary="Username"
                          secondary={profile.username}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <EmailIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary="Email"
                          secondary={profile.email}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <SchoolIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary="Role"
                          secondary={profile.role === 'teacher' ? 'Teacher' : 'Student'}
                        />
                      </ListItem>
                    </List>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="Quiz Results" />
                <Divider />
                <CardContent>
                  {quizResults.length > 0 ? (
                    <List>
                      {quizResults.map((result, index) => (
                        <ListItem key={index} divider={index < quizResults.length - 1}>
                          <ListItemText
                            primary={result.quizTitle}
                            secondary={`Score: ${result.score}% | Date: ${new Date(result.date).toLocaleDateString()}`}
                          />
                          <Chip
                            label={`${result.score}%`}
                            color={result.score >= 70 ? 'success' : result.score >= 50 ? 'warning' : 'error'}
                            size="small"
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body1" color="text.secondary" align="center">
                      No quiz results yet.
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="outlined"
              color="error"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Profile; 