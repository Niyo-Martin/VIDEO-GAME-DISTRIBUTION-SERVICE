// models/User.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  totalPlayTime: {
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    default: 0
  },
  mostPlayedGameId: {
    type: Schema.Types.ObjectId,
    ref: 'Game',
    default: null
  },
  mostPlayedGameName: {
    type: String,
    default: ''
  },
  comments: [{
    gameId: {
      type: Schema.Types.ObjectId,
      ref: 'Game'
    },
    gameName: String,
    content: String,
    playTime: Number
  }],
  gamePlayTimes: [{
    gameId: {
      type: Schema.Types.ObjectId,
      ref: 'Game'
    },
    playTime: Number
  }],
  gameRatings: [{
    gameId: {
      type: Schema.Types.ObjectId,
      ref: 'Game'
    },
    rating: Number
  }]
});

// Calculate average rating
UserSchema.methods.calculateAverageRating = function() {
  const totalRatings = this.gameRatings.length;
  if (totalRatings === 0) {
    this.averageRating = 0;
    return 0;
  }
  
  const sum = this.gameRatings.reduce((acc, record) => acc + record.rating, 0);
  this.averageRating = sum / totalRatings;
  return this.averageRating;
};

// Update most played game
UserSchema.methods.updateMostPlayedGame = async function() {
  if (this.gamePlayTimes.length === 0) {
    this.mostPlayedGameId = null;
    this.mostPlayedGameName = '';
    return;
  }
  
  let maxPlayTime = 0;
  let mostPlayedGameId = null;
  
  this.gamePlayTimes.forEach(record => {
    if (record.playTime > maxPlayTime) {
      maxPlayTime = record.playTime;
      mostPlayedGameId = record.gameId;
    }
  });
  
  this.mostPlayedGameId = mostPlayedGameId;
  
  if (mostPlayedGameId) {
    const Game = mongoose.model('Game');
    const game = await Game.findById(mostPlayedGameId);
    if (game) {
      this.mostPlayedGameName = game.name;
    }
  }
};

module.exports = mongoose.model('User', UserSchema);