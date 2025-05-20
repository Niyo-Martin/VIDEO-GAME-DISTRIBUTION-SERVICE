// seed.js - Script to populate database with initial data

const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import models
const Game = require('./models/Game');
const User = require('./models/User');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://<username>:<password>@<cluster>.mongodb.net/gameDatabase?retryWrites=true&w=majority';

// Sample data
const gameData = [
  {
    name: 'The Witcher 3: Wild Hunt',
    genres: ['RPG', 'Open World', 'Action'],
    photoUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1wyy.jpg',
    optionalAttributes: {
      releaseDate: '2015-05-19',
      developer: 'CD Projekt RED',
      platforms: 'PC, PlayStation, Xbox, Switch'
    }
  },
  {
    name: 'Red Dead Redemption 2',
    genres: ['Action', 'Adventure', 'Open World'],
    photoUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1q1f.jpg',
    optionalAttributes: {
      releaseDate: '2018-10-26',
      developer: 'Rockstar Games',
      platforms: 'PC, PlayStation, Xbox'
    }
  },
  {
    name: 'Minecraft',
    genres: ['Sandbox', 'Survival', 'Building'],
    photoUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co49x5.jpg',
    optionalAttributes: {
      releaseDate: '2011-11-18',
      developer: 'Mojang Studios',
      playerMode: 'Single-player, Multiplayer'
    }
  },
  {
    name: 'Grand Theft Auto V',
    genres: ['Action', 'Adventure', 'Open World'],
    photoUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1ivc.jpg'
  },
  {
    name: 'The Legend of Zelda: Breath of the Wild',
    genres: ['Action', 'Adventure', 'Open World'],
    photoUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co3p2d.jpg'
  },
  {
    name: 'Fortnite',
    genres: ['Battle Royale', 'Shooter', 'Survival'],
    photoUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2ekt.jpg'
  },
  {
    name: 'FIFA 23',
    genres: ['Sports', 'Simulation'],
    photoUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co4p43.jpg'
  },
  {
    name: 'Call of Duty: Modern Warfare II',
    genres: ['FPS', 'Action', 'Shooter'],
    photoUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co4sbw.jpg'
  },
  {
    name: 'Among Us',
    genres: ['Party', 'Social Deduction', 'Indie'],
    photoUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2s7n.jpg'
  },
  {
    name: 'Cyberpunk 2077',
    genres: ['RPG', 'Action', 'Open World'],
    photoUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co4bko.jpg',
    optionalAttributes: {
      releaseDate: '2020-12-10',
      developer: 'CD Projekt RED',
      setting: 'Dystopian Future'
    }
  }
];

const userData = [
  { name: 'Alex Johnson' },
  { name: 'Emma Davis' },
  { name: 'Michael Smith' },
  { name: 'Olivia Wilson' },
  { name: 'James Brown' },
  { name: 'Sophia Miller' },
  { name: 'William Taylor' },
  { name: 'Ava Anderson' },
  { name: 'Benjamin Thomas' },
  { name: 'Isabella Jackson' }
];

