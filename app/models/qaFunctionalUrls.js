/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('qaFunctionalUrls', {
      Id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true
      },
      Template: {
        type: DataTypes.CHAR(5),
        allowNull: true
      },
      URL: {
        type: "BLOB",
        allowNull: true
      },
      TestCaseId: {
        type: DataTypes.CHAR(1000),
        allowNull: true
      }
    }, {
      tableName: 'QaFunctionalUrls'
    });
  };
  