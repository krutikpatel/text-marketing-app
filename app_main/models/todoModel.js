var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var todoSchema = new Schema({ //define what our object/model class look like 
    username: String,
    todo: String,
    isDone: Boolean,
    hasAttachment: Boolean
});

var Todos = mongoose.model('Todos',todoSchema);//Thus Todos becomes mongoose created model, and will have some useful methods on it

module.exports = Todos;