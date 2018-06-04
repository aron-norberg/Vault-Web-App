// Invoke 'strict' JavaScript mode
'use strict';

const db = require('../../config/sequelize');
const Sequelize = require('sequelize');

exports.updateUser = function(req, res) {
  //console.log('Hello Waldo!');

  let Id = 0;
  let newUserRole = 0;

  Id = req.body.Id;
  newUserRole = req.body.role;
  //console.log(Id);
  //console.log(newUserRole);

  db.user.update({ role: newUserRole }, { where: { Id: Id }}).then(function(User) {

    if (User) {
      console.log('\n' + "Users role successfully updated!" + '\n');
      res.send(Id)

    }
    else {
      console.log('\n' + "Something went wrong, please try again" + '\n');
      res.send(Id)

    } // end if/else

  }); // end User.update({ password: userPassword }, { where: { email: email }}).then(function(User)

}; // end exports.updateUser(req, res)


exports.removeUser = function(req, res) {
  console.log('Hello Waldo!');

  let Id = 0;

  Id = req.body.Id;

  console.log(Id);

  /*db.user.destroy({ Id: Id }, { where: { Id: Id }}).then(function(User) {

    if (User) {
      console.log('\n' + "User has been removed successfully!" + '\n');
      res.send(Id)

    }
    else {
      console.log('\n' + "Something went wrong, please try again." + '\n');
      res.send(Id)

    } // end if/else

  }); // end User.update({ password: userPassword }, { where: { email: email }}).then(function(User)*/

}; // end exports.updateUser(req, res)
