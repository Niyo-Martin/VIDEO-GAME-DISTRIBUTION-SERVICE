// models/Game.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GameSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  genres: {
    type: [String],
    validate: [arrayLimit, '{PATH} exceeds the limit of 5']
  },
  photoUrl: {
    type: String,
    required: true
  },
  playTime: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0
  },
  ratingEnabled: {
    type: Boolean,
    default: true
  },
  comments: [{
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    userName: String,
    content: String,
    playTime: Number
  }],
  userPlayTimes: [{
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    playTime: Number
  }],
  userRatings: [{
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: Number
  }],
  optionalAttributes: {
    type: Map,
    of: Schema.Types.Mixed
  }
});

function arrayLimit(val) {
  return val.length <= 5;
}

// Calculate weighted rating
GameSchema.methods.calculateRating = function() {
  let totalWeightedRating = 0;
  let totalPlayTime = 0;
  
  this.userRatings.forEach(userRating => {
    const userPlayTimeRecord = this.userPlayTimes.find(
      record => record.userId.toString() === userRating.userId.toString()
    );
    
    if (userPlayTimeRecord && userPlayTimeRecord.playTime > 0) {
      totalWeightedRating += userRating.rating * userPlayTimeRecord.playTime;
      totalPlayTime += userPlayTimeRecord.playTime;
    }
  });
  
  this.rating = totalPlayTime > 0 ? totalWeightedRating / totalPlayTime : 0;
  return this.rating;
};

module.exports = mongoose.model('Game', GameSchema);