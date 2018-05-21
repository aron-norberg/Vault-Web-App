/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {

  return sequelize.define('Result', {
    
    TestCaseId: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    TestPassId: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    Template: {
      type: DataTypes.CHAR(5),
      allowNull: false
    },
    Language: {
      type: DataTypes.CHAR(5),
      allowNull: false
    },
    Result: {
      type: DataTypes.CHAR(4),
      allowNull: false
    },
    URLs: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    Output: {
      type: "BLOB",
      allowNull: false
    },
    RunDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    Id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true
    },
    Owner: {
      type: DataTypes.CHAR(50),
      allowNull: true
    },
    Notes: {
      type: "TEXT",
      allowNull: true
    }
  }, {
    tableName: 'Result'
  });
};