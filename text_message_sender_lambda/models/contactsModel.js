var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var contactsSchema = new Schema({ //define what our object/model class look like 
    number: String,
    _userId : Schema.Types.ObjectId,
    groups: [String],
    added: { type: Date, default: Date.now() },
    firstName : String,
    lastName: String,
    email: String
});

// before saving
contactsSchema.pre('save', function(next) {
    
    next();
});
// after saving
contactsSchema.post('save', function(doc, next) {
    
    next();
});

// pre-delete
contactsSchema.pre('remove', function(doc) {

});
// post-delete
contactsSchema.post('remove', function(doc) {

});

var Contacts = mongoose.model('Contacts',contactsSchema);

module.exports = Contacts;