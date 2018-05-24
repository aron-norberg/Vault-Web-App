/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Template', {
    Id: {
      type: DataTypes.CHAR(5),
      allowNull: false,
      primaryKey: true
    },
    TestCaseId: {
      type: DataTypes.CHAR(1000),
      allowNull: true,
      primaryKey: false
    }
  }, {
    tableName: 'Template'
  });
};
