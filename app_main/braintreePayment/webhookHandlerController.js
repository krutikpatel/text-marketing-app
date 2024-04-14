var braintree = require("braintree");
var braintreeHelper = require('./braintreeHelper');
var userBalanceHelper = require('./userBalanceHelper');
//var webhookHelper = require('./webhookHelper');
var logger = require('../logging/logModule');
var config = require('../config/config');

module.exports = function(app){

    app.post("/smsapi/subscription_charge_success", function (req, res) {
        
        logger.info('[webhookHandlerController:smsapi/subscription_charge_success]subscription_charge_success Webhook called');
        braintreeHelper.gateway.webhookNotification.parse(
            req.body.bt_signature,
            req.body.bt_payload,
            function (err, webhookNotification) {
                console.log('subscription object = ' +  JSON.stringify(webhookNotification.subscription, null, 4));
                
                logger.info('[webhookHandlerController:smsapi/subscription_charge_success] Webhook Received at ' + webhookNotification.timestamp + ' | and Kind =  ' + webhookNotification.kind);
                if(webhookNotification.kind == braintree.WebhookNotification.Kind.SubscriptionChargedSuccessfully)
                {
                    var custId = webhookNotification.subscription.transactions[0].customer.id;//Note 0th element has to be there
                    var planId = webhookNotification.subscription.planId;
                    var paidThruDate = webhookNotification.subscription.paidThroughDate;

                    logger.info('[webhookHandlerController:smsapi/subscription_charge_success] Webhook custid = '+ custId + ' , planId = '+planId +' , paidThruDate = '+ paidThruDate);

                    //update user with all info and new balance
                    userBalanceHelper.updateUserBalanceUponSubscriptionCharged(custId, planId, paidThruDate, function(err){
                        if(!err)
                        {
                            //send email : TODO
                        }
                        else
                        {
                            //send err email : TODO
                        }
                    });

                }
                res.status(200).send('success');
            }
        );

    });

    app.post("/smsapi/subscription_pastdue", function (req, res) {
        
        logger.info('[webhookHandlerController:smsapi/subscription_pastdue]subscription_pastdue Webhook called');
        braintreeHelper.gateway.webhookNotification.parse(
            req.body.bt_signature,
            req.body.bt_payload,
            function (err, webhookNotification) {
                console.log('subscription object = ' +  JSON.stringify(webhookNotification.subscription, null, 4));
                
                logger.info('[webhookHandlerController:smsapi/subscription_pastdue] Webhook Received at ' + webhookNotification.timestamp + ' | and Kind =  ' + webhookNotification.kind);
                if(webhookNotification.kind == braintree.WebhookNotification.Kind.SubscriptionWentPastDue)
                {
                    var custId = webhookNotification.subscription.transactions[0].customer.id;//Note 0th element has to be there

                    //update user with all info and new balance
                    userBalanceHelper.updateUserBalanceForSubscriptioPastDue(custId, function(err){
                        if(!err)
                        {
                            //send email : TODO
                        }
                        else
                        {
                            //send err email : TODO
                        }
                    });

                    res.status(200).send('success');
                }
            });

    });



};