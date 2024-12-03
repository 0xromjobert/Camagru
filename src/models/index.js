// Import sequelize
const sequelize = require('../config/database');

// Import models
const User = require('./User');
const Image = require('./Image');
const Comments = require('./Comment');
const Like = require('./Like');

//User <-> Image : 1 <-> M (1 user can have multiple images but 1 image can only have 1 user)
User.hasMany(Image, {foreignKey: 'userId', as: 'images'});
Image.belongsTo(User, {foreignKey: 'userId', as: 'user'});

//User <-> Comment : 1 <-> M
User.hasMany(Comments, {foreignKey: 'userId', as: 'comments'});
Comments.belongsTo(User, {foreignKey: 'userId', as: 'user'});

//User <-> Like : 1 <-> M
User.hasMany(Like, {foreignKey: 'userId', as: 'likes'});
Like.belongsTo(User, {foreignKey: 'userId', as: 'user'});

//Image <-> Comment : 1 <-> M
Image.hasMany(Comments, {foreignKey: 'imageId', as: 'comments'});
Comments.belongsTo(Image, {foreignKey: 'imageId', as: 'image'});


//Image <-> Like : 1 <-> M
Image.hasMany(Like, {foreignKey: 'imageId', as: 'likes'});
Like.belongsTo(Image, {foreignKey: 'imageId', as: 'image'});

// Export models
module.exports = { sequelize, User, Image, Like, Comments};