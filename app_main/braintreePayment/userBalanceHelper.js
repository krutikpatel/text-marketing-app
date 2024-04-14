var braintree = require("braintree");
var braintreeHelper = require('./braintreeHelper');
var braintreeGetHelper = require('./braintreeGetHelper');
var logger = require('../logging/logModule');
var config = require('../config/config');
var Users = require('../models/userModel');
var activityLogHelper = require('../helpers/activityLogHelper');

var self = module.exports = {

    getForwardableRemainingMeesagesFromUser: async function(userId){
        try{
            const user = await Users.findOne({id: userId});
            if(user && user.balance.billingCycleEndDate >= Date.now())
            {
                var msgs = user.balance.remainingMessagesThisMonthCycle;
                logger.info('[userBalanceHelper:getForwardableRemainingMeesagesFromUser] user billingCycleEndDate is in future, so forwarding messag balance of  '+msgs);
                return msgs;
            }
            else
            {
                logger.info('[userBalanceHelper:getForwardableRemainingMeesagesFromUser] not forwarding any number of messages');
                return 0;
            }

        }catch(err){
            logger.info('[userBalanceHelper:getForwardableRemainingMeesagesFromUser] There was DB error while finding user. err= '+err.message + ' \nStack = '+err.stack);
            return 0;
        }

    },

    //return 0 if user subscription is not active and there is no carryon balance
    getNumberOfMessagesRemaining: async function(userId){
        return 50;
        try{
            const user = await Users.findOne({_id: userId})//, function(err, user) {
            if (user==null) {
                logger.error('[userBalanceHelper:getNumberOfMessagesRemaining] user = null');
                return 0;
            }
            //check user subsc status
            try{
                const customer = await braintreeGetHelper.getCustomer(userId);//, function(err,customer){
                if(customer)
                {
                    logger.info('[userBalanceHelper:getNumberOfMessagesRemaining] successfully getting customer, customer = '+customer);
                    var lastPaymentMethodIndex = customer.paymentMethods.length -1;
                    var lastSubIndex = customer.paymentMethods[lastPaymentMethodIndex].subscriptions.length -1;
                    var subscId = customer.paymentMethods[lastPaymentMethodIndex].subscriptions[lastSubIndex].id;
                    if(customer.paymentMethods[lastPaymentMethodIndex].subscriptions[lastSubIndex].status == 'Active')
                    {
                        return user.balance.remainingMessagesThisMonthCycle;
                    }
                    else
                    {
                        logger.info('[userBalanceHelper:getNumberOfMessagesRemaining] customer subscription is not Active, id= '+subscId);
                        
                        //if billingCycleEnd date is in future return actual remaining count
                        //This will happen for cancelled subscriptions
                        if(user.balance.billingCycleEndDate >= Date.now())
                        {
                            logger.info('[userBalanceHelper:getNumberOfMessagesRemaining] customer subscription is not Active, BUT billingCycleEnd date is in future, so allowing to send messages');
                            return user.balance.remainingMessagesThisMonthCycle;
                        }    
                        else
                            return 0;
                    }
                } else{
                    logger.error('[userBalanceHelper:getNumberOfMessagesRemaining] customer was returned Null from braintreeGetHelper.getCustomer');
                    return 0;
                }
            
            }catch(err){
                logger.error('[userBalanceHelper:getNumberOfMessagesRemaining] error while getting customer from braintree db, customer is null ' + ' \nStack = '+err.stack);
                return 0;
            }
               
        }catch(err){
            logger.error('[userBalanceHelper:getNumberOfMessagesRemaining] error while getting customer from braintree db, customer is null ' + ' \nStack = '+err.stack);
            return 0;
        }
    },

    startTrialPeriodForUser : async function(userId){

        try{
            //update user with 1. trial flag = true, trialExpiry = 30 days from now, remainingMessages = 300
            var date30DaysFromNow = self.getThirtyDaysFromNow();
            const user = await Users.findByIdAndUpdate(userId, {
                                trialPeriod : {
                                    trialExpired : false,
                                    trialFinishDate: date30DaysFromNow,
                                },
                                balance : {
                                    remainingMessagesThisMonthCycle : config.trailMessages,
                                },
                            });
            logger.info('[userBalanceHelper:startTrialPeriodForUser] user trail period successfully started and updated');

        }catch(err){
            logger.error('[userBalanceHelper:startTrialPeriodForUser] error finding and updating/starting user trial period. error from DB = '+err  + ' \nStack = '+err.stack);
        }
    },

    endTrialPeriodForUser : async function(userId){
        try{
            //update user with 1. trial flag = false, trialExpiry = same, remainingMessages = 0
            const user = await Users.findByIdAndUpdate(userId, {
                                                    trialPeriod : {
                                                        trialExpired : true,
                                                    },
                                                    balance : {
                                                        remainingMessagesThisMonthCycle : 0,
                                                    },
                                                });
            logger.info('[userBalanceHelper:endTrialPeriodForUser] user trail period successfully ended and updated');
            return true;
        }catch(err){
            logger.error('[userBalanceHelper:endTrialPeriodForUser] error finding and ending user trial period. error from DB = '+err + ' \nStack = '+err.stack);
            return false;
        }
    },

    checkTrialPeriodExpiry : async function(user){
        var now = new Date();
        if(now > user.trialPeriod.trialFinishDate){
            logger.info('[userBalanceHelper:checkTrialPeriodExpiry] trial expiry greater than now, so calling end trial period');
            
            try{
                const success = await self.endTrialPeriodForUser(user._id);
                if(!success){
                    //retry
                    success = await self.endTrialPeriodForUser(user._id);
                }
                if(success)
                    logger.info('[userBalanceHelper:checkTrialPeriodExpiry] user trail period successfully ended and updated');
                else
                    logger.error('[userBalanceHelper:checkTrialPeriodExpiry] error finding and ending user trial period');
            }catch(err){
                logger.error('[userBalanceHelper:checkTrialPeriodExpiry] error finding and ending user trial period, trying again' + ' \nStack = '+err.stack);
            }
        }    
    },

    getThirtyDaysFromNow : function() {
        
        var now = new Date();
        //console.log("@@@ now = "+ now);
        now.setDate(now.getDate() + 30);//todo set date is v imp, otherwise it will just do 14+30 = 44
        //console.log("@@@ now+30 = "+ now);

        return now;
    },

    setEndTrialFlagForUser : function(userId){
        Users.findByIdAndUpdate(userId, {
                trialPeriod : {
                    trialExpired : true,
                },
            }, function(err, user){
                if(err)
                {
                    logger.error('[userBalanceHelper:setEndTrialFlagForUser] error finding and ending user trial period. error from DB = '+err);
                    //callback(err);
                }
                else{
                    logger.info('[userBalanceHelper:setEndTrialFlagForUser] user trail period successfully ended and updated');
                    //callback(null);
                }
        });
    },

    //to be called from webhook
    updateUserBalanceUponSubscriptionCharged : async function(userId, planId, paidThruDate,callback){
        
        const msgsToAdd = await self.getForwardableRemainingMeesagesFromUser(userId);
        var newMsgBalance = msgsToAdd + config.getPlanMessages(planId);
        
        try{
            //need current remainingMessagesThisMonthCycle , and cycle end - from subsc
            const user = await Users.findByIdAndUpdate(userId, {
                trialPeriod : {
                    trialExpired : true,
                },
                billing :{
                    plan : planId,
                },
                balance : {
                    remainingMessagesThisMonthCycle: newMsgBalance,
                    billingCycleEndDate : paidThruDate,
                }
            });
            logger.info('[userBalanceHelper:updateUserBalanceUponSubscriptionCharged] user balance updated, newMsgBalance = '+newMsgBalance);
            
            var activityMsg = 'Payment successuflly processed for plan :'+planId +'. Thank you!';
            activityLogHelper.saveActivityLog(userId, config.Payment_Processed, activityMsg);
            return true;

        } catch(err){
            logger.error('[userBalanceHelper:updateUserBalanceUponSubscriptionCharged] error finding and updating user balance. error from DB = '+err + ' \nStack = '+err.stack);
            return false;
        }
    },

    updateUserBalanceForSubscriptioPastDue : async function(userId){
        try{
            const user = await Users.findByIdAndUpdate(userId, {
                    trialPeriod : {
                        trialExpired : true,
                    },
                    balance : {
                        remainingMessagesThisMonthCycle: 0,
                    }
            });
            logger.info('[userBalanceHelper:updateUserBalanceForSubscriptioPastDue] user balance updated');
            return true;
        }catch(err){
            logger.error('[userBalanceHelper:updateUserBalanceForSubscriptioPastDue] error finding and updating user balance. error from DB = '+err + ' \nStack = '+err.stack);
            return false;
        }
    },

};