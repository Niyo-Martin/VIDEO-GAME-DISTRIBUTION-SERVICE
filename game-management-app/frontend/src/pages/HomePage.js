import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
} from '@mui/material';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const API_URL = `${API_BASE_URL}/api`;

function HomePage() {
  const navigate = useNavigate();
  const [games, setGames] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedGame, setSelectedGame] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  
  // Form states
  const [newGame, setNewGame] = useState({
    name: '',
    genres: [''],
    photoUrl: '',
    optionalAttributes: {}
  });
  
  const [newUser, setNewUser] = useState({
    name: ''
  });
  
  const [newOptionalAttribute, setNewOptionalAttribute] = useState({
    key: '',
    value: ''
  });

  // Fetch games and users
  useEffect(() => {
    const fetchData = async () => {
      try {
        const gamesResponse = await axios.get(`${API_URL}/games`);
        const usersResponse = await axios.get(`${API_URL}/users`);
        
        setGames(gamesResponse.data);
        setUsers(usersResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    
    fetchData();
  }, []);

  // Add a new game
  const handleAddGame = async (e) => {
    e.preventDefault();
    
    try {
      // Filter out empty genres
      const filteredGenres = newGame.genres.filter(genre => genre.trim() !== '');
      
      const gameData = {
        ...newGame,
        genres: filteredGenres
      };
      
      const response = await axios.post(`${API_URL}/games`, gameData);
      
      // Update games list
      setGames([...games, response.data]);
      
      // Reset form
      setNewGame({
        name: '',
        genres: [''],
        photoUrl: '',
        optionalAttributes: {}
      });
      
      setNewOptionalAttribute({
        key: '',
        value: ''
      });
    } catch (error) {
      console.error('Error adding game:', error);
    }
  };

  // Add a new user
  const handleAddUser = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.post(`${API_URL}/users`, newUser);
      
      // Update users list
      setUsers([...users, response.data]);
      
      // Reset form
      setNewUser({
        name: ''
      });
    } catch (error) {
      console.error('Error adding user:', error);
    }
  };

  // Remove a game
  const handleRemoveGame = async () => {
    if (!selectedGame) return;
    
    try {
      await axios.delete(`${API_URL}/games/${selectedGame}`);
      
      // Update games list
      setGames(games.filter(game => game._id !== selectedGame));
      
      // Reset selection
      setSelectedGame('');
    } catch (error) {
      console.error('Error removing game:', error);
    }
  };

  // Remove a user
  const handleRemoveUser = async () => {
    if (!selectedUser) return;
    
    try {
      await axios.delete(`${API_URL}/users/${selectedUser}`);
      
      // Update users list
      setUsers(users.filter(user => user._id !== selectedUser));
      
      // Reset selection
      setSelectedUser('');
    } catch (error) {
      console.error('Error removing user:', error);
    }
  };

  // Enable/disable rating and comment
  const handleToggleRating = async (enable) => {
    if (!selectedGame) return;
    
    try {
      const response = await axios.patch(`${API_URL}/games/${selectedGame}/rating-status`, { enable });
      
      // Update games list
      setGames(games.map(game => 
        game._id === selectedGame ? { ...game, ratingEnabled: enable } : game
      ));
    } catch (error) {
      console.error('Error toggling rating:', error);
    }
  };

  // Login as user
  const handleUserLogin = () => {
    if (!selectedUser) return;
    navigate(`/user/${selectedUser}`);
  };

  // Add genre field
  const handleAddGenre = () => {
    if (newGame.genres.length >= 5) return;
    setNewGame({
      ...newGame,
      genres: [...newGame.genres, '']
    });
  };

  // Update genre field
  const handleGenreChange = (index, value) => {
    const updatedGenres = [...newGame.genres];
    updatedGenres[index] = value;
    setNewGame({
      ...newGame,
      genres: updatedGenres
    });
  };

  // Remove genre field
  const handleRemoveGenre = (index) => {
    const updatedGenres = newGame.genres.filter((_, i) => i !== index);
    setNewGame({
      ...newGame,
      genres: updatedGenres
    });
  };

  // Add optional attribute
  const handleAddOptionalAttribute = () => {
    if (!newOptionalAttribute.key || !newOptionalAttribute.value) return;
    
    setNewGame({
      ...newGame,
      optionalAttributes: {
        ...newGame.optionalAttributes,
        [newOptionalAttribute.key]: newOptionalAttribute.value
      }
    });
    
    setNewOptionalAttribute({
      key: '',
      value: ''
    });
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
      VIDEO GAME DISTRIBUTION SERVICE
      </Typography>
      
      <Grid container spacing={3}>
        {/* Game Management Section */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h5" gutterBottom>
              Game Management
            </Typography>
            
            <Divider sx={{ mb: 2 }} />
            
            {/* Add Game Form */}
            <form onSubmit={handleAddGame}>
              <Typography variant="h6" gutterBottom>
                Add Game
              </Typography>
              
              <TextField
                label="Game Name"
                fullWidth
                margin="normal"
                value={newGame.name}
                onChange={(e) => setNewGame({ ...newGame, name: e.target.value })}
                required
              />
              
              {newGame.genres.map((genre, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TextField
                    label={`Genre ${index + 1}`}
                    fullWidth
                    margin="normal"
                    value={genre}
                    onChange={(e) => handleGenreChange(index, e.target.value)}
                  />
                  {index > 0 && (
                    <Button 
                      color="error" 
                      onClick={() => handleRemoveGenre(index)}
                      sx={{ ml: 1 }}
                    >
                      Remove
                    </Button>
                  )}
                </Box>
              ))}
              
              {newGame.genres.length < 5 && (
                <Button onClick={handleAddGenre} sx={{ mb: 2 }}>
                  Add Genre
                </Button>
              )}
              
              <TextField
                label="Photo URL"
                fullWidth
                margin="normal"
                value={newGame.photoUrl}
                onChange={(e) => setNewGame({ ...newGame, photoUrl: e.target.value })}
                required
                helperText="Link to an online image"
              />
              
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Optional Attributes
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'flex-end', mb: 2 }}>
                <TextField
                  label="Attribute Name"
                  sx={{ mr: 1, flexGrow: 1 }}
                  value={newOptionalAttribute.key}
                  onChange={(e) => setNewOptionalAttribute({ ...newOptionalAttribute, key: e.target.value })}
                />
                <TextField
                  label="Attribute Value"
                  sx={{ mr: 1, flexGrow: 1 }}
                  value={newOptionalAttribute.value}
                  onChange={(e) => setNewOptionalAttribute({ ...newOptionalAttribute, value: e.target.value })}
                />
                <Button onClick={handleAddOptionalAttribute}>Add</Button>
              </Box>
              
              {Object.entries(newGame.optionalAttributes).map(([key, value]) => (
                <Box key={key} sx={{ mb: 1 }}>
                  <Typography variant="body2">
                    <strong>{key}:</strong> {value}
                  </Typography>
                </Box>
              ))}
              
              <Button 
                type="submit" 
                variant="contained" 
                color="primary" 
                sx={{ mt: 2 }}
                disabled={!newGame.name || !newGame.photoUrl}
              >
                Add Game
              </Button>
            </form>
            
            <Divider sx={{ my: 3 }} />
            
            {/* Remove Game Form */}
            <Typography variant="h6" gutterBottom>
              Remove Game
            </Typography>
            
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
            
            <Button 
              variant="contained" 
              color="error" 
              sx={{ mt: 1 }}
              onClick={handleRemoveGame}
              disabled={!selectedGame}
            >
              Remove Game
            </Button>
            
            <Divider sx={{ my: 3 }} />
            
            {/* Enable/Disable Rating Form */}
            <Typography variant="h6" gutterBottom>
              Rating & Comment Controls
            </Typography>
            
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
            
            <Box sx={{ mt: 1, display: 'flex', gap: 2 }}>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={() => handleToggleRating(true)}
                disabled={!selectedGame}
              >
                Enable Rating
              </Button>
              
              <Button 
                variant="contained" 
                color="secondary" 
                onClick={() => handleToggleRating(false)}
                disabled={!selectedGame}
              >
                Disable Rating
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        {/* User Management Section */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h5" gutterBottom>
              User Management
            </Typography>
            
            <Divider sx={{ mb: 2 }} />
            
            {/* Add User Form */}
            <form onSubmit={handleAddUser}>
              <Typography variant="h6" gutterBottom>
                Add User
              </Typography>
              
              <TextField
                label="User Name"
                fullWidth
                margin="normal"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                required
              />
              
              <Button 
                type="submit" 
                variant="contained" 
                color="primary" 
                sx={{ mt: 2 }}
                disabled={!newUser.name}
              >
                Add User
              </Button>
            </form>
            
            <Divider sx={{ my: 3 }} />
            
            {/* Remove User Form */}
            <Typography variant="h6" gutterBottom>
              Remove User
            </Typography>
            
            <FormControl fullWidth margin="normal">
              <InputLabel>Select User</InputLabel>
              <Select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                label="Select User"
              >
                {users.map((user) => (
                  <MenuItem key={user._id} value={user._id}>
                    {user.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Button 
              variant="contained" 
              color="error" 
              sx={{ mt: 1 }}
              onClick={handleRemoveUser}
              disabled={!selectedUser}
            >
              Remove User
            </Button>
            
            <Divider sx={{ my: 3 }} />
            
            {/* Login as User Form */}
            <Typography variant="h6" gutterBottom>
              Login as User
            </Typography>
            
            <FormControl fullWidth margin="normal">
              <InputLabel>Select User</InputLabel>
              <Select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                label="Select User"
              >
                {users.map((user) => (
                  <MenuItem key={user._id} value={user._id}>
                    {user.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Button 
              variant="contained" 
              color="success" 
              sx={{ mt: 1 }}
              onClick={handleUserLogin}
              disabled={!selectedUser}
            >
              Login
            </Button>
          </Paper>
        </Grid>
        
        {/* Games List */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Games List
            </Typography>
            
            <List>
              {games.map((game) => (
                <ListItem key={game._id}>
                  <ListItemText 
                    primary={game.name} 
                    secondary={`Genres: ${game.genres.join(', ')} | Rating: ${game.rating.toFixed(1)}/5 | Play Time: ${game.playTime}h`} 
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
        
        {/* Users List */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Users List
            </Typography>
            
            <List>
              {users.map((user) => (
                <ListItem key={user._id}>
                  <ListItemText 
                    primary={user.name} 
                    secondary={`Total Play Time: ${user.totalPlayTime}h | Avg Rating: ${user.averageRating.toFixed(1)}/5`} 
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default HomePage;