var schedule = require('node-schedule');
var jobHelper = require('./jobHelper');
var logger = require('../logging/logModule');

module.exports = {

    testSchedule : function(){
        var j = schedule.scheduleJob('23 * * * *', function(){//23rd min of every hour
            console.log('The answer to life, the universe, and everything!');
        });
    },

    scheduleMessageJob : function(){
        var sched = schedule.scheduleJob('00 * * * *', jobHelper.runAllCampaign);//TODO : does it actually run every hour
    }
};

