import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  Avatar,
  Grid,
  CircularProgress,
  Alert,
  Divider,
  Card,
  CardContent,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import LockIcon from '@mui/icons-material/Lock';
import SchoolIcon from '@mui/icons-material/School';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import { userAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [quizResults, setQuizResults] = useState<any[]>([]);
  
  // Form state
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  useEffect(() => {
    if (user) {
      setFormData({
        ...formData,
        username: user.username,
        email: user.email,
      });
    }
  }, [user]);
  
  useEffect(() => {
    const fetchQuizResults = async () => {
      setLoading(true);
      try {
        const results = await userAPI.getQuizResults();
        setQuizResults(results);
      } catch (err) {
        setError('Failed to load quiz results');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuizResults();
  }, []);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  
  const handleEditToggle = () => {
    setEditMode(!editMode);
    setError(null);
    setSuccess(null);
    
    // Reset form when canceling edit
    if (editMode && user) {
      setFormData({
        ...formData,
        username: user.username,
        email: user.email,
      });
    }
  };
  
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    // Basic validation
    if (!formData.username.trim() || !formData.email.trim()) {
      setError('Username and email are required');
      return;
    }
    
    setSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      const updatedUser = await userAPI.updateProfile({
        username: formData.username,
        email: formData.email,
      });
      
      // Update the user context
      updateUser(updatedUser);
      
      setSuccess('Profile updated successfully');
      setEditMode(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };
  
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Password validation
    if (!formData.currentPassword) {
      setError('Current password is required');
      return;
    }
    
    if (formData.newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    
    setSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      await userAPI.updateProfile({
        password: formData.newPassword,
        currentPassword: formData.currentPassword,
      });
      
      setSuccess('Password updated successfully');
      setOpenPasswordDialog(false);
      
      // Reset password fields
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update password');
    } finally {
      setSaving(false);
    }
  };
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  if (!user) {
    navigate('/login');
    return null;
  }
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 6 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar 
                sx={{ 
                  width: 80, 
                  height: 80, 
                  bgcolor: user.role === 'teacher' ? 'primary.main' : 'secondary.main',
                  mr: 3 
                }}
              >
                {user.username.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="h4" component="h1" gutterBottom>
                  {user.username}
                </Typography>
                <Chip 
                  icon={user.role === 'teacher' ? <SchoolIcon /> : <AccountCircleIcon />} 
                  label={user.role === 'teacher' ? 'Teacher' : 'Student'} 
                  color={user.role === 'teacher' ? 'primary' : 'secondary'} 
                  size="small"
                />
              </Box>
            </Box>
            <Button
              variant="outlined"
              color="error"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
            >
              Logout
            </Button>
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
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h5" component="h2">
                      Account Information
                    </Typography>
                    <IconButton 
                      onClick={handleEditToggle} 
                      color={editMode ? 'primary' : 'default'}
                      aria-label="edit profile"
                    >
                      <EditIcon />
                    </IconButton>
                  </Box>
                  
                  <Divider sx={{ mb: 3 }} />
                  
                  <form onSubmit={handleProfileUpdate}>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Username"
                          name="username"
                          value={formData.username}
                          onChange={handleChange}
                          disabled={!editMode}
                          required
                          variant="outlined"
                          margin="normal"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          disabled={!editMode}
                          required
                          variant="outlined"
                          margin="normal"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Box sx={{ mt: 2 }}>
                          <Button
                            variant="outlined"
                            color="primary"
                            startIcon={<LockIcon />}
                            onClick={() => setOpenPasswordDialog(true)}
                            disabled={editMode}
                          >
                            Change Password
                          </Button>
                        </Box>
                      </Grid>
                      {editMode && (
                        <Grid item xs={12}>
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 2 }}>
                            <Button
                              variant="outlined"
                              onClick={handleEditToggle}
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
                              {saving ? 'Saving...' : 'Save Changes'}
                            </Button>
                          </Box>
                        </Grid>
                      )}
                    </Grid>
                  </form>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h5" component="h2" gutterBottom>
                    Account Details
                  </Typography>
                  
                  <Divider sx={{ mb: 3 }} />
                  
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Role
                      </Typography>
                      <Typography variant="body1">
                        {user.role === 'teacher' ? 'Teacher' : 'Student'}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Member Since
                      </Typography>
                      <Typography variant="body1">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Box sx={{ mt: 3 }}>
                        <Typography variant="h6" gutterBottom>
                          {user.role === 'teacher' ? 'Created Quizzes' : 'Quiz Attempts'}
                        </Typography>
                        {loading ? (
                          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                            <CircularProgress size={24} />
                          </Box>
                        ) : quizResults.length === 0 ? (
                          <Typography variant="body2" color="text.secondary">
                            {user.role === 'teacher' 
                              ? 'You haven\'t created any quizzes yet' 
                              : 'You haven\'t taken any quizzes yet'}
                          </Typography>
                        ) : (
                          <Box sx={{ mt: 2 }}>
                            {quizResults.slice(0, 5).map((result, index) => (
                              <Box 
                                key={index} 
                                sx={{ 
                                  p: 1.5, 
                                  mb: 1, 
                                  border: 1, 
                                  borderColor: 'divider',
                                  borderRadius: 1,
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center'
                                }}
                              >
                                <Box>
                                  <Typography variant="body1">
                                    {result.quizTitle}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {new Date(result.date).toLocaleDateString()}
                                  </Typography>
                                </Box>
                                {user.role === 'student' && (
                                  <Chip 
                                    label={`${result.score}%`} 
                                    color={
                                      result.score >= 70 ? 'success' : 
                                      result.score >= 50 ? 'warning' : 'error'
                                    } 
                                    size="small" 
                                  />
                                )}
                              </Box>
                            ))}
                            {quizResults.length > 5 && (
                              <Button 
                                variant="text" 
                                size="small" 
                                onClick={() => navigate('/dashboard')}
                                sx={{ mt: 1 }}
                              >
                                View All
                              </Button>
                            )}
                          </Box>
                        )}
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>
      </Box>

      {/* Password Change Dialog */}
      <Dialog
        open={openPasswordDialog}
        onClose={() => setOpenPasswordDialog(false)}
        aria-labelledby="password-dialog-title"
      >
        <DialogTitle id="password-dialog-title">Change Password</DialogTitle>
        <form onSubmit={handlePasswordChange}>
          <DialogContent>
            <DialogContentText>
              Please enter your current password and your new password.
            </DialogContentText>
            <TextField
              fullWidth
              margin="normal"
              name="currentPassword"
              label="Current Password"
              type="password"
              value={formData.currentPassword}
              onChange={handleChange}
              required
            />
            <TextField
              fullWidth
              margin="normal"
              name="newPassword"
              label="New Password"
              type="password"
              value={formData.newPassword}
              onChange={handleChange}
              required
            />
            <TextField
              fullWidth
              margin="normal"
              name="confirmPassword"
              label="Confirm New Password"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenPasswordDialog(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              disabled={saving}
            >
              {saving ? 'Updating...' : 'Update Password'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default Profile; 