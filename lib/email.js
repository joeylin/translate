var nodemailer = require('nodemailer');
var config = require('../config/config.js');

// Create a SMTP transport object
var transport = nodemailer.createTransport({
    service: config.email.service,
    auth: {
        user: config.email.user,
        pass: config.email.pass
    }
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

module.exports = function(user, feedback) {
    if (typeof user === 'undefined') {
        return;
    }
        
    if (feedback) {
        message.subject = 'Feedback';
        message.to = 'joe.y.lin.2012@gmail.com';
        message.html = '<p>用户: ' + user.name + '</p>' + 
            '<p>邮箱: ' + user.email + '</p>' +
            '<p>' + user.content + '</p>';
    } else {
        // Recipt list
        message.to = user.email;

        // HTML body
        message.html = '<p>请点击以下链接来完成注册:</p>' +
            '<a href=' + config.host + '/register/validate?token=' + user.emailActiveCode.code + '>' +
            config.host + '/register/validate?token=' + user.emailActiveCode.code + '</a>';

    }
        
    console.log('sending email');
    transport.sendMail(message, function(err) {
        if (err) {
            console.log(err.message);
            return;
        }
        console.log('Message sent successfully!');
    });
};