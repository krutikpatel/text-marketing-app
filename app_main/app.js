//fetching env variables first thing to do
require("./config/env.config");

var express = require('express');
var session = require('express-session');
var passport	= require('passport');
var csrf = require('csurf');
var app = express();
var mongoose = require('mongoose');
var config = require('./config/config');
var bodyParser = require('body-parser');//we installed via npm
const cookieParser = require('cookie-parser');  // Import cookie-parser
var https = require('https');
var http = require('http');
var fs = require('fs');
var path = require('path');
var flash = require('express-flash');
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
var authRouter = require('./routes/auth2');

//middleware
var geoip = require('./middleware/geoip');

// misc
var cronScheduler = require('./helpers/cronScheduler')

//======= Swagger Setup =================================//
var hostString = '';
/*
if (process.env.NODE_ENV == 'production')
	//hostString = 'https://textraction.herokuapp.com';
  hostString= 'localhost:80';
else

	hostString= 'localhost:8080';//AWS needs 80

hostString= 'localhost:3000';
console.log('process.env.NODE_ENV = '+process.env.NODE_ENV);
//
// swagger definition
var swaggerDefinition = {
  info: {
    title: 'Node Swagger API',
    version: '1.0.0',
    description: 'Demonstrating how to describe a RESTful API with Swagger',
  },

  host: hostString,
  basePath: '/swagger',
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
*/
//======= End Swagger Setup ========================================//

//authentication

//var morgan      = require('morgan');

//log
var logger = require('./logging/logModule');
logger.info('Jay Swaminarayan, First log ! :D ');
logger.info('<<<>>>> config.TWILIO_ACCOUNT_SID='+config.TWILIO_ACCOUNT_SID);

app.use(bodyParser.json());
app.use(cookieParser());  // Use cookie-parser middleware

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//app.use('/assets', express.static(__dirname + '/public'));
//app.use(express.static(__dirname + "/")); //Note: usually it will be /public --> thats where all ui will be hosted
app.use(express.static(path.join(__dirname, 'public')));

//imp - do it before other middleware code
app.use(session({
  secret: 'JaySwaminarayanJaySwaminarayan', // replace with your own secret
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: false,  // set to true if your application is served over HTTPS
    maxAge: 60000
   } 
}));

app.use('/', authRouter);

//app.use(csrf());
/*
app.use(passport.authenticate('session'));
app.use(function(req, res, next) {
  var msgs = req.session.messages || [];
  res.locals.messages = msgs;
  res.locals.hasMessages = !! msgs.length;
  req.session.messages = [];
  next();
});
app.use(passport.session());
*/
/*
app.use(function(req, res, next) {
  res.locals.csrfToken = req.csrfToken();
  next();
});
*/
//app.use('/login', authRouter);
/*
app.use(csrf());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// get our request parameters
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(function(req, res, next) {
  var msgs = req.session.messages || [];
  res.locals.messages = msgs;
  res.locals.hasMessages = !! msgs.length;
  req.session.messages = [];
  next();
});
app.use(function(req, res, next) {
  res.locals.csrfToken = req.csrfToken();
  next();
});
*/
//adding jade - does not affect angular/static file serving
//app.set('view engine', 'pug');

/*
Note on flash messages: they use cookie
-for it to work, cookie must be able to store in browser, if cookie option is secure, but connection is not https, 
cookie will not be able to store, thus you wont see flash-messages
Ref: https://stackoverflow.com/questions/29310650/express-flash-messages-with-passport-doesnt-work
*/
/*
app.use(session({
  secret: 'JaySwaminarayanJaySwaminarayan',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false,//false for localhost
            maxAge: 60000 
          }
}))
*/
//app.use(flash());

//NOTE: to run app: nodemon app.js
var port = 3000;// ktemp override config.port;
logger.info('<<<<>>>> server running on port = '+port);

// DB
mongoose.Promise = global.Promise; // Ref: https://stackoverflow.com/questions/38138445/node3341-deprecationwarning-mongoose-mpromise
//mongoose.connect(config.getDbConnectionString());
console.log("############### => getDbConnectionString = "+config.getDbConnectionString());
// pass passport for configuration
require('./config/passport')(passport);



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



//const mongoose = require('mongoose');

// Connection URL
const url = config.getDbConnectionString();

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('<<<>>>Connected successfully to MongoDB server'))
  .catch(err => console.error('<<<>>>Failed to connect to MongoDB server:', err));

// Routes
app.get('/login', (req, res) => {
  res.render('login');
});

// Serve AngularJS app
app.get('/app', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/logout', (req, res) => {
  //send html to clear localstorage

  res.clearCookie('token', { httpOnly: true, secure: false, sameSite: 'Strict' });
  res.redirect('/login');
});