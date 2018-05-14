// Invoke 'strict' JavaScript mode
'use strict';

const bodyParser = require("body-parser");
const nodemailer = require('nodemailer');

exports.pwd_emailer = function(req, res) {

  // let email = req.query.email;
  let email = req.body.email;

  //console.log(email);

  //var transporter = nodemailer.createTransport('smtps://user%40gmail.com:pass@smtp.gmail.com');


  // create reusable transporter object using the default SMTP transport
  var transporter = nodemailer.createTransport( {
    host: 'smtp.gmail.com',
    auth: {
      user: 'vault.qa.automation@gmail.com',
      pass: 'vault@Fluke2018'
    },
    tls: { 
      rejectUnauthorized: false 
    },
    proxy: 'socks5://localhost:1080/'

  });


  // create reusable transporter object using the default SMTP transport
  /*var transporter = nodemailer.createTransport( {
    host: 'smtp.gmail.com',
    port:465,
    path: '/',
    method: 'POST',
    secure: true,
    headers: {
      'Content-Type': 'text/html',
      'Content-Length': Buffer.byteLength("")
    }, 
    auth: {
      user: 'vault.qa.automation@gmail.com',
      pass: 'vault@Fluke2018'
    },
    tls: { 
      rejectUnauthorized: false 
    }

  });*/
  

  // setup e-mail data with unicode symbols
  var mailOptions = {
    from: '"Vault password reset" <vault.qa.automation@gmail.com>',
    to: email,
    subject: 'Sending Email using Node.js',
    text: 'That was easy!'
  };


  // verify connection configuration
  /*transporter.verify(function(error, success) {
    if (error) {
      console.log(error);
    } else {
      console.log('Server is ready to take our messages');
    }
  });*/

  
  // send mail with defined transport object
  transporter.sendMail(mailOptions, function(error, info){
    console.log(mailOptions);
    //console.log("SENDING");

    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
    
  });

} // end exports.pwd_emailer = function(req, res)