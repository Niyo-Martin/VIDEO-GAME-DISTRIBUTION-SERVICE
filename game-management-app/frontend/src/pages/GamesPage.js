// src/pages/GamesPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Divider,
  Button,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Rating,
  Chip,
  List,
  ListItem,
  ListItemText,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  Skeleton,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  CircularProgress,
  useTheme
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import StarIcon from '@mui/icons-material/Star';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CommentIcon from '@mui/icons-material/Comment';
import PersonIcon from '@mui/icons-material/Person';
import ClearIcon from '@mui/icons-material/Clear';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const API_URL = `${API_BASE_URL}/api`;

function GamesPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortCriteria, setSortCriteria] = useState('name');
  const [filterGenre, setFilterGenre] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState(0); // 0: grid, 1: list
  const [selectedGame, setSelectedGame] = useState(null);
  const [allGenres, setAllGenres] = useState([]);
  
  // Fetch games data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const gamesResponse = await axios.get(`${API_URL}/games`);
        setGames(gamesResponse.data);
        
        // Extract all unique genres
        const genres = new Set();
        gamesResponse.data.forEach(game => {
          if (game.genres && Array.isArray(game.genres)) {
            game.genres.forEach(genre => {
              if (genre) genres.add(genre);
            });
          }
        });
        
        setAllGenres(Array.from(genres));
        setLoading(false);
      } catch (error) {
        setError('Error fetching games');
        setLoading(false);
        console.error('Error fetching games:', error);
      }
    };
    
    fetchData();
  }, []);
  
  // Filter games by search query and genre
  const getFilteredGames = () => {
    return games.filter(game => {
      const matchesSearch = searchQuery === '' || 
        game.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesGenre = filterGenre === '' || 
        (game.genres && game.genres.includes(filterGenre));
      
      return matchesSearch && matchesGenre;
    });
  };
  
  // Sort filtered games
  const getSortedAndFilteredGames = () => {
    const filteredGames = getFilteredGames();
    
    return filteredGames.sort((a, b) => {
      switch (sortCriteria) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'rating':
          return b.rating - a.rating;
        case 'playTime':
          return b.playTime - a.playTime;
        case 'comments':
          return (b.comments ? b.comments.length : 0) - (a.comments ? a.comments.length : 0);
        default:
          return 0;
      }
    });
  };
  
  // Handle sort change
  const handleSortChange = (event) => {
    setSortCriteria(event.target.value);
  };
  
  // Handle filter change
  const handleFilterChange = (event) => {
    setFilterGenre(event.target.value);
  };
  
  // Handle search change
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };
  
  // Clear filters
  const handleClearFilters = () => {
    setSortCriteria('name');
    setFilterGenre('');
    setSearchQuery('');
  };
  
  // Handle view mode change
  const handleViewModeChange = (event, newValue) => {
    setViewMode(newValue);
  };
  
  // View game details
  const handleGameSelect = (game) => {
    setSelectedGame(game);
  };
  
  // Close game details
  const handleCloseGameDetails = () => {
    setSelectedGame(null);
  };
  
  // Return to home page
  const handleBackToHome = () => {
    navigate('/');
  };
  
  // Loading state
  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="rectangular" width="100%" height={60} sx={{ mb: 3 }} />
        <Skeleton variant="rectangular" width="100%" height={80} sx={{ mb: 3 }} />
        <Grid container spacing={3}>
          {Array.from(new Array(6)).map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Skeleton variant="rectangular" width="100%" height={300} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }
  
  // Error state
  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error" variant="h5" gutterBottom>
          {error}
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleBackToHome}
          startIcon={<ArrowBackIcon />}
        >
          Back to Home
        </Button>
      </Box>
    );
  }
  
  const sortedAndFilteredGames = getSortedAndFilteredGames();
  
  // Game Detail View
  if (selectedGame) {
    return (
      <Box>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBackIcon />}
          onClick={handleCloseGameDetails}
          sx={{ mb: 3 }}
        >
          Back to Games
        </Button>
        
        <Paper sx={{ p: 3 }}>
          <Grid container spacing={3}>
            {/* Game Image */}
            <Grid item xs={12} sm={4}>
              <Box sx={{ position: 'relative' }}>
                <Card>
                  <CardMedia
                    component="img"
                    height="300"
                    image={selectedGame.photoUrl}
                    alt={selectedGame.name}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300x300?text=No+Image';
                    }}
                  />
                </Card>
                <Chip 
                  label={selectedGame.ratingEnabled ? "Ratings Enabled" : "Ratings Disabled"} 
                  color={selectedGame.ratingEnabled ? "success" : "error"}
                  sx={{ 
                    position: 'absolute', 
                    top: 10, 
                    right: 10,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }}
                />
              </Box>
              
              <Paper sx={{ p: 2, mt: 2 }}>
                <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                  Game Stats
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <StarIcon sx={{ color: theme.palette.warning.main, mr: 1 }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">Rating</Typography>
                        <Typography variant="h6">
                          {selectedGame.rating.toFixed(1)}/5
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AccessTimeIcon sx={{ color: theme.palette.info.main, mr: 1 }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">Play Time</Typography>
                        <Typography variant="h6">
                          {selectedGame.playTime}h
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CommentIcon sx={{ color: theme.palette.secondary.main, mr: 1 }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">Comments</Typography>
                        <Typography variant="h6">
                          {selectedGame.comments ? selectedGame.comments.length : 0}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            
            {/* Game Details */}
            <Grid item xs={12} sm={8}>
              <Typography variant="h4" gutterBottom fontWeight={700}>
                {selectedGame.name}
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                {selectedGame.genres && selectedGame.genres.map((genre, index) => (
                  <Chip 
                    key={index} 
                    label={genre} 
                    color="primary" 
                    variant="outlined"
                    size="small"
                  />
                ))}
              </Box>
              
              {/* Optional Attributes */}
              {selectedGame.optionalAttributes && Object.keys(selectedGame.optionalAttributes).length > 0 && (
                <Paper sx={{ p: 2, mb: 3, bgcolor: theme.palette.background.default }}>
                  <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                    Game Details
                  </Typography>
                  
                  <Grid container spacing={2}>
                    {Object.entries(selectedGame.optionalAttributes).map(([key, value]) => (
                      <Grid item xs={12} sm={6} key={key}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                            {key}:
                          </Typography>
                          <Typography variant="body1" fontWeight={500}>
                            {value}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              )}
              
              {/* User Comments */}
              <Typography variant="h6" sx={{ mt: 4, mb: 2, display: 'flex', alignItems: 'center' }}>
                <CommentIcon sx={{ mr: 1, color: theme.palette.secondary.main }} />
                User Comments
              </Typography>
              
              {!selectedGame.comments || selectedGame.comments.length === 0 ? (
                <Paper sx={{ p: 3, textAlign: 'center', bgcolor: theme.palette.background.default }}>
                  <Typography variant="body1">
                    No comments yet. Be the first to comment!
                  </Typography>
                  
                  {!selectedGame.ratingEnabled && (
                    <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                      Note: Ratings and comments are currently disabled for this game.
                    </Typography>
                  )}
                </Paper>
              ) : (
                <Paper sx={{ p: 0, bgcolor: theme.palette.background.default }}>
                  <List sx={{ p: 0 }}>
                    {selectedGame.comments.map((comment, index) => (
                      <ListItem 
                        key={index} 
                        alignItems="flex-start"
                        sx={{ 
                          p: 2,
                          borderBottom: index < selectedGame.comments.length - 1 ? `1px solid ${theme.palette.divider}` : 'none',
                        }}
                      >
                        <Avatar 
                          sx={{ 
                            mr: 2, 
                            bgcolor: theme.palette.primary.main,
                            width: 40,
                            height: 40
                          }}
                        >
                          {comment.userName.charAt(0).toUpperCase()}
                        </Avatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="subtitle1" fontWeight={500}>
                                {comment.userName}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <AccessTimeIcon sx={{ fontSize: 14, mr: 0.5, color: theme.palette.text.secondary }} />
                                <Typography variant="caption" color="text.secondary">
                                  {comment.playTime}h playtime
                                </Typography>
                              </Box>
                            </Box>
                          }
                          secondary={
                            <Box sx={{ mt: 1 }}>
                              <Typography 
                                variant="body1" 
                                sx={{ 
                                  bgcolor: 'white',
                                  p: 1.5, 
                                  borderRadius: 1,
                                  border: `1px solid ${theme.palette.divider}`,
                                  mt: 1
                                }}
                              >
                                "{comment.content}"
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              )}
            </Grid>
          </Grid>
        </Paper>
      </Box>
    );
  }
  
  return (
    <Box>
      {/* Header */}
      <Box sx={{ 
        mb: 4,
        p: 3,
        borderRadius: 2,
        background: 'linear-gradient(135deg, #4361ee 0%, #3730a3 100%)',
        color: 'white',
      }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Games Library
        </Typography>
        <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
          Discover, play and rate games from our collection
        </Typography>
      </Box>
      
      {/* Filter and Sort Controls */}
      <Paper sx={{ p: 2, mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={5}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search games..."
              value={searchQuery}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchQuery ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchQuery('')}>
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : null
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <FilterListIcon fontSize="small" sx={{ mr: 0.5 }} /> Genre
                </Box>
              </InputLabel>
              <Select
                value={filterGenre}
                onChange={handleFilterChange}
                label="Genre"
              >
                <MenuItem value="">All Genres</MenuItem>
                {allGenres.map((genre) => (
                  <MenuItem key={genre} value={genre}>
                    {genre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <SortIcon fontSize="small" sx={{ mr: 0.5 }} /> Sort By
                </Box>
              </InputLabel>
              <Select
                value={sortCriteria}
                onChange={handleSortChange}
                label="Sort By"
              >
                <MenuItem value="name">Name (A-Z)</MenuItem>
                <MenuItem value="rating">Rating (High to Low)</MenuItem>
                <MenuItem value="playTime">Play Time (High to Low)</MenuItem>
                <MenuItem value="comments">Comments (Most to Least)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={1}>
            <Tooltip title="Clear all filters">
              <Button 
                variant="outlined" 
                color="secondary"
                onClick={handleClearFilters}
                fullWidth
                sx={{ height: '100%' }}
              >
                <ClearIcon />
              </Button>
            </Tooltip>
          </Grid>
        </Grid>
      </Paper>
      
      {/* View Mode Tabs */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Tabs
          value={viewMode}
          onChange={handleViewModeChange}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab 
            icon={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <img 
                  src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgLTk2MCA5NjAgOTYwIiB3aWR0aD0iMjQiPjxwYXRoIGQ9Ik00NDAgLTIwMHYtMjQwaDI0MHYyNDBoLTI0MFptLTE2MCAwdi0yNDBoMjQwdjI0MGgtMjQwWm0tMTYwIDB2LTI0MGgyNDB2MjQwaC0yNDBabTMyMCAtMzIwdi0yNDBoMjQwdjI0MGgtMjQwWm0tMTYwIDB2LTI0MGgyNDB2MjQwaC0yNDBabS0xNjAgMHYtMjQwaDI0MHYyNDBoLTI0MFoiLz48L3N2Zz4="
                  alt="Grid view"
                  style={{ width: 20, height: 20, marginRight: 4 }}
                />
                Grid
              </Box>
            } 
            label="" 
          />
          <Tab 
            icon={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <img 
                  src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgLTk2MCA5NjAgOTYwIiB3aWR0aD0iMjQiPjxwYXRoIGQ9Ik04MDAgLTQ4MHEtNTAgMCAtODUgLTM1dC0zNSAtODV2LTgwcTAgLTUwIDM1IC04NXQ4NSAtMzVoODBxNTAgMCA4NSAzNXQzNSA4NXY4MHEwIDUwIC0zNSA4NXQtODUgMzVoLTgwWm0wIC0zMjBxLTUwIDAgLTg1IC0zNXQtMzUgLTg1di04MHEwIC01MCAzNSAtODV0ODUgLTM1aDgwcTUwIDAgODUgMzV0MzUgODV2ODBxMCA1MCAtMzUgODV0LTg1IDM1aC04MFptLTQ4MCAzMjBxLTUwIDAgLTg1IC0zNXQtMzUgLTg1di04MHEwIC01MCAzNSAtODV0ODUgLTM1aDgwcTUwIDAgODUgMzV0MzUgODV2ODBxMCA1MCAtMzUgODV0LTg1IDM1aC04MFptMCAtMzIwcS01MCAwIC04NSAtMzV0LTM1IC04NXYtODBxMCAtNTAgMzUgLTg1dDg1IC0zNWg4MHE1MCAwIDg1IDM1dDM1IDg1djgwcTAgNTAgLTM1IDg1dC04NSAzNWgtODBaIi8+PC9zdmc+"
                  alt="List view"
                  style={{ width: 20, height: 20, marginRight: 4 }}
                />
                List
              </Box>
            } 
            label="" 
          />
        </Tabs>
        
        <Typography variant="body2">
          {sortedAndFilteredGames.length} games found
        </Typography>
      </Box>
      
      {/* No Results */}
      {sortedAndFilteredGames.length === 0 && (
        <Paper sx={{ p: 5, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            No games found matching your criteria
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Try adjusting your search or filters to find games
          </Typography>
          <Button 
            variant="contained" 
            color="primary"
            onClick={handleClearFilters}
          >
            Clear Filters
          </Button>
        </Paper>
      )}
      
      {/* Games Grid View */}
      {viewMode === 0 && sortedAndFilteredGames.length > 0 && (
        <Grid container spacing={3}>
          {sortedAndFilteredGames.map((game) => (
            <Grid item xs={12} sm={6} md={4} key={game._id}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 20px rgba(0,0,0,0.1)'
                  }
                }}
              >
                <Box sx={{ position: 'relative' }}>
                  <CardMedia
                    component="img"
                    height="180"
                    image={game.photoUrl}
                    alt={game.name}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x180?text=Game+Image';
                    }}
                  />
                  <Box 
                    sx={{ 
                      position: 'absolute', 
                      top: 0, 
                      left: 0, 
                      width: '100%', 
                      height: '100%',
                      background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 50%)',
                    }}
                  />
                  <Box 
                    sx={{ 
                      position: 'absolute', 
                      bottom: 8, 
                      left: 12, 
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <Rating 
                      value={game.rating} 
                      readOnly 
                      precision={0.5} 
                      size="small"
                      sx={{ 
                        color: theme.palette.warning.main,
                        '& .MuiRating-iconEmpty': {
                          color: 'rgba(255,255,255,0.3)'
                        }
                      }}
                    />
                    <Typography 
                      variant="body2" 
                      sx={{ ml: 1, color: 'white', fontWeight: 500 }}
                    >
                      {game.rating.toFixed(1)}
                    </Typography>
                  </Box>
                  
                  {!game.ratingEnabled && (
                    <Chip 
                      label="Ratings Disabled" 
                      size="small" 
                      color="error" 
                      sx={{ 
                        position: 'absolute', 
                        top: 8, 
                        right: 8,
                        fontSize: '0.7rem',
                      }}
                    />
                  )}
                </Box>
                
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="div" gutterBottom noWrap>
                    {game.name}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                    {game.genres && game.genres.slice(0, 3).map((genre, index) => (
                      <Chip 
                        key={index} 
                        label={genre} 
                        size="small" 
                        variant="outlined"
                        sx={{ fontSize: '0.7rem' }}
                      />
                    ))}
                    {game.genres && game.genres.length > 3 && (
                      <Chip 
                        label={`+${game.genres.length - 3}`} 
                        size="small"
                        sx={{ fontSize: '0.7rem' }}
                      />
                    )}
                  </Box>
                  
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <AccessTimeIcon fontSize="small" sx={{ color: theme.palette.info.main, mr: 0.5 }} />
                        <Typography variant="body2" color="text.secondary">
                          {game.playTime}h played
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CommentIcon fontSize="small" sx={{ color: theme.palette.secondary.main, mr: 0.5 }} />
                        <Typography variant="body2" color="text.secondary">
                          {game.comments ? game.comments.length : 0} comments
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
                
                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button 
                    variant="contained" 
                    fullWidth
                    onClick={() => handleGameSelect(game)}
                    sx={{ 
                      textTransform: 'none',
                      bgcolor: theme.palette.info.main,
                      '&:hover': {
                        bgcolor: theme.palette.info.dark,
                      }
                    }}
                  >
                    View Details
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Games List View */}
      {viewMode === 1 && sortedAndFilteredGames.length > 0 && (
        <Box>
          {sortedAndFilteredGames.map((game) => (
            <Paper 
              key={game._id} 
              sx={{ 
                mb: 2, 
                overflow: 'hidden',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                }
              }}
            >
              <Grid container>
                <Grid item xs={12} sm={3} md={2}>
                  <Box sx={{ position: 'relative', height: '100%', minHeight: 160 }}>
                    <CardMedia
                      component="img"
                      image={game.photoUrl}
                      alt={game.name}
                      sx={{ height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/160x160?text=Game';
                      }}
                    />
                    {!game.ratingEnabled && (
                      <Chip 
                        label="Ratings Disabled" 
                        size="small" 
                        color="error" 
                        sx={{ 
                          position: 'absolute', 
                          top: 8, 
                          left: 8,
                          fontSize: '0.7rem',
                        }}
                      />
                    )}
                  </Box>
                </Grid>
                <Grid item xs={12} sm={9} md={10}>
                  <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Typography variant="h6" component="div" gutterBottom>
                        {game.name}
                      </Typography>
                      <Rating 
                        value={game.rating} 
                        readOnly 
                        precision={0.5} 
                        size="small"
                        sx={{ color: theme.palette.warning.main }}
                      />
                    </Box>
                    
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                      {game.genres && game.genres.map((genre, index) => (
                        <Chip 
                          key={index} 
                          label={genre} 
                          size="small" 
                          variant="outlined"
                          sx={{ fontSize: '0.75rem' }}
                        />
                      ))}
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <StarIcon fontSize="small" sx={{ color: theme.palette.warning.main, mr: 0.5 }} />
                          <Typography variant="body2">
                            {game.rating.toFixed(1)}/5
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <AccessTimeIcon fontSize="small" sx={{ color: theme.palette.info.main, mr: 0.5 }} />
                          <Typography variant="body2">
                            {game.playTime}h played
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CommentIcon fontSize="small" sx={{ color: theme.palette.secondary.main, mr: 0.5 }} />
                          <Typography variant="body2">
                            {game.comments ? game.comments.length : 0} comments
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Button 
                        variant="outlined" 
                        color="primary"
                        onClick={() => handleGameSelect(game)}
                        size="small"
                      >
                        View Details
                      </Button>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          ))}
        </Box>
      )}
      
      {/* Back to Home Button */}
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <Button 
          variant="outlined" 
          onClick={handleBackToHome}
          startIcon={<ArrowBackIcon />}
        >
          Back to Home
        </Button>
      </Box>
    </Box>
  );
}

export default GamesPage;