// routes/games.js
const express = require('express');
const router = express.Router();
const path = require('path');
const Game = require(path.join(__dirname, '../models/Game'));
const User = require('../models/User');
const mongoose = require('mongoose');

// Get all games
router.get('/', async (req, res) => {
  try {
    const games = await Game.find();
    res.json(games);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a new game
router.post('/', async (req, res) => {
  const game = new Game({
    name: req.body.name,
    genres: req.body.genres,
    photoUrl: req.body.photoUrl,
    optionalAttributes: req.body.optionalAttributes || {}
  });

  try {
    const newGame = await game.save();
    res.status(201).json(newGame);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Remove a game
router.delete('/:id', async (req, res) => {
  try {
    // Find and remove the game
    const game = await Game.findById(req.params.id);
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    // Update all users who have played, rated, or commented on this game
    const users = await User.find({
      $or: [
        { 'gamePlayTimes.gameId': req.params.id },
        { 'gameRatings.gameId': req.params.id },
        { 'comments.gameId': req.params.id }
      ]
    });

    for (const user of users) {
      // Remove this game from user's play times, ratings, and comments
      user.gamePlayTimes = user.gamePlayTimes.filter(
        record => record.gameId.toString() !== req.params.id
      );
      user.gameRatings = user.gameRatings.filter(
        record => record.gameId.toString() !== req.params.id
      );
      user.comments = user.comments.filter(
        comment => comment.gameId.toString() !== req.params.id
      );

      // Recalculate average rating
      user.calculateAverageRating();

      // Update most played game
      await user.updateMostPlayedGame();

      await user.save();
    }

    await Game.findByIdAndDelete(req.params.id);
    res.json({ message: 'Game deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Enable/disable rating and comments
router.patch('/:id/rating-status', async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    game.ratingEnabled = req.body.enable;
    const updatedGame = await game.save();
    res.json(updatedGame);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update play time
router.patch('/:id/play', async (req, res) => {
  try {
    const { userId, hours } = req.body;
    if (!userId || !hours || hours <= 0) {
      return res.status(400).json({ message: 'User ID and positive play hours are required' });
    }

    const game = await Game.findById(req.params.id);
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update game's play time
    const userPlayTimeIndex = game.userPlayTimes.findIndex(
      record => record.userId.toString() === userId
    );

    if (userPlayTimeIndex >= 0) {
      const oldPlayTime = game.userPlayTimes[userPlayTimeIndex].playTime;
      game.userPlayTimes[userPlayTimeIndex].playTime += hours;
      game.playTime = game.playTime - oldPlayTime + game.userPlayTimes[userPlayTimeIndex].playTime;
    } else {
      game.userPlayTimes.push({ userId, playTime: hours });
      game.playTime += hours;
    }

    // Recalculate rating if user has rated this game
    game.calculateRating();

    // Update comment order if user has commented on this game
    const commentIndex = game.comments.findIndex(
      comment => comment.userId.toString() === userId
    );
    if (commentIndex >= 0) {
      const userPlayTimeRecord = game.userPlayTimes.find(
        record => record.userId.toString() === userId
      );
      game.comments[commentIndex].playTime = userPlayTimeRecord.playTime;
      
      // Sort comments by play time
      game.comments.sort((a, b) => b.playTime - a.playTime);
    }

    await game.save();

    // Update user's play time
    const userGamePlayTimeIndex = user.gamePlayTimes.findIndex(
      record => record.gameId.toString() === req.params.id
    );

    if (userGamePlayTimeIndex >= 0) {
      user.gamePlayTimes[userGamePlayTimeIndex].playTime += hours;
    } else {
      user.gamePlayTimes.push({ gameId: req.params.id, playTime: hours });
    }

    user.totalPlayTime += hours;
    
    // Update user's most played game
    await user.updateMostPlayedGame();

    // Update user's comment order if user has commented on this game
    const userCommentIndex = user.comments.findIndex(
      comment => comment.gameId.toString() === req.params.id
    );
    if (userCommentIndex >= 0) {
      const userGamePlayTimeRecord = user.gamePlayTimes.find(
        record => record.gameId.toString() === req.params.id
      );
      user.comments[userCommentIndex].playTime = userGamePlayTimeRecord.playTime;
      
      // Sort comments by play time
      user.comments.sort((a, b) => b.playTime - a.playTime);
    }

    await user.save();

    res.json({
      game,
      user
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Rate a game
router.post('/:id/rate', async (req, res) => {
  try {
    const { userId, rating } = req.body;
    if (!userId || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({ 
        message: 'User ID and rating (1-5) are required' 
      });
    }

    const game = await Game.findById(req.params.id);
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    if (!game.ratingEnabled) {
      return res.status(400).json({ 
        message: 'Rating is disabled for this game' 
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user has played this game for at least 1 hour
    const userPlayTimeRecord = game.userPlayTimes.find(
      record => record.userId.toString() === userId
    );
    if (!userPlayTimeRecord || userPlayTimeRecord.playTime < 1) {
      return res.status(400).json({ 
        message: 'User must play this game for at least 1 hour before rating' 
      });
    }

    // Update game's rating
    const userRatingIndex = game.userRatings.findIndex(
      record => record.userId.toString() === userId
    );

    if (userRatingIndex >= 0) {
      game.userRatings[userRatingIndex].rating = rating;
    } else {
      game.userRatings.push({ userId, rating });
    }

    game.calculateRating();
    await game.save();

    // Update user's rating
    const userGameRatingIndex = user.gameRatings.findIndex(
      record => record.gameId.toString() === req.params.id
    );

    if (userGameRatingIndex >= 0) {
      user.gameRatings[userGameRatingIndex].rating = rating;
    } else {
      user.gameRatings.push({ gameId: req.params.id, rating });
    }

    user.calculateAverageRating();
    await user.save();

    res.json({
      game,
      user
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Comment on a game
router.post('/:id/comment', async (req, res) => {
  try {
    const { userId, content } = req.body;
    if (!userId || !content) {
      return res.status(400).json({ message: 'User ID and comment content are required' });
    }

    const game = await Game.findById(req.params.id);
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    if (!game.ratingEnabled) {
      return res.status(400).json({ message: 'Commenting is disabled for this game' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user has played this game for at least 1 hour
    const userPlayTimeRecord = game.userPlayTimes.find(
      record => record.userId.toString() === userId
    );
    if (!userPlayTimeRecord || userPlayTimeRecord.playTime < 1) {
      return res.status(400).json({ 
        message: 'User must play this game for at least 1 hour before commenting' 
      });
    }

    // Update game's comments
    const commentIndex = game.comments.findIndex(
      comment => comment.userId.toString() === userId
    );

    if (commentIndex >= 0) {
      game.comments[commentIndex].content = content;
    } else {
      game.comments.push({
        userId,
        userName: user.name,
        content,
        playTime: userPlayTimeRecord.playTime
      });
    }

    // Sort comments by play time
    game.comments.sort((a, b) => b.playTime - a.playTime);
    await game.save();

    // Update user's comments
    const userCommentIndex = user.comments.findIndex(
      comment => comment.gameId.toString() === req.params.id
    );

    if (userCommentIndex >= 0) {
      user.comments[userCommentIndex].content = content;
    } else {
      user.comments.push({
        gameId: req.params.id,
        gameName: game.name,
        content,
        playTime: userPlayTimeRecord.playTime
      });
    }

    // Sort comments by play time
    user.comments.sort((a, b) => b.playTime - a.playTime);
    await user.save();

    res.json({
      game,
      user
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;