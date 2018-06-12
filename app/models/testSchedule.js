/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {

    return sequelize.define('testSchedule', {

        Languages: {
            type: "TEXT",
            allowNull: true
        },
        Template: {
            type: DataTypes.CHAR(5),
            allowNull: true
        }, 
        TestCaseIds: {
            type: "TEXT",
            allowNull: true
        },
        Domain: {
            type: DataTypes.CHAR(255),
            allowNull: true
        },
        URLsCount: {
            type: DataTypes.CHAR(5),
            allowNull: true
        },
        Description: {
            type: "TEXT",
            allowNull: true
        },
        Schedule: {
            type: "TEXT",
            allowNull: true
        },
        Id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true
        },
        SpecifiedURLs: {
            type: "TEXT",
            allowNull: true
        }
    }, { 
        tableName: 'TestSchedule'
    });
  };
  