var Users = require('../models/userModel');
var bodyParser = require('body-parser');//we installed via npm
var logger = require('../logging/logModule');
var config = require('../config/config');
var contactsDao = require('../helpers/contactsDao');
var TwilioClient = require('../twilio/twilioClient');
var userHelper = require('../helpers/userHelper');

var util = require('util');
var sendSinglMsgAsync = util.promisify(TwilioClient.sendSingleMessage);

module.exports = function(app){

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true}));

    app.post('/smsapi/subscribefromwidget', async function(req,res){

        var groupName = req.body.groupName;
        var userId = req.body._userId;
        var phoneNumber = req.body.number;
        var message = req.body.message;

        logger.info('[widgetSubscriptionController][post:/smsapi/subscribefromwidget] userId = '+ userId + 'groupName =  '+ groupName);

        //1. add to DB
        contactsDao.saveContact(phoneNumber,userId,groupName);

        try{
            //2. send them welcome message
            const remainingMessageBalance = await sendSinglMsgAsync(userId, phoneNumber, message);
            //update userDB with remaining balance
            await userHelper.updateUserMessageBalance(userId,remainingMessageBalance);
            res.status(200).send({
                success: true,
                message: 'Successfully subscribed', 
            });

        }catch(err){
            logger.error('[widgetSubscriptionController][post:/smsapi/subscribefromwidget] Error = '+err.message + ' \nStack = '+err.stack);
            res.status(200).send({
                success: true, 
                message: 'Successfully subscribed, but there was error in DB'
            });
        }

    });

}