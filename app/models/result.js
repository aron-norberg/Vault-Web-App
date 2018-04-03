/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Result', {
    TestCaseId: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      primaryKey: true
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
      allowNull: false,
      primaryKey: true
    },
    Output: {
      type: "BLOB",
      allowNull: false
    },
    RunDate: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    tableName: 'Result'
  });
};