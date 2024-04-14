var Todos = require('../models/todoModel');
var Users = require('../models/userModel');
//note:
//we can use jsonGenerator module to generate seed data

module.exports = function(app){

    app.get('/api/setupTodos', function(req,res){

        //seed database
        var starterTodos = [
            {
                username : 'krutik',
                todo : 'dgfgd krutik',
                isDone: false,
                hasAttachment: false
            },
            {
                username : 'pratik',
                todo : 'dgfgd pratik',
                isDone: false,
                hasAttachment: false
            },
            {
                username : 'khushboo',
                todo : 'dgfgd diku',
                isDone: false,
                hasAttachment: false
            }
        ];

        //Todos is mogoose created model
        Todos.create(starterTodos, function(err,results){
            res.send(results);
        });

        //console.log('inside get controller'); // this line will still execute eventhough after res.send
    });
    
    /////

    app.get('/smsApp/setupUsers', function(req,res){

        //seed database
        var starterUsers = [
            {
                username : 'krutik',
                groups : ['default']
            }
        ];

        //Todos is mogoose created model
        Users.create(starterUsers, function(err,results){
            res.send(results);
            console.log('user creation done'); 
        });

        //console.log('inside get controller'); // this line will still execute eventhough after res.send
    });

    /////
    app.get('/smsApp/setupGroups', function(req,res){

        //seed database
        var starterGroups = [
            {
                username : 'krutik',
                groups : ['default']
            }
        ];

        //Todos is mogoose created model
        Users.create(starterUsers, function(err,results){
            res.send(results);
            console.log('user creation done'); 
        });

        //console.log('inside get controller'); // this line will still execute eventhough after res.send
    });

}