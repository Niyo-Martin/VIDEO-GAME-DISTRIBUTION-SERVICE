// routes/users.js
const express = require('express');
const router = express.Router();
const path = require('path');
const User = require(path.join(__dirname, '../models/User'));
const Game = require(path.join(__dirname, '../models/Game'));
const mongoose = require('mongoose');

// Get all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get one user
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a new user
router.post('/', async (req, res) => {
  const user = new User({
    name: req.body.name
  });

  try {
    const newUser = await user.save();
    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Remove a user
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update all games this user has played, rated, or commented on
    const games = await Game.find({
      $or: [
        { 'userPlayTimes.userId': req.params.id },
        { 'userRatings.userId': req.params.id },
        { 'comments.userId': req.params.id }
      ]
    });

    for (const game of games) {
      // Get user's play time before removing
      const userPlayTimeRecord = game.userPlayTimes.find(
        record => record.userId.toString() === req.params.id
      );
      const userPlayTime = userPlayTimeRecord ? userPlayTimeRecord.playTime : 0;

      // Remove this user from game's play times
      game.userPlayTimes = game.userPlayTimes.filter(
        record => record.userId.toString() !== req.params.id
      );
      
      // Update total play time
      game.playTime -= userPlayTime;

      // Remove this user's rating
      game.userRatings = game.userRatings.filter(
        record => record.userId.toString() !== req.params.id
      );
      
      // Recalculate rating
      game.calculateRating();

      // Remove this user's comments
      game.comments = game.comments.filter(
        comment => comment.userId.toString() !== req.params.id
      );

      await game.save();
    }

    // Remove the user
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;