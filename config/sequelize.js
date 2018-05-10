
'use strict';

const timezone = 'America/Los_Angeles';

// require('moment').tz.setDefault(timezone);

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const lodash = require('lodash');
const db = {};

let rootPath = path.normalize(__dirname + '/..');
let modelsDir = rootPath + '/app/models';
// create your instance of sequelize

let sequelize = new Sequelize('test', 'flukeqa', 'H0lidayApples', {
        host: 'localhost',
        port: '3306',
        dialect: 'mysql',
        timezone: timezone,
        define: {
        timestamps: false
      },
      
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
		  },
        // Disable Logging temporarily
        logging: false
});

sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
});

module.export = sequelize;

// loop through all files in models directory ignoring hidden files and this file
fs.readdirSync(modelsDir)
    .filter(function (file) {
        return (file.indexOf('.') !== 0) && (file !== 'index.js')
    })
    // import model files and save model names
    .forEach(function (file) {
        var model = sequelize.import(path.join(modelsDir, file));
        db[model.name] = model;
    });

// invoke associations on each of the models
Object.keys(db).forEach(function (modelName) {
    if (db[modelName].options.hasOwnProperty('associate')) {
        db[modelName].options.associate(db)
    }
});

// assign the sequelize variables to the db object and return the db. 
module.exports = lodash.extend({
    sequelize: sequelize,
    Sequelize: Sequelize
}, db);


