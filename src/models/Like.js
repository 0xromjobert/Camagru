const {DataTypes} = require('sequelize');

const sequelize = require('../config/database');

const Like = sequelize.define('Like', {
    imageId:{
        type: DataTypes.INTEGER,
        references: {model: 'Image', key: 'id'}
    },
    userId:{
        type: DataTypes.INTEGER,
        references: {model: 'User', key: 'id'}
    },
    time: {
        type: DataTypes.DATE,
        allowNull: false,
    },
});

module.exports = Like;
