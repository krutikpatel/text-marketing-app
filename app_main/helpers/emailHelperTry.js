var nodemailer = require('nodemailer');
//var ses = require('nodemailer-ses-transport');

var logger = require('../logging/logModule');

var self = module.exports = {

    sendEmail : function (callback) {
/*
        var transport = nodemailer.createTransport(ses({
            accessKeyId: 'AKIAISCMTMJ5YJRLQCDA',//YOUR_AMAZON_KEY',
            secretAccessKey: 'AsT9SkNfotdw3mfMSAr/2YXtv5yNWVDoUB96gVbB7rBA' //YOUR_AMAZON_SECRET_KEY'
        }));
*/
        var smtpConfig = {
            host: 'email-smtp.us-west-2.amazonaws.com',
            port: 465,
            secure: true, // use SSL 
            auth: {
                user: 'AKIAISCMTMJ5YJRLQCDA',
                pass: 'AsT9SkNfotdw3mfMSAr/2YXtv5yNWVDoUB96gVbB7rBA'
            }
        };
        var transport = nodemailer.createTransport(smtpConfig);

/*
        var transport = nodemailer.createTransport({//'SMTP',{
            service: 'email-smtp.us-west-2.amazonaws.com',
            
            port: 587, // port for secure SMTP
            auth: {
                Username: 'AKIAISCMTMJ5YJRLQCDA', // Your email id
                Password: 'AsT9SkNfotdw3mfMSAr/2YXtv5yNWVDoUB96gVbB7rBA',
                
            },
            //tls: { rejectUnauthorized: false }
            secureConnection: false, // TLS requires secureConnection to be false
            tls: { ciphers: 'SSLv3' }

        });
*/

/*
        var transport = nodemailer.createTransport({
            host: "smtp.office365.com", // hostname
            secureConnection: false, // TLS requires secureConnection to be false
            port: 587, // port for secure SMTP
            auth: {
                user: 'testadmin@krutikpatel.com', // Your email id
                pass: '1Mavjibhai!' // Your password
            },
            tls: {
                ciphers:'SSLv3'
            }
        });
*/
        var text = 'Hello world from \n\n';

        var mailOptions = {
            from: 'testadmin@krutikpatel.com', // sender address
            to: 'meetkrutik@gmail.com', // list of receivers
            subject: 'Email Example', // Subject line
            text: text //, // plaintext body
            // html: '<b>Hello world ✔</b>' // You can choose to send an HTML body instead
        };

        transport.sendMail(mailOptions, function(error, info){
            if(error){
                console.log('### error from sending email :'+ error);
                callback(error);
            }else{
                console.log('Message sent: ' + info.response);
                callback(error);
            };
        });

    },

};
