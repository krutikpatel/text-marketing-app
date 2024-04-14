var twilio = require('twilio');
var config = require('../config/config');
var Contacts = require('../models/contactsModel');
var userBalanceHelper = require('../braintreePayment/userBalanceHelper');
var logger = require('../logging/logModule');

// create an authenticated Twilio REST API client
var client = twilio(config.TWILIO_ACCOUNT_SID, config.TWILIO_AUTH_TOKEN);

//module.exports = function(){
module.exports = {

    /*
    Ref: https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2
    ISO contry codes
    */
    validateCountryCode : function(country){
        logger.info('[twilioClient][validateCountryCode] country passed = '+ country);
        if(country === 'US' ||
            country === 'GB'){
                return true;
        }else
            return false;


    },

    sendSingleMessage: function (userId, number, message, callback){//callback null if success
        var url = null;

        //1. check balance
        var remainingMessages = userBalanceHelper.getNumberOfMessagesRemaining(userId);
        if(remainingMessages == 0)
        {
           callback({message: config.errors.Err_Msg_Over},remainingMessages);
        }
        
        //2. send message
        // Create options to send the message
        var options = {
            to: number,
            from: config.TWILIO_NUMBER,
            body: message
        };

        // Include media URL if one was given for MMS
        if (url) options.mediaUrl = url;

        // Send the message!
        client.sendMessage(options, function(err, response) {
            if (err) {
                logger.info('[twilioClient][sendSingleMessage] error from Twilio = '+err.message +' and err obj = ' ,{err: err});
            } else {
                //TODO - comment this log message, because there will be thousands of these
                //logger.info('[twilioClient][sendSingleMessage] Message sent');    
            }
        });
        //reduce one msg
        remainingMessages = remainingMessages -1;
        callback(null,remainingMessages);

    },

    // Send messages to all contacts via Twilio
    /*
    Nodejs style callback.
    1st param: err
    2nd param: our value
    */
    sendMessages : function (contacts, userId, remainingMessages, message, url, includeName, callback) {

        logger.info('[twilioClient][sendMessages] ',{message: message, url : url});

        //var remainingMessages = userBalanceHelper.getNumberOfMessagesRemaining(userId);
        if(remainingMessages == 0)
        {
            callback(null,0);
        }

        contacts.forEach(function(contact) {
            
            //prepare message
            if(includeName){
                var firstName = "";
                var lastName = "";
                if(contact.firstName)
                    firstName = contact.firstName;
                if(contact.lastName)
                    lastName = contact.lastName;
                    
                var msgPrefix = 'Hi '+ firstName + ' ' + lastName + ', ';
                message = msgPrefix + message;
                //logger.info("############# - final msg =  : "+message);
            }
            
            // Create options to send the message
            var options = {
                to: contact.number,
                from: config.TWILIO_NUMBER,
                body: message
            };
            
            // Include media URL if one was given for MMS
            if (url) options.mediaUrl = url;

            //logger.info("############# - sending msg for : "+contact.number);
            // Send the message!
            client.sendMessage(options, function(err, response,contact) {
                if (err) {
                    // Just log it for now
                    logger.info('[twilioClient][sendMessages] error from Twilio = '+err.message +' and err obj = ' ,{err: err});
                    //console.error(err);
                } else {
                    
                    //knote - again async behav, contact object not available here, EVENTHOUGH IF WE PASS
                    logger.info('[twilioClient][sendMessages] Message sent');
                    //console.log('@@ Twilio response = '+response); response does not have much useful info
                }
            });

            //reduce one msg
            remainingMessages = remainingMessages -1;
            if(remainingMessages == 0)
            {
                //return. stop sending messages
                logger.info('[twilioClient][sendMessages] remainingMessages = 0 , cant send anymore messages');
                callback({message: config.errors.Err_Msg_Over},remainingMessages);                
            }
        });

        // Don't wait on success/failure, just indicate all messages have been
        // queued for delivery
        logger.info('[twilioClient][sendMessages] All Message sent done.');
        //callback.call(this);
        callback(null,remainingMessages);
    },

    /*
    Way to use:
        TwilioClient.queryAvailableNumber(function(number,err){
                if(!err)
                    console.log('@@@@@@@@@@@@ number form twilio back in caller fn via callback:'+ number);
        });
    */
    //Tested and it works
    queryAndGetAvailableNumber : function(callback){

        logger.info('[twilioClient][queryAvailableNumber] called');

            /* Pass area code for specific area num
            client.availablePhoneNumbers("US").local.list({
            areaCode: "510"
            },*/
        //1 query available number
        client.availablePhoneNumbers("US").local.list(  //no passing area code, gives random number
         function(err, data) {
            if(err)
            {
                logger.error('[twilioClient][queryAvailableNumber] error from twilio.availablePhoneNumbers :'+ err);
                return;
            }    

            var number = data.availablePhoneNumbers[0];
            logger.info('[twilioClient][queryAvailableNumber] available number returned form twilio :'+ number.phone_number);

            if(config.env === 'prod')//then only buy number
            {    
                //2 Purchase first number
                client.incomingPhoneNumbers.create({
                    phoneNumber: number.phone_number
                }, function(err, purchasedNumber) {
                    if(err)
                    {
                        logger.error('[twilioClient][queryAvailableNumber] error purchasing number from twilio.incomingPhoneNumbers.create :'+ err);
                        callback(err,null);
                        return;
                    }
                    logger.info('[twilioClient][queryAvailableNumber] purchasedNumber.sid ='+ purchasedNumber.sid);
                    
                    //Ref: incomingPhoneNumbers Object :  https://www.twilio.com/docs/api/rest/incoming-phone-numbers
                    //return number : number.phone_number and number.sid are useful
                    callback(null,purchasedNumber);
                });
            }
            else
            {   
                //return number
                callback(null,{number : number.phoneNumber,
                                sid: '' // dummy
                }); 
            }
        });

    },

    addIncomingMessageWebhookToNumber: function(number,sid,callback){
        
        var webhookUrl = 'http://eb3e303c.ngrok.io/messageFromTwilioWebhook';
        client.incomingPhoneNumbers(sid).update({
            //voiceUrl: "http://demo.twilio.com/docs/voice.xml",
            smsUrl: webhookUrl
        }, function(err, number) {
            if(err){
                logger.error('[twilioClient][addIncomingMessageWebhookToNumber] error while updating sms webhook for number-sid: '+ sid+ ', err ='+ err);
                callback(err);
            }
            else{
                //console.log(number);
                logger.info('[twilioClient][addIncomingMessageWebhookToNumber] successfully updated SMS webhook for number:'+ number.phone_number + ' , webhook = '+ webhookUrl);
                callback(null);
            }

        });

    },
};


/*
Note:
caller can call send message as:
    Subscriber.sendMessage(docs, message, imageUrl, function(err) {
        if (err) {
            request.flash('errors', err.message);
        } else {
            request.flash('successes', 'Messages on their way!');
        }

        
    });

*/