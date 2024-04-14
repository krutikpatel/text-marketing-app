var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var activityLogSchema = new Schema({ //define what our object/model class look like 
    _userId : Schema.Types.ObjectId,
    type: String,
    message: String,
    time : Date, //Time of activity
});

// before saving
activityLogSchema.pre('save', function(next) {
    
    next();
});
// after saving
activityLogSchema.post('save', function(doc, next) {
    
    next();
});

// pre-delete
activityLogSchema.pre('remove', function(doc) {

});
// post-delete
activityLogSchema.post('remove', function(doc) {

});

var ActivityLog = mongoose.model('ActivityLog',activityLogSchema);

module.exports = ActivityLog;