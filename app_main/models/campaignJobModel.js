var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var jobSchema = new Schema({ //define what our object/model class look like 
    _campaignId : Schema.Types.ObjectId,
    _userId : Schema.Types.ObjectId, //for future purposes
    when: { type: Date, default: Date.now },//do we store Date object or string ???
    isDone: { type: Boolean, default: false}
});

var MsgJobs = mongoose.model('MsgJobs',jobSchema);

module.exports = MsgJobs;
