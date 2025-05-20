// src/components/NavBar.js
import React, { useState, useEffect } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  Container, 
  Avatar, 
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  useMediaQuery,
  Divider
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import GamesIcon from '@mui/icons-material/SportsEsports';
import PeopleIcon from '@mui/icons-material/People';
import MenuIcon from '@mui/icons-material/Menu';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

function NavBar() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeUser, setActiveUser] = useState(null);
  
  // Extract current user ID from URL if on user page
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const match = location.pathname.match(/\/user\/([^/]+)/);
      if (match && match[1]) {
        try {
          const response = await axios.get(`${API_URL}/users/${match[1]}`);
          setActiveUser(response.data);
        } catch (error) {
          console.error('Error fetching user:', error);
        }
      } else {
        setActiveUser(null);
      }
    };
    
    fetchCurrentUser();
  }, [location.pathname]);
  
  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };
  
  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      setDrawerOpen(false);
    }
  };
  
  const navItems = [
    { text: 'Home', icon: <HomeIcon />, path: '/' },
    { text: 'Games', icon: <GamesIcon />, path: '/games' }
  ];
  
  const drawer = (
    <Box sx={{ width: 250 }} role="presentation">
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <GamesIcon sx={{ fontSize: 30, color: theme.palette.primary.main, mr: 1 }} />
        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
          GameVault
        </Typography>
      </Box>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem 
            button 
            key={item.text} 
            onClick={() => handleNavigation(item.path)}
            sx={{ 
              bgcolor: location.pathname === item.path ? theme.palette.action.selected : 'transparent',
              borderLeft: location.pathname === item.path ? `4px solid ${theme.palette.primary.main}` : '4px solid transparent'
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
  
  return (
    <>
      <AppBar position="static" elevation={1} sx={{ bgcolor: 'white', color: 'text.primary' }}>
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
            {/* Logo and brand for mobile */}
            {isMobile ? (
              <>
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  edge="start"
                  onClick={handleDrawerToggle}
                >
                  <MenuIcon />
                </IconButton>
                <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, justifyContent: 'center' }}>
                  <GamesIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
                  <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                    GameVault
                  </Typography>
                </Box>
              </>
            ) : (
              // Logo and navigation for desktop
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <GamesIcon sx={{ color: theme.palette.primary.main, mr: 1, fontSize: 28 }} />
                <Typography variant="h6" component={Link} to="/" sx={{ 
                  textDecoration: 'none', 
                  color: 'inherit', 
                  fontWeight: 'bold',
                  mr: 4
                }}>
                  GameVault
                </Typography>
                
                <Box sx={{ display: 'flex' }}>
                  {navItems.map((item) => (
                    <Button 
                      key={item.text} 
                      component={Link} 
                      to={item.path}
                      sx={{ 
                        mx: 1, 
                        color: 'text.primary',
                        position: 'relative',
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          width: location.pathname === item.path ? '100%' : '0%',
                          height: '3px',
                          bottom: 0,
                          left: 0,
                          bgcolor: theme.palette.primary.main,
                          transition: 'width 0.2s ease-in-out'
                        },
                        '&:hover::after': {
                          width: '100%'
                        }
                      }}
                      startIcon={item.icon}
                    >
                      {item.text}
                    </Button>
                  ))}
                </Box>
              </Box>
            )}
            
            {/* Current user display - Only show if there is an active user */}
            {activeUser && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ mr: 1, display: { xs: 'none', sm: 'block' } }}>
                  Logged in as:
                </Typography>
                <Button
                  sx={{
                    textTransform: 'none',
                    borderRadius: '20px',
                    bgcolor: theme.palette.mode === 'dark' ? 'primary.dark' : 'primary.light',
                    color: theme.palette.primary.contrastText,
                    '&:hover': {
                      bgcolor: theme.palette.primary.main,
                    },
                  }}
                  startIcon={
                    <Avatar
                      sx={{
                        width: 24,
                        height: 24,
                        bgcolor: theme.palette.primary.main,
                        fontSize: '0.875rem',
                      }}
                    >
                      {activeUser.name.charAt(0).toUpperCase()}
                    </Avatar>
                  }
                >
                  {activeUser.name}
                </Button>
              </Box>
            )}
          </Toolbar>
        </Container>
      </AppBar>
      
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
}

export default NavBar;