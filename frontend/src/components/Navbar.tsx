import React, { useState } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Tooltip,
  Divider,
  ListItemIcon,
  Container,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  AccountCircle as AccountCircleIcon,
  ExitToApp as ExitToAppIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    handleCloseNavMenu();
    handleCloseUserMenu();
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    handleCloseUserMenu();
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Desktop Logo */}
          <Typography
            variant="h6"
            noWrap
            component={RouterLink}
            to="/"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontWeight: 700,
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            School Quiz
          </Typography>

          {/* Mobile Menu */}
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="menu"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', md: 'none' },
              }}
            >
              <MenuItem 
                onClick={() => handleNavigate('/')}
                selected={isActive('/')}
              >
                <Typography textAlign="center">Home</Typography>
              </MenuItem>
              <MenuItem 
                onClick={() => handleNavigate('/quizzes')}
                selected={isActive('/quizzes')}
              >
                <Typography textAlign="center">Quizzes</Typography>
              </MenuItem>
              {isAuthenticated && user?.role === 'teacher' && (
                <MenuItem 
                  onClick={() => handleNavigate('/quiz/create')}
                  selected={isActive('/quiz/create')}
                >
                  <Typography textAlign="center">Create Quiz</Typography>
                </MenuItem>
              )}
            </Menu>
          </Box>

          {/* Mobile Logo */}
          <Typography
            variant="h6"
            noWrap
            component={RouterLink}
            to="/"
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontWeight: 700,
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            School Quiz
          </Typography>

          {/* Desktop Menu */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            <Button
              onClick={() => handleNavigate('/')}
              sx={{ 
                my: 2, 
                color: 'white', 
                display: 'block',
                fontWeight: isActive('/') ? 'bold' : 'normal',
                borderBottom: isActive('/') ? '2px solid white' : 'none',
              }}
            >
              Home
            </Button>
            <Button
              onClick={() => handleNavigate('/quizzes')}
              sx={{ 
                my: 2, 
                color: 'white', 
                display: 'block',
                fontWeight: isActive('/quizzes') ? 'bold' : 'normal',
                borderBottom: isActive('/quizzes') ? '2px solid white' : 'none',
              }}
            >
              Quizzes
            </Button>
            {isAuthenticated && user?.role === 'teacher' && (
              <Button
                onClick={() => handleNavigate('/quiz/create')}
                sx={{ 
                  my: 2, 
                  color: 'white', 
                  display: 'block',
                  fontWeight: isActive('/quiz/create') ? 'bold' : 'normal',
                  borderBottom: isActive('/quiz/create') ? '2px solid white' : 'none',
                }}
              >
                Create Quiz
              </Button>
            )}
          </Box>

          {/* User Menu */}
          <Box sx={{ flexGrow: 0 }}>
            {isAuthenticated ? (
              <>
                <Tooltip title="Open settings">
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                    <Avatar alt={user?.username}>
                      {user?.username.charAt(0).toUpperCase()}
                    </Avatar>
                  </IconButton>
                </Tooltip>
                <Menu
                  sx={{ mt: '45px' }}
                  id="menu-appbar"
                  anchorEl={anchorElUser}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                >
                  <Box sx={{ px: 2, py: 1 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {user?.username}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {user?.email}
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
                      <AccountCircleIcon fontSize="small" />
                    </ListItemIcon>
                    Profile
                  </MenuItem>
                  <Divider />
                  <MenuItem onClick={handleLogout}>
                    <ListItemIcon>
                      <ExitToAppIcon fontSize="small" />
                    </ListItemIcon>
                    Logout
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Box sx={{ display: 'flex' }}>
                <Button 
                  color="inherit" 
                  component={RouterLink} 
                  to="/login"
                  sx={{ 
                    fontWeight: isActive('/login') ? 'bold' : 'normal',
                    borderBottom: isActive('/login') ? '2px solid white' : 'none',
                  }}
                >
                  Login
                </Button>
                <Button 
                  color="inherit" 
                  component={RouterLink} 
                  to="/register"
                  sx={{ 
                    fontWeight: isActive('/register') ? 'bold' : 'normal',
                    borderBottom: isActive('/register') ? '2px solid white' : 'none',
                  }}
                >
                  Register
                </Button>
              </Box>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar; 