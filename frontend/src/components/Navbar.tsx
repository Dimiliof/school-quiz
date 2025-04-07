import React, { useState } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Link,
  Avatar,
  Divider,
  ListItemIcon,
  Tooltip,
} from '@mui/material';
import AccountCircle from '@mui/icons-material/AccountCircle';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import QuizIcon from '@mui/icons-material/Quiz';
import { useAuth } from '../contexts/AuthContext';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
    navigate('/login');
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    handleClose();
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <AppBar position="static" elevation={0} sx={{ borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}>
      <Toolbar>
        <Typography 
          variant="h6" 
          component={RouterLink} 
          to="/" 
          sx={{ 
            flexGrow: 1, 
            textDecoration: 'none', 
            color: 'inherit',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <QuizIcon sx={{ mr: 1 }} />
          School Quiz
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Link 
            component={RouterLink} 
            to="/quizzes" 
            color="inherit" 
            sx={{ 
              mx: 2, 
              textDecoration: 'none',
              fontWeight: isActive('/quizzes') ? 600 : 400,
              borderBottom: isActive('/quizzes') ? '2px solid white' : 'none',
              pb: 1,
            }}
          >
            Quizzes
          </Link>
          {user ? (
            <>
              <Link 
                component={RouterLink} 
                to="/dashboard" 
                color="inherit" 
                sx={{ 
                  mx: 2, 
                  textDecoration: 'none',
                  fontWeight: isActive('/dashboard') ? 600 : 400,
                  borderBottom: isActive('/dashboard') ? '2px solid white' : 'none',
                  pb: 1,
                }}
              >
                Dashboard
              </Link>
              <Tooltip title="Account settings">
                <IconButton
                  size="large"
                  aria-label="account of current user"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  onClick={handleMenu}
                  color="inherit"
                >
                  {user.username ? (
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                      {user.username.charAt(0).toUpperCase()}
                    </Avatar>
                  ) : (
                    <AccountCircle />
                  )}
                </IconButton>
              </Tooltip>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                PaperProps={{
                  elevation: 3,
                  sx: { minWidth: 200, mt: 1.5 }
                }}
              >
                <Box sx={{ px: 2, py: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {user.username}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user.email}
                  </Typography>
                </Box>
                <Divider />
                <MenuItem onClick={() => handleNavigate('/dashboard')}>
                  <ListItemIcon>
                    <DashboardIcon fontSize="small" />
                  </ListItemIcon>
                  Dashboard
                </MenuItem>
                <MenuItem onClick={() => handleNavigate('/profile')}>
                  <ListItemIcon>
                    <PersonIcon fontSize="small" />
                  </ListItemIcon>
                  Profile
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  Logout
                </MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Button 
                color="inherit" 
                component={RouterLink} 
                to="/login"
                sx={{ 
                  mx: 1,
                  fontWeight: isActive('/login') ? 600 : 400,
                }}
              >
                Login
              </Button>
              <Button 
                variant="outlined" 
                color="inherit" 
                component={RouterLink} 
                to="/register"
                sx={{ 
                  ml: 1,
                  borderColor: 'white',
                  '&:hover': {
                    borderColor: 'white',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                Register
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 