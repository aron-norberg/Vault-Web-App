module.exports = function(sequelize, Sequelize) {

  var User = sequelize.define('user', {

    id: {
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },

    firstname: {
      type: Sequelize.CHAR,
      notEmpty: true
    },

    lastname: {
      type: Sequelize.CHAR,
      notEmpty: true
    },

    username: {
      type: Sequelize.CHAR,
      unique: true,
      allowNull: false
    },

    email: {
      type: Sequelize.CHAR,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: Sequelize.CHAR,
      allowNull: false
    },
    last_login: {
      type: Sequelize.DATE
    }
  }, {
    tableName: 'User'
  });

  return User;

}
