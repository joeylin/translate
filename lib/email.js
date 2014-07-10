var nodemailer = require('nodemailer');
var config = require('../config/config.js');

// Create a SMTP transport object
var transport = nodemailer.createTransport("SMTP", {
    service: config.email.service,
    auth: {
        user: config.email.user,
        pass: config.email.pass
    },
    // debug: true
});

// Message object
var message = {
    // sender info
    from: 'Joeylin <331547274@qq.com>',
    to: '',
    // subject of the message
    subject: 'Thanks for registering',
    headers: {
        'X-Laziness-level': 1000
    },
    html: ''
};

console.log('SMTP configured');

module.exports = function(user) {
    if (typeof user === 'undefined')
        return;

    // Recipt list
    // message.to = user.email;
    message.to = 'joe.y.lin.2012@gmail.com';
    // HTML body
    message.html = '<p>Please click the following link to finish your registration:</p>' +
        '<a href=http://192.168.1.218:3000/register/validate?token=' + user.emailActiveCode.code + '>' +
        'http://192.168.1.218:3000/register/validate?token=' + user.emailActiveCode.code + '</a>';

    console.log('sending email');
    transport.sendMail(message, function(err) {
        if (err) {
            console.log(err.message);
            return;
        }
        console.log('Message sent successfully!');
    });
};