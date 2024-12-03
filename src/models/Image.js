const {DataTypes} = require('sequelize');

const sequelize = require('../config/database');

const Image = sequelize.define('Image', {
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    url: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    userId: {
        type: DataTypes.INTEGER,
        references: {model: 'User', key: 'id'}
    },
});

module.exports = Image;