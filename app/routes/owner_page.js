'use strict';

const db = require('../../config/sequelize');
const Sequelize = require('sequelize');

exports.ownership_display = function(req, res) {
    
    let firstName = req.user.firstname;
    let selectedUser = req.query.userName;
    let phrase = "";
    let displayName = "";

    if(selectedUser == null){
        phrase = " Owner = '" +firstName +"';";
        displayName = firstName;
    }
    else{
        phrase = " Owner = '" + selectedUser + "';";
        displayName = selectedUser;
    }


    db.sequelize.query('select * from Result where' + phrase).then(results => {
        db.sequelize.query('select * from User;').then(users => {

            results = results[0];
            users = users[0];
            res.render('owner_page', {
                title: 'Ownership Notes ',
                results: results,
                user: req.user,
                users: users,
                displayName: displayName
            });
            return null;
    
        }).catch(function(err) {
        console.log('error: ' + err);
        return err;
        })
              
        return null;
        
    }).catch(function(err) {
    console.log('error: ' + err);
    return err;
    })
  
}



