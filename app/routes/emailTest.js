
const nodemailer = require('nodemailer');


const transport = nodemailer.createTransport( {
    service: 'smtp.gmail.com',
    auth: {
      user: 'vault.qa.automation@gmail.com',
      pass: 'vault@Fluke2018',
    },
    debug: true
});
transport.on('log', console.log);


const mailOptions = {
    from: 'vault.qa.automation@gmail.com',
    to: 'aron.norberg@fluke.com',
    subject: 'hello world!',
    html: 'hello world!',
};
//console.log(mailOptions);


transport.sendMail(mailOptions, (error, info) => {
  
    if (error) {
        console.log(error);
    }
    //console.log(`Message sent: ${info.response}`);
    console.log('Message sent!');

});
