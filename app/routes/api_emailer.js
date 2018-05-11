// Invoke 'strict' JavaScript mode
'use strict';

var nodemailer = require('nodemailer');


exports.pwd_emailer = function(req, res) {

  // let id = req.query.id;
  // let email = req.query.email;
  // let pwd = req.query.password;

  let id = req.params.Id;
  let email = req.params.email;
  let pwd = req.params.password;

  console.log(email);

  // create reusable transporter object using the default SMTP transport
  var transporter = nodemailer.createTransport({
    service: 'smtp-mail.outlook.com',
    auth: {
      user: 'youremail@gmail.com',
      pass: 'yourpassword'
    }
  });

  // setup e-mail data with unicode symbols
  var mailOptions = {
    from: 'youremail@gmail.com',
    to: email,
    subject: 'Sending Email using Node.js',
    text: 'That was easy!'
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });

}