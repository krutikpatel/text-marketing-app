var TwilioClient = require('../twilio/twilioClient');
var bodyParser = require('body-parser');//we installed via npm
var logger = require('../logging/logModule');

var Groups = require('../models/groupModel');
var Users = require('../models/userModel');
var Contacts = require('../models/contactsModel');
var userBalanceHelper = require('../braintreePayment/userBalanceHelper');
var config = require('../config/config');
var activityLogHelper = require('../helpers/activityLogHelper');
var userHelper = require('../helpers/userHelper');

module.exports = function(app){

    /*
    -STOP and START are already provided by Twilio, so i dont have to do anything
    -This webhook will also come for QR code subscription requests
    */
    app.post('/messageFromTwilioWebhook', function(req,res) {

        var msg = req.body.Body;
        var from = req.body.From;
        var to = req.body.To;

        console.log(msg);
        console.log(from);
        console.log(to);

        //find user by "to" phone number
            //might have to trunkate +1
        //take action for that user
        //1. Based on keyword match, add user to particular group

        //
        Users.find({ email: 'meetkrutik@gmail.com'}, function(err, user){
            if(err)
            {
                logger.error('[messageFromTwilioWebhook][post:messageFromTwilioWebhook] error finding user with given email. error from DB = '+err);
                res.status(500).send({
                    success: false,
                    message: 'There was problem with getting info from db'
                });
            }

            //console.log(user);
            TwilioClient.addIncomingMessageWebhookToNumber(null,'PN5c40336cdb75c5fe6dfab6c0f62b3053',function(err){
                //if err - 
            });

            res.status(200).send({
            });
        });

    });
}