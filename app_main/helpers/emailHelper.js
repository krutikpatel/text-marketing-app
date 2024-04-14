// sending email using sendgrid api
// using SendGrid's v3 Node.js Library
// https://github.com/sendgrid/sendgrid-nodejs
var helper = require('sendgrid').mail;
var config = require('../config/config');
var logger = require('../logging/logModule');
var sg = require('sendgrid')(config.SENDGRID_EMAIL_API_KEY);

var self = module.exports = {
    sendTokenEmail : async function (resetLink) {
        var fromEmail = new helper.Email('admin@krutikpatel.com');
        var toEmail = new helper.Email('meetkrutik@gmail.com');
        var subject = 'Message from Kashiba Solutions';
        var content = new helper.Content('text/plain', //'and easy to do anywhere, even with Node.js. \
            'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
            'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
            resetLink + '\n\n' +
            'If you did not request this, please ignore this email and your password will remain unchanged.\n');
                       
        var mail = new helper.Mail(fromEmail, subject, toEmail, content);


        var request = sg.emptyRequest({
            method: 'POST',
            path: '/v3/mail/send',
            body: mail.toJSON()
        });

        sg.API(request, function (error, response) {
            if (error) {
                console.log('Error response received');
            }
            console.log(response.statusCode);
            console.log(response.body);
            console.log(response.headers);
        });

    },

};



