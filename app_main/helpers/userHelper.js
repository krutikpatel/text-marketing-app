// billing helpers
// twilio helpers for user related stuff
var Users = require('../models/userModel');
var logger = require('../logging/logModule');
var config = require('../config/config');

module.exports = {

    updateUserMessageBalance : async function(userId, remainingMessages){

        //update user object in db with remainingMessages
        try{
            const user = await Users.findByIdAndUpdate(userId, {
                            balance : {remainingMessagesThisMonthCycle: remainingMessages}} );
            logger.info('[userHelper:updateUserMessageBalance] user remaining messages successfully updated');
        }catch(err){
            
            logger.error('[userHelper:updateUserMessageBalance] First attempt : error finding and updating user remaining messages. error from DB = '+err + ', trying again..' + ' \nStack = '+err.stack);
            
            //try one more time
            try{
                const user = await Users.findByIdAndUpdate(userId, {
                                balance : {remainingMessagesThisMonthCycle: remainingMessages}} );
                logger.info('[userHelper:updateUserMessageBalance] user remaining messages successfully updated');
            }catch(err){
                logger.error('[userHelper:updateUserMessageBalance] Second attempt : error finding and updating user remaining messages. error from DB = '+err + ' \nStack = '+err.stack);
                throw(err);
            }
        }

    }

};