// Clear database and seed with new data
async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB Atlas for seeding');
    
    // Clear existing data
    await Game.deleteMany({});
    await User.deleteMany({});
    console.log('Cleared existing data');
    
    // Insert games
    const games = await Game.insertMany(gameData);
    console.log(`Inserted ${games.length} games`);
    
    // Insert users
    const users = await User.insertMany(userData);
    console.log(`Inserted ${users.length} users`);
    
    // Add interactions for the first 3 users with the first 5 games
    for (let i = 0; i < 3; i++) {
      const user = users[i];
      
      // Track user's play time for updating most played game
      let userGamePlayTimes = [];
      
      // Play games (first 5 games)
      for (let j = 0; j < 5; j++) {
        const game = games[j];
        const playTime = Math.floor(Math.random() * 20) + 5; // 5-24 hours of play time
        
        // Update game's play time and user play time records
        game.playTime += playTime;
        const userPlayTimeIndex = game.userPlayTimes.findIndex(
          record => record.userId.toString() === user._id.toString()
        );
        
        if (userPlayTimeIndex >= 0) {
          game.userPlayTimes[userPlayTimeIndex].playTime += playTime;
        } else {
          game.userPlayTimes.push({ userId: user._id, playTime });
        }
        
        // Update user's play time records
        user.totalPlayTime += playTime;
        const userGamePlayTimeIndex = user.gamePlayTimes.findIndex(
          record => record.gameId.toString() === game._id.toString()
        );
        
        if (userGamePlayTimeIndex >= 0) {
          user.gamePlayTimes[userGamePlayTimeIndex].playTime += playTime;
        } else {
          user.gamePlayTimes.push({ gameId: game._id, playTime });
        }
        
        userGamePlayTimes.push({ gameId: game._id, playTime });
        
        // Rate games (first 3 games)
        if (j < 3) {
          const rating = Math.floor(Math.random() * 5) + 1; // 1-5 rating
          
          // Update game's rating records
          const userRatingIndex = game.userRatings.findIndex(
            record => record.userId.toString() === user._id.toString()
          );
          
          if (userRatingIndex >= 0) {
            game.userRatings[userRatingIndex].rating = rating;
          } else {
            game.userRatings.push({ userId: user._id, rating });
          }
          
          // Update user's rating records
          const userGameRatingIndex = user.gameRatings.findIndex(
            record => record.gameId.toString() === game._id.toString()
          );
          
          if (userGameRatingIndex >= 0) {
            user.gameRatings[userGameRatingIndex].rating = rating;
          } else {
            user.gameRatings.push({ gameId: game._id, rating });
          }
        }
        
        // Comment on games (first 3 games)
        if (j < 3) {
          const commentContent = `This is my comment on ${game.name}. I spent ${playTime} hours playing it.`;
          
          // Update game's comments
          const commentIndex = game.comments.findIndex(
            comment => comment.userId.toString() === user._id.toString()
          );
          
          if (commentIndex >= 0) {
            game.comments[commentIndex].content = commentContent;
            game.comments[commentIndex].playTime = playTime;
          } else {
            game.comments.push({
              userId: user._id,
              userName: user.name,
              content: commentContent,
              playTime: playTime
            });
          }
          
          // Update user's comments
          const userCommentIndex = user.comments.findIndex(
            comment => comment.gameId.toString() === game._id.toString()
          );
          
          if (userCommentIndex >= 0) {
            user.comments[userCommentIndex].content = commentContent;
            user.comments[userCommentIndex].playTime = playTime;
          } else {
            user.comments.push({
              gameId: game._id,
              gameName: game.name,
              content: commentContent,
              playTime: playTime
            });
          }
        }
        
        // Save game
        await game.save();
      }
      
      // Calculate user's average rating
      user.calculateAverageRating();
      
      // Set most played game
      let maxPlayTime = 0;
      let mostPlayedGameId = null;
      let mostPlayedGameName = '';
      
      userGamePlayTimes.forEach(record => {
        if (record.playTime > maxPlayTime) {
          maxPlayTime = record.playTime;
          mostPlayedGameId = record.gameId;
        }
      });
      
      if (mostPlayedGameId) {
        const mostPlayedGame = games.find(game => game._id.toString() === mostPlayedGameId.toString());
        if (mostPlayedGame) {
          user.mostPlayedGameId = mostPlayedGameId;
          user.mostPlayedGameName = mostPlayedGame.name;
        }
      }
      
      // Sort comments by play time
      user.comments.sort((a, b) => b.playTime - a.playTime);
      
      // Save user
      await user.save();
    }
    
    // Calculate ratings for all games
    for (const game of games) {
      game.calculateRating();
      
      // Sort comments by play time
      game.comments.sort((a, b) => b.playTime - a.playTime);
      
      await game.save();
    }
    
    console.log('Seed completed successfully!');
    
    // Close connection
    await mongoose.connection.close();
    console.log('Database connection closed');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    
    // Close connection
    await mongoose.connection.close();
    console.log('Database connection closed');
    
    process.exit(1);
  }
}

// Run the seed function
seedDatabase();