var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var keywordsSchema = new Schema({ //define what our object/model class look like 
    keywordString: String,
    _userId : Schema.Types.ObjectId,
    group: String,
    responseMessage : String
});

// before saving
keywordsSchema.pre('save', function(next) {
    
    next();
});
// after saving
keywordsSchema.post('save', function(doc, next) {
    
    next();
});

// pre-delete
keywordsSchema.pre('remove', function(doc) {

});
// post-delete
keywordsSchema.post('remove', function(doc) {

});

var Keywords = mongoose.model('Keywords',keywordsSchema);

module.exports = Keywords;