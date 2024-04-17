//fetching env variables first thing to do
require("./config/env.config");

var express = require('express');
var app = express();
var mongoose = require('mongoose');
var config = require('./config/config');
var bodyParser = require('body-parser');//we installed via npm
var https = require('https');
var http = require('http');
var fs = require('fs');
var flash = require('express-flash');
var session = require('express-session')
var swaggerJSDoc = require('swagger-jsdoc');

//controllers
var setupcontroller = require('./controllers/setupController');
var userController = require('./controllers/userController');
var groupController = require('./controllers/groupController');
var contactController = require('./controllers/contactController');
var signupController = require('./controllers/signupController');
var loginController = require('./controllers/loginController');
var fileController = require('./controllers/fileController');
var braintreeController = require('./braintreePayment/braintreeController');
var webhookHandlerController = require('./braintreePayment/webhookHandlerController');
var widgetSubscriptionController = require('./controllers/widgetSubscriptionController');
var twilioController = require('./controllers/twilioController');
var keywordController = require('./controllers/keywordController');
var campaignController = require('./controllers/campaignController');

//middleware
var geoip = require('./middleware/geoip');

// misc
var cronScheduler = require('./helpers/cronScheduler')

//======= Swagger Setup =================================//
var hostString = '';
if (process.env.NODE_ENV == 'production')
	//hostString = 'https://textraction.herokuapp.com';
  hostString= 'localhost:80';
else
	hostString= 'localhost:8080';//AWS needs 80

// swagger definition
var swaggerDefinition = {
  info: {
    title: 'Node Swagger API',
    version: '1.0.0',
    description: 'Demonstrating how to describe a RESTful API with Swagger',
  },

  host: hostString,
  basePath: '/',
};

// options for the swagger docs
var options = {
  // import swaggerDefinitions
  swaggerDefinition: swaggerDefinition,
  // path to the API docs
  apis: ['./controllers/*.js', './braintreePayment/braintreeController.js'],
};

// initialize swagger-jsdoc
var swaggerSpec = swaggerJSDoc(options);

// serve swagger
app.get('/swagger.json', function(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

//======= End Swagger Setup ========================================//

//authentication
var passport	= require('passport');
//var morgan      = require('morgan');

//log
var logger = require('./logging/logModule');
logger.info('Jay Swaminarayan, First log ! :D ');
logger.info('<<<>>>> config.TWILIO_ACCOUNT_SID='+config.TWILIO_ACCOUNT_SID);

//app.use('/assets', express.static(__dirname + '/public'));
app.use(express.static(__dirname + "/")); //Note: usually it will be /public --> thats where all ui will be hosted

//adding jade - does not affect angulat/static file serving
app.set('view engine', 'pug');

//setup flash message usage. Flash needs sessions
//app.use(express.cookieParser('keyboard cat'));
//app.use(session({ cookie: { maxAge: 60000 }}));
/*
Note on flash messages: they use cookie
-for it to work, cookie must be able to store in browser, if cookie option is secure, but connection is not https, 
cookie will not be able to store, thus you wont see flash-messages
Ref: https://stackoverflow.com/questions/29310650/express-flash-messages-with-passport-doesnt-work
*/
app.use(session({
  secret: 'JaySwaminarayanJaySwaminarayan',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false,//false for localhost
            maxAge: 60000 
          }
}))
app.use(flash());

//NOTE: to run app: nodemon app.js
var port = config.port;


// DB
mongoose.Promise = global.Promise; // Ref: https://stackoverflow.com/questions/38138445/node3341-deprecationwarning-mongoose-mpromise
mongoose.connect(config.getDbConnectionString());
console.log("############### => getDbConnectionString = "+config.getDbConnectionString());
// pass passport for configuration
require('./config/passport')(passport);

// get our request parameters
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// express log
//app.use(morgan('dev'));
app.use(require('morgan')("combined",{ "stream": logger.stream }));


// Use the passport package in our application
app.use(passport.initialize());

/* TODO- it just works but dont know why useful or to add  
https://stackoverflow.com/questions/28305120/differences-between-express-router-and-app-get

var router = express.Router();
app.use(router);
*/

//middleware experiment
//app.use('/forgot',geoip.findLocation);

logger.info('Jay Swaminarayan, First log ! :D ');
logger.info('creating controllers');
logger.info('env var KRUTIK='+config.KRUTIK);

//
var validator = require('validator');
var d = '2017-04-21T06:54:34.995Z';
var now = new Date();
var d2 = Date.parse(d);
console.log('==='+now.toString());
console.log('==='+d2.toString());//This prints mili-seconds

console.log('==='+now.toISOString());

var d3 = new Date(d);//can create date object from ISO string as well
console.log('@@@ '+d3.toISOString());//this gives back same ISO string

var date1 = new Date('2017-04-21T00:00:00.005Z');
var date2 = new Date('2017-04-21T00:00:01.000Z');
var diff = date2.getTime() - date1.getTime();
console.log("@@@@@@@@ date2 - date1 ="+ diff);

cronScheduler.testSchedule();
cronScheduler.scheduleMessageJob();
/*
if(!validator.isISO8601(now.toString())){
    console.log("################# not valid");
}
else{
  console.log("################# is valid!");
}
*/
/*
if(now > d2){ //This comaprision works !
  console.log("################# now bigger");
}else{
  console.log("################# d2 bigger - wrong");
}
*/
//
//
//Controllers


signupController(app);
loginController(app);
setupcontroller(app);//it adds controller method to app
userController(app);
groupController(app);
contactController(app);
fileController(app);
braintreeController(app);
webhookHandlerController(app);
widgetSubscriptionController(app);
twilioController(app);
keywordController(app);
campaignController(app);
//start server
//app.listen(port);
http.createServer(app).listen(port);
/*
To enable https on express:
https://stackoverflow.com/questions/11744975/enabling-https-on-express-js

https.createServer({
      key: fs.readFileSync('./ssl/privatekey.key'),
      cert: fs.readFileSync('./ssl/certificate.crt'),
      timeout: 120000
    }, app).listen(port);
*/


