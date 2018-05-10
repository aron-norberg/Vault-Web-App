module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Urls', {
    UrlId: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      primaryKey: true
    },
    TemplateId: {
      type: DataTypes.CHAR(5),
      allowNull: true
    },
    Language: {
      type: DataTypes.CHAR(5),
      allowNull: true
    },
    Url: {
      type: "BLOB",
      allowNull: true
    },
    Rank: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    Live: {
      type: "BOOLEAN",
      allowNull: true,
      defaultValue: 1
    }
  }, {
    tableName: 'Urls'
  });
};
