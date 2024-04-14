var ActivityLog = require('../models/activityLogModel');
//var Users = require('../models/userModel');
var logger = require('../logging/logModule');
var config = require('../config/config');

module.exports = {

    saveActivityLog : async function(userId, activityType, msg){

        logger.info('[ActivityLogHelper: saveActivityLog] ');

        var newActivity = new ActivityLog({
            _userId : userId,
            type: activityType,
            message: msg,
            time : Date.now(),
        });

        try{
            await newActivity.save();
            logger.info('[ActivityLogHelper: saveActivityLog] successfully saved new ActivityLog.');
        } catch(err) {
            logger.error('[ActivityLogHelper: saveActivityLog] error saving new ActivityLog. error from DB = '+err.message  + ' \nStack = '+err.stack);
        }
    },

    getActivitiesByUserId : async function(userId,callback){
        
        try{
            const activities = await ActivityLog.find({_userId: userid});
            logger.info('[ActivityLogHelper:getActivitiesByUserId] Activities for userId = '+userId+' , no. of activities found =  '+activities.length);
            return activities;
        } catch(err){
            logger.error('[ActivityLogHelper:getActivitiesByUserId] error finding Activities By UserId. error from DB = '+err.message + ' \nStack = '+err.stack);
            throw(err);
        }
    },
    
};