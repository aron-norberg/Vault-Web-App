'use strict';

const db = require('../../config/sequelize');
const Sequelize = require('sequelize');

exports.ownership_display = function(req, res) {
    let firstName = req.user.firstname;

    db.sequelize.query('select * from Result where Owner is not NULL;').then(results => {
        db.sequelize.query('select firstname, lastname, id from User;').then(theNames => {

            results = results[0];
            theNames = theNames[0];
           // console.log(theNames[1].firstname);
        
            res.render('owner_page', {
                title: 'Ownership Documentation ',
                results: results,
                user: req.user,
                theNames: theNames
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



