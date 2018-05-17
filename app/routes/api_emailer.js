// Invoke 'strict' JavaScript mode
'use strict';

//const bodyParser = require("body-parser");
const nodemailer = require('nodemailer');
const xoauth2 = require('xoauth2');

exports.pwd_emailer = function(req, res) {

  // let email = req.query.email; //GET method
  let email = req.body.email; //POST method
  //console.log(email);

  //var transporter = nodemailer.createTransport('smtps://vault.qa.automation@gmail.com:vault@Fluke2018@smtp.gmail.com');
  
  // create reusable transporter object using the default SMTP transport
  var transporter = nodemailer.createTransport( {
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // use SSL
    auth: {
      user: 'vault.qa.automation@gmail.com',
      pass: 'vault@Fluke2018'
    },
    tls: { 
      rejectUnauthorized: false
    }
    
  });


  /*var transporter = nodemailer.createTransport( {
    service: 'smtp.gmail.com',
    auth: {
      type: 'OAuth2',
      user: 'vault.qa.automation@gmail.com',
      clientId: '996457250318-bksvs91m9vkm16j1n4ntcp0vgr4at75g.apps.googleusercontent.com',
      clientSecret: 'U-SnGN035lKJlVRZbnLHw9Q0',
      refreshToken: '1/ssANI4mCzScXSZ-2VWo6P208GFkrpO5mRcqMMD77--Q'
    }
  });*/


  // setup e-mail data with unicode symbols
  var mailOptions = {
    from: '"Vault password reset" <vault.qa.automation@gmail.com>',
    to: email,
    subject: 'Password reset link from Vault',
    //text: 'Please click on the link below to get access to Vault\'s reset password page.',
    html: '<p>Please click <a href="http://ec2-35-168-52-214.compute-1.amazonaws.com/reset_password">reset password</a> access to Vault\'s reset password page.</p>'

  };
  

  // send mail with defined transport object
  transporter.sendMail(mailOptions, function(error, info){
    console.log(mailOptions);
    //console.log("SENDING");

    if (error) {
      console.log(error);
    }
    else {
      console.log('Email sent: ' + info.response);
      res.redirect('/login');
    }
    
  });

} // end exports.pwd_emailer = function(req, res)
