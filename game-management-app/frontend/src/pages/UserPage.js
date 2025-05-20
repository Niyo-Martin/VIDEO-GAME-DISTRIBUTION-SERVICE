// src/pages/UserPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Divider,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  CardMedia,
  Rating,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Alert,
  Badge,
  Chip,
  CircularProgress,
  Skeleton,
  Fade,
  Zoom,
  useTheme
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import StarIcon from '@mui/icons-material/Star';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import GamesIcon from '@mui/icons-material/SportsEsports';
import PersonIcon from '@mui/icons-material/Person';
import CommentIcon from '@mui/icons-material/Comment';
import SendIcon from '@mui/icons-material/Send';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import GamepadIcon from '@mui/icons-material/Gamepad';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const API_URL = `${API_BASE_URL}/api`;

function UserPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  
  const [user, setUser] = useState(null);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  
  // Form states
  const [selectedGame, setSelectedGame] = useState('');
  const [playTime, setPlayTime] = useState(1);
  const [rating, setRating] = useState(3);
  const [comment, setComment] = useState('');
  
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const userResponse = await axios.get(`${API_URL}/users/${id}`);
        const gamesResponse = await axios.get(`${API_URL}/games`);
        
        setUser(userResponse.data);
        setGames(gamesResponse.data);
        setLoading(false);
      } catch (error) {
        setError('Error fetching data');
        setLoading(false);
        console.error('Error fetching data:', error);
      }
    };
    
    fetchData();
  }, [id]);
  
  const showNotification = (message, severity = 'success') => {
    setNotification({ open: true, message, severity });
    
    
    setTimeout(() => {
      setNotification({ ...notification, open: false });
    }, 3000);
  };
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Check if user is eligible to rate/comment
  const canInteractWithGame = (gameId) => {
    if (!user) return false;
    
    const gamePlayTime = user.gamePlayTimes.find(
      record => record.gameId === gameId
    );
    
    return gamePlayTime && gamePlayTime.playTime >= 1;
  };
  
  // Play a game
  const handlePlayGame = async (e) => {
    e.preventDefault();
    
    if (!selectedGame || playTime <= 0) return;
    
    try {
      const response = await axios.patch(`${API_URL}/games/${selectedGame}/play`, {
        userId: id,
        hours: playTime
      });
      
      // Update user state
      setUser(response.data.user);
      
      // Reset form
      setPlayTime(1);
      
      // Show success notification
      const gameName = games.find(g => g._id === selectedGame)?.name || 'Game';
      showNotification(`You played ${gameName} for ${playTime} hour${playTime > 1 ? 's' : ''}!`);
      
    } catch (error) {
      console.error('Error playing game:', error);
      showNotification('Error playing game. Please try again.', 'error');
    }
  };
  
  // Rate a game
  const handleRateGame = async (e) => {
    e.preventDefault();
    
    if (!selectedGame || rating < 1 || rating > 5) return;
    
    try {
      const response = await axios.post(`${API_URL}/games/${selectedGame}/rate`, {
        userId: id,
        rating: rating
      });
      
      // Update user state
      setUser(response.data.user);
      
      // Reset form
      setRating(3);
      
      // Show success notification
      const gameName = games.find(g => g._id === selectedGame)?.name || 'Game';
      showNotification(`You rated ${gameName} ${rating} stars!`);
      
    } catch (error) {
      console.error('Error rating game:', error);
      showNotification('Error rating game. Please try again.', 'error');
    }
  };
  
  // Comment on a game
  const handleCommentGame = async (e) => {
    e.preventDefault();
    
    if (!selectedGame || !comment.trim()) return;
    
    try {
      const response = await axios.post(`${API_URL}/games/${selectedGame}/comment`, {
        userId: id,
        content: comment
      });
      
      // Update user state
      setUser(response.data.user);
      
      // Reset form
      setComment('');
      
      // Show success notification
      const gameName = games.find(g => g._id === selectedGame)?.name || 'Game';
      showNotification(`Your comment on ${gameName} was posted successfully!`);
      
    } catch (error) {
      console.error('Error commenting on game:', error);
      showNotification('Error posting comment. Please try again.', 'error');
    }
  };
  
  // Navigate to games page
  const handleLookGames = () => {
    navigate('/games');
  };
  
  // Loading state
  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Skeleton variant="text" width={300} height={60} />
          <Skeleton variant="rectangular" width={120} height={40} />
        </Box>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Skeleton variant="rectangular" width="100%" height={400} />
          </Grid>
          <Grid item xs={12} md={8}>
            <Skeleton variant="rectangular" width="100%" height={100} sx={{ mb: 2 }} />
            <Skeleton variant="rectangular" width="100%" height={300} />
          </Grid>
        </Grid>
      </Box>
    );
  }
  
  // Error state
  if (error || !user) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error" variant="h5" gutterBottom>
          {error || 'User not found'}
        </Typography>
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => navigate('/')}
          startIcon={<ArrowBackIcon />}
        >
          Back to Home
        </Button>
      </Box>
    );
  }
  
  return (
    <Box>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 4,
        p: {xs: 2, sm: 0}
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar 
            sx={{ 
              width: 64, 
              height: 64, 
              mr: 2,
              bgcolor: theme.palette.primary.main,
              fontSize: '1.5rem',
              fontWeight: 'bold'
            }}
          >
            {user.name.charAt(0).toUpperCase()}
          </Avatar>
          
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {user.name}'s Profile
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Gamer since {new Date().getFullYear()}
            </Typography>
          </Box>
        </Box>
        
        <Button 
          variant="outlined" 
          onClick={() => navigate('/')}
          startIcon={<ArrowBackIcon />}
          sx={{ display: { xs: 'none', sm: 'flex' } }}
        >
          Back to Home
        </Button>
      </Box>
      
      {/* Mobile back button */}
      <Box sx={{ display: { xs: 'flex', sm: 'none' }, mb: 2, px: 2 }}>
        <Button 
          variant="outlined" 
          onClick={() => navigate('/')}
          startIcon={<ArrowBackIcon />}
          fullWidth
        >
          Back to Home
        </Button>
      </Box>
      
      {/* Notification */}
      {notification.open && (
        <Fade in={notification.open}>
          <Alert 
            severity={notification.severity}
            sx={{ 
              mb: 2,
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}
          >
            {notification.message}
          </Alert>
        </Fade>
      )}
      
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4, px: {xs: 2, sm: 0} }}>
        <Grid item xs={6} sm={6} md={3}>
          <Card 
            sx={{ 
              bgcolor: theme.palette.primary.light,
              color: theme.palette.primary.main,
              height: '100%'
            }}
          >
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <GamepadIcon sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {user.gamePlayTimes.length}
              </Typography>
              <Typography variant="body2">Games Played</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={6} sm={6} md={3}>
          <Card 
            sx={{ 
              bgcolor: theme.palette.warning.light,
              color: theme.palette.warning.main,
              height: '100%'
            }}
          >
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <AccessTimeIcon sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {user.totalPlayTime}h
              </Typography>
              <Typography variant="body2">Total Play Time</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={6} sm={6} md={3}>
          <Card 
            sx={{ 
              bgcolor: theme.palette.success.light,
              color: theme.palette.success.main,
              height: '100%'
            }}
          >
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <StarIcon sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {user.averageRating.toFixed(1)}
              </Typography>
              <Typography variant="body2">Average Rating</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={6} sm={6} md={3}>
          <Card 
            sx={{ 
              bgcolor: theme.palette.secondary.light,
              color: theme.palette.secondary.main,
              height: '100%'
            }}
          >
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <CommentIcon sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {user.comments.length}
              </Typography>
              <Typography variant="body2">Comments</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Main Content */}
      <Grid container spacing={3} sx={{ px: {xs: 2, sm: 0} }}>
        {/* User Info Section */}
        <Grid item xs={12} md={4}>
          {/* User Information */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ 
              fontWeight: 600, 
              mb: 2,
              display: 'flex',
              alignItems: 'center'
            }}>
              <PersonIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
              Profile Information
            </Typography>
            
            <Divider sx={{ mb: 3 }} />
            
            <List disablePadding>
              <ListItem disableGutters>
                <ListItemText 
                  primary="Username" 
                  secondary={user.name}
                  primaryTypographyProps={{ color: 'text.secondary', variant: 'body2' }}
                  secondaryTypographyProps={{ color: 'text.primary', fontWeight: 500 }}
                />
              </ListItem>
              
              <ListItem disableGutters>
                <ListItemText 
                  primary="Total Play Time" 
                  secondary={`${user.totalPlayTime} hours`}
                  primaryTypographyProps={{ color: 'text.secondary', variant: 'body2' }}
                  secondaryTypographyProps={{ color: 'text.primary', fontWeight: 500 }}
                />
              </ListItem>
              
              <ListItem disableGutters>
                <ListItemText 
                  primary="Average Rating" 
                  secondary={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Rating value={user.averageRating} readOnly precision={0.1} size="small" />
                      <Typography sx={{ ml: 1 }}>{user.averageRating.toFixed(1)}/5</Typography>
                    </Box>
                  }
                  primaryTypographyProps={{ color: 'text.secondary', variant: 'body2' }}
                />
              </ListItem>
              
              <ListItem disableGutters>
                <ListItemText 
                  primary="Most Played Game" 
                  secondary={user.mostPlayedGameName || 'None yet'}
                  primaryTypograph
                  primaryTypographyProps={{ color: 'text.secondary', variant: 'body2' }}
                  secondaryTypographyProps={{ 
                    color: 'text.primary', 
                    fontWeight: user.mostPlayedGameName ? 500 : 400
                  }}
                />
              </ListItem>
            </List>
            
            <Button 
              variant="contained" 
              fullWidth 
              onClick={handleLookGames}
              sx={{ mt: 3 }}
              color="primary"
              startIcon={<GamesIcon />}
            >
              Browse Games
            </Button>
          </Paper>
          
          {/* User Comments Section */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ 
              fontWeight: 600, 
              mb: 2,
              display: 'flex',
              alignItems: 'center'
            }}>
              <CommentIcon sx={{ mr: 1, color: theme.palette.secondary.main }} />
              My Comments
            </Typography>
            
            <Divider sx={{ mb: 2 }} />
            
            {user.comments.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <QuestionAnswerIcon sx={{ fontSize: 40, color: theme.palette.text.disabled, mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  You haven't commented on any games yet.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Play a game and share your thoughts!
                </Typography>
              </Box>
            ) : (
              <List 
                sx={{ 
                  maxHeight: 300, 
                  overflowY: 'auto',
                  pr: 1
                }}
              >
                {user.comments.map((comment, index) => (
                  <Paper 
                    key={index} 
                    elevation={0}
                    sx={{ 
                      mb: 2, 
                      bgcolor: theme.palette.background.default,
                      borderRadius: 2,
                      overflow: 'hidden'
                    }}
                  >
                    <Box sx={{ 
                      p: 1, 
                      bgcolor: theme.palette.secondary.light,
                      borderBottom: `1px solid ${theme.palette.divider}`
                    }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {comment.gameName}
                      </Typography>
                    </Box>
                    <Box sx={{ p: 2 }}>
                      <Typography 
                        variant="body2" 
                        color="text.primary"
                        sx={{ fontStyle: 'italic', mb: 1 }}
                      >
                        "{comment.content}"
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                        <AccessTimeIcon sx={{ fontSize: 14, mr: 0.5, color: theme.palette.text.secondary }} />
                        <Typography variant="caption" color="text.secondary">
                          After {comment.playTime}h of play
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
        
        {/* Game Interaction Section */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ mb: 3 }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              variant="fullWidth"
              aria-label="game interactions"
            >
              <Tab 
                icon={<GamepadIcon />} 
                label="Play Game" 
                id="tab-0" 
              />
              <Tab 
                icon={<StarIcon />} 
                label="Rate Game" 
                id="tab-1" 
              />
              <Tab 
                icon={<CommentIcon />} 
                label="Comment" 
                id="tab-2" 
              />
            </Tabs>
            
            <Box sx={{ p: 3 }}>
              {/* Game Selection - Common for all tabs */}
              <FormControl fullWidth margin="normal">
                <InputLabel>Select Game</InputLabel>
                <Select
                  value={selectedGame}
                  onChange={(e) => setSelectedGame(e.target.value)}
                  label="Select Game"
                >
                  {games.map((game) => (
                    <MenuItem key={game._id} value={game._id}>
                      {game.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              {/* Play Game Form */}
              {activeTab === 0 && (
                <form onSubmit={handlePlayGame}>
                  <Typography variant="body1" sx={{ mt: 2, mb: 1 }}>
                    How many hours would you like to play?
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', my: 2 }}>
                    <TextField
                      label="Hours to Play"
                      type="number"
                      InputProps={{ inputProps: { min: 1 } }}
                      value={playTime}
                      onChange={(e) => setPlayTime(Number(e.target.value))}
                      sx={{ mr: 2, width: { xs: '100%', sm: '200px' } }}
                    />
                    
                    <Button 
                      type="submit" 
                      variant="contained" 
                      color="primary"
                      disabled={!selectedGame || playTime <= 0}
                      startIcon={<GamepadIcon />}
                      size="large"
                      fullWidth
                      sx={{ display: { xs: 'none', sm: 'flex' } }}
                    >
                      Play Game
                    </Button>
                  </Box>
                  
                  {/* Mobile play button */}
                  <Box sx={{ display: { xs: 'block', sm: 'none' }, mt: 2 }}>
                    <Button 
                      type="submit" 
                      variant="contained" 
                      color="primary"
                      disabled={!selectedGame || playTime <= 0}
                      startIcon={<GamepadIcon />}
                      fullWidth
                    >
                      Play Game
                    </Button>
                  </Box>
                </form>
              )}
              
              {/* Rate Game Form */}
              {activeTab === 1 && (
                <form onSubmit={handleRateGame}>
                  <Typography variant="body1" sx={{ mt: 2, mb: 1 }}>
                    How would you rate this game?
                  </Typography>
                  
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center',
                      my: 3,
                      py: 2,
                      bgcolor: theme.palette.background.default,
                      borderRadius: 2
                    }}
                  >
                    <Rating
                      value={rating}
                      onChange={(e, newValue) => setRating(newValue)}
                      max={5}
                      size="large"
                      sx={{ mb: 1 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      Your rating: {rating} star{rating !== 1 ? 's' : ''}
                    </Typography>
                  </Box>
                  
                  <Button 
                    type="submit" 
                    variant="contained" 
                    color="primary"
                    disabled={!selectedGame || !canInteractWithGame(selectedGame)}
                    startIcon={<StarIcon />}
                    fullWidth
                  >
                    Submit Rating
                  </Button>
                  
                  {selectedGame && !canInteractWithGame(selectedGame) && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                      You must play this game for at least 1 hour before rating it.
                    </Alert>
                  )}
                </form>
              )}
              
              {/* Comment Game Form */}
              {activeTab === 2 && (
                <form onSubmit={handleCommentGame}>
                  <Typography variant="body1" sx={{ mt: 2, mb: 1 }}>
                    Share your thoughts about this game:
                  </Typography>
                  
                  <TextField
                    label="Your Comment"
                    multiline
                    rows={4}
                    fullWidth
                    margin="normal"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="What did you like or dislike about this game?"
                  />
                  
                  <Button 
                    type="submit" 
                    variant="contained" 
                    color="primary"
                    disabled={!selectedGame || !comment || !canInteractWithGame(selectedGame)}
                    startIcon={<SendIcon />}
                    sx={{ mt: 2 }}
                    fullWidth
                  >
                    Post Comment
                  </Button>
                  
                  {selectedGame && !canInteractWithGame(selectedGame) && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                      You must play this game for at least 1 hour before commenting.
                    </Alert>
                  )}
                </form>
              )}
            </Box>
          </Paper>
          
          {/* My Game History */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ 
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              mb: 2
            }}>
              <EmojiEventsIcon sx={{ mr: 1, color: theme.palette.warning.main }} />
              My Game History
            </Typography>
            
            <Divider sx={{ mb: 3 }} />
            
            {user.gamePlayTimes.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <GamesIcon sx={{ fontSize: 40, color: theme.palette.text.disabled, mb: 1 }} />
                <Typography variant="body1" color="text.secondary">
                  You haven't played any games yet.
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary" 
                  sx={{ mt: 2 }}
                  onClick={() => setActiveTab(0)}
                >
                  Start Playing!
                </Button>
              </Box>
            ) : (
              <Grid container spacing={2}>
                {user.gamePlayTimes.map((gamePlay, index) => {
                  const game = games.find(g => g._id === gamePlay.gameId);
                  const userRating = user.gameRatings.find(
                    r => r.gameId === gamePlay.gameId
                  );
                  
                  return game ? (
                    <Zoom 
                      in={true} 
                      style={{ 
                        transitionDelay: `${index * 100}ms`,
                        transitionDuration: '0.3s'
                      }}
                      key={index}
                    >
                      <Grid item xs={12} sm={6} md={4}>
                        <Card 
                          sx={{ 
                            height: '100%',
                            transition: 'transform 0.2s',
                            '&:hover': {
                              transform: 'translateY(-5px)',
                              boxShadow: '0 6px 12px rgba(0,0,0,0.1)'
                            }
                          }}
                        >
                          <Box sx={{ position: 'relative' }}>
                            <CardMedia
                              component="img"
                              height="120"
                              image={game.photoUrl}
                              alt={game.name}
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/300x120?text=Game+Image';
                              }}
                            />
                            <Box 
                              sx={{ 
                                position: 'absolute', 
                                bottom: 0, 
                                left: 0, 
                                right: 0,
                                background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)',
                                p: 1
                              }}
                            >
                              <Typography 
                                variant="subtitle1" 
                                sx={{ 
                                  color: 'white', 
                                  fontWeight: 600,
                                  textShadow: '0 1px 2px rgba(0,0,0,0.6)'
                                }}
                              >
                                {game.name}
                              </Typography>
                            </Box>
                          </Box>
                          
                          <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Chip 
                                icon={<AccessTimeIcon fontSize="small" />} 
                                label={`${gamePlay.playTime}h`} 
                                size="small"
                                color="primary"
                                variant="outlined"
                              />
                              
                              {userRating && (
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Typography variant="body2" sx={{ mr: 0.5 }}>
                                    Your rating:
                                  </Typography>
                                  <Rating value={userRating.rating} readOnly size="small" />
                                </Box>
                              )}
                            </Box>
                            
                            <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {game.genres && game.genres.slice(0, 3).map((genre, i) => (
                                <Chip key={i} label={genre} size="small" variant="outlined" />
                              ))}
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Zoom>
                  ) : null;
                })}
              </Grid>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default UserPage;