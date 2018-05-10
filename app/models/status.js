/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Status', {
    TestPassId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true
    },
    RunDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    StartTime: {
      type: DataTypes.DATE,
      allowNull: false
    },
    EndTime: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'Status'
  });
};
