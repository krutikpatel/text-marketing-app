var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var campaignSchema = new Schema({ //define what our object/model class look like 
    campaignName: String,
    _userId : Schema.Types.ObjectId,
    groupName : String, //If groupname changes later, this wont be changed.
    note: String,
    messageToSend : String,
    includeName: { type: Boolean, default: false},
    lastSent: Date
});

var Campaigns = mongoose.model('Campaigns',campaignSchema);

module.exports = Campaigns;