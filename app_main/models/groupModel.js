var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var groupSchema = new Schema({ //define what our object/model class look like 
    groupName: String,
    _userId : Schema.Types.ObjectId,
    note: String,
    totalContacts: Number,
    lastSent: Date
});

// before saving
groupSchema.pre('save', function(next) {
    //console.log('group pre middleware !!!!!!!!!!!!!!!!!!1');
    next();
});

// after saving
groupSchema.post('save', function(doc, next) {
    //console.log('group post middleware ******************');
    next();
});

/* after saving
    Note: if this middleware takes error as parameter, this will be called only if there is an error
    Handler **must** take 3 parameters: the error that occurred, the document
    in question, and the `next()` function
*/
groupSchema.post('save', function(error, doc, next) {
  /*
    if (error.name === 'MongoError' && error.code === 11000) {
    next(new Error('There was a duplicate key error'));
    } else {
    next(error);
    }
*/
    console.log('group post error middleware ******************');
    next();
});

// pre-delete
groupSchema.pre('remove', function(doc) {

});
// post-delete
groupSchema.post('remove', function(doc) {

});

var Groups = mongoose.model('Groups',groupSchema);

module.exports = Groups;