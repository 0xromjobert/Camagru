'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    
    await queryInterface.createTable('Images', {
      id: {allowNull: false, autoIncrement: true,primaryKey: true, type: Sequelize.INTEGER},
      title: { type: Sequelize.STRING, allowNull: false,},
      url: { type: Sequelize.STRING, allowNull: false,},
      userId: { type: Sequelize.INTEGER, references: {model: 'Users', key: 'id'}},
    });

    await queryInterface.createTable('Comments', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      text: { type: Sequelize.STRING, allowNull: false,},
      imageId: { type: Sequelize.INTEGER, references: {model: 'Images', key: 'id'}},
      userId: { type: Sequelize.INTEGER, references: {model: 'Users', key: 'id'}},
      time: { type: Sequelize.DATE, allowNull: false,},});

    await queryInterface.createTable('Likes', {
      id: {
        allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER},
      imageId: { type: Sequelize.INTEGER,references: {model: 'Images', key: 'id'}},
      userId: {type: Sequelize.INTEGER,references: {model: 'Users', key: 'id'}},
      time: {type: Sequelize.DATE,allowNull: false,},
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('Images');
    await queryInterface.dropTable('Comments');
    await queryInterface.dropTable('Likes');
  }
};
