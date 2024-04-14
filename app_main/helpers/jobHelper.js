var MsgJobs = require('../models/campaignJobModel');
var Campaigns = require('../models/campaignModel');
var Users = require('../models/userModel');
var Contacts = require('../models/contactsModel');

var userBalanceHelper = require('../braintreePayment/userBalanceHelper');
var config = require('../config/config');
var logger = require('../logging/logModule');
var activityLogHelper = require('../helpers/activityLogHelper');

var util = require('util');
var TwilioClient = require('../twilio/twilioClient');
var sendMessagesAsync = util.promisify(TwilioClient.sendMessages);

module.exports = {

    /*
    TODO: consider timezones in arithmetic
    -may be, convert both times in UTC and then do diff
    */
    runAllCampaign : async function(){
        const now = new Date();
        logger.info('[jobHelper][runAllCampaign] now time = '+now.toISOString());

        try{
            //1 find all jobs
            const jobs = await MsgJobs.find({});

            //2 Go thru all ScheduledJobs - in parallel
            jobs.forEach(async function(job,now){
                try{
                    //3 if this job is scheduled for now, otherwise skip.
                    var when = new Date(job.when);

                    if(now.getTime() - when.getTime() <= config.maxDiffMs && job.isDone == false){
                        logger.info('[jobHelper][runAllCampaign] message job qualified to run now, campaignId = '+job._campaignId + ' now time = '+ now.toISOString + ' , job.when = '+job.toISOString());
                        
                        //4 Send Messages using Campaign details
                        const campgn = await Campaigns.findById(job._campaignId);
                        const contacts = await Contacts.find({ _userId: job._userId, groups: campgn.groupName});

                        await self.sendMessages(contacts, job._userId, campgn.messageToSend, campgn.includeName,campgn.groupName);

                        //5 update campaign flag, once sending msg is done. - that is wait
                        await MsgJobs.findByIdAndUpdate(job._id, {isDone: true});

                        //6 update campaign as well
                        await Campaigns.findByIdAndUpdate(job._campaignId, {lastSent : job.when});
                    }
                }catch(err){
                    logger.error('[jobHelper][runAllCampaign inside single iteration of job] Error = '+err.message + ' \nStack = '+err.stack);
                }

            });

            //we dont wait till evey-job is done and do something, so we are good.
        }catch(err){
            logger.error('[jobHelper][runAllCampaign] Error = '+err.message + ' \nStack = '+err.stack);
        }
 
    },

    sendMessages : async function(contacts,userId,message,includeName,groupName){
        try{
            //validate if user has credit to send messages, thats why userId passed in param
            var remainingMessages = await userBalanceHelper.getNumberOfMessagesRemaining(userId);
            logger.info('[jobHelper][sendMessages] remainingMessages = '+remainingMessages);

            if(remainingMessages == 0)
            {
                throw new Error(config.errors.Err_Msg_Over);//'User message balance is over. Remaining messages = 0'};
            }

            //send messages
            const remainingMessageCount = await sendMessagesAsync(contacts, userId, remainingMessages, message,"",includeName);

            //update balance
            userHelper.updateUserMessageBalance(userId,remainingMessageCount);

            //log activity
            var activityMsg = 'Messages sent to Group : '+groupName;
            activityLogHelper.saveActivityLog(userId, config.Messages_Sent_ToGroup, activityMsg);

        }catch(err){
            //log and throw
            logger.error('[jobHelper][sendMessages] Error = '+err.message + ' \nStack = '+err.stack);
            throw err;
        }
    },
};
