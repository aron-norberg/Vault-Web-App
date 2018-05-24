module.exports = function(sequelize, DataTypes) {
  
  return sequelize.define('TestPass', {

    TestPassId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true
    },
    Template: {
      type: DataTypes.CHAR(5),
      allowNull: true
    },
    Language: {
      type: DataTypes.CHAR(5),
      allowNull: true
    },
    TestCases: {
      type: DataTypes.STRING(1000),
      allowNull: true
    },
    RunDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    UrlIds: {
      type: DataTypes.STRING(1000),
      allowNull: true
    },
    Domain: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    Description: {
      type: "BLOB",
      allowNull: true
    },
    Reliable: {
      type: "BOOLEAN",
      allowNull: true
    },
    Note: {
      type: "TEXT",
      allowNull: true
    }
  }, {
    tableName: 'TestPass'
  });
};
