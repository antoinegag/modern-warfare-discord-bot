"use strict";
module.exports = (sequelize, DataTypes) => {
  const Player = sequelize.define(
    "Player",
    {
      discordId: {
        type: DataTypes.STRING,
        primaryKey: true
      },
      battlenetName: DataTypes.STRING
    },
    {}
  );
  Player.associate = function(models) {
    // associations can be defined here
  };
  return Player;
};
