/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('localization', {
    URL_locale: {
      type: DataTypes.CHAR(5),
      allowNull: true
    },
    URL_equivalent: {
      type: DataTypes.CHAR(5),
      allowNull: true
    }
  }, {
    tableName: 'localization'
  });
};
