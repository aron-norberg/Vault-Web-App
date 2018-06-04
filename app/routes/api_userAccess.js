// Invoke 'strict' JavaScript mode
'use strict';

const db = require('../../config/sequelize');
const Sequelize = require('sequelize');

exports.updateUser = function(req, res) {
  //console.log('Hello Waldo!');

  let Id = 0;
  let newUserRole = 0;
  let userName = {};
  let firstname = '';
  let lastname = '';

  Id = req.body.Id;
  newUserRole = req.body.role;

  db.user.update({ role: newUserRole }, { where: { Id: Id }}).then(function(User) {

    db.sequelize.query(`SELECT * FROM user WHERE Id = ${Id}`, { type: Sequelize.QueryTypes.SELECT}).then(userName => {

      userName = userName[0];

      if (User) {
        console.log('\n' + "Users role successfully updated!" + '\n');
        res.send(userName.firstname + ' ' + userName.lastname)

      }
      else {
        console.log('\n' + "Something went wrong, please try again" + '\n');
        res.send(Id)

      } // end if/else

    }); // end db.sequelize.query(`SELECT firstname, lastname FROM user WHERE Id = ${Id}`).then(function(userName)

  }); // end User.update({ password: userPassword }, { where: { email: email }}).then(function(User)

}; // end exports.updateUser(req, res)


exports.removeUser = function(req, res) {
  //console.log('Hello Waldo!');

  let Id = 0;
  let userName = {};
  let firstname = '';
  let lastname = '';
  
  Id = req.body.Id;

  db.sequelize.query(`SELECT * FROM user WHERE Id = ${Id}`, { type: Sequelize.QueryTypes.SELECT}).then(userName => {

    db.user.destroy({ where: { id: Id }}).then(function(User) {

      userName = userName[0];
      //userName = JSON.parse(userName);
      //userName = JSON.stringify(userName);
      //console.log(userName.firstname + ' ' + userName.lastname);

      if (User >= 1) {
        console.log('\n' + "User has been removed successfully!" + '\n');
        res.send(userName.firstname + ' ' + userName.lastname)

      }
      else {
        console.log('\n' + "Something went wrong, please try again" + '\n');
        res.send(Id)

      } // end if/else

    }); // end User.update({ password: userPassword }, { where: { email: email }}).then(function(User)*/

  }); // end db.sequelize.query(`SELECT firstname, lastname FROM user WHERE Id = ${Id}`).then(function(userName)

}; // end exports.updateUser(req, res)
