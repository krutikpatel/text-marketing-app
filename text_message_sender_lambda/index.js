//fetching env variables first thing to do
require("./config/env.config");
//const MongoDBHelper = require('./mongodbhelper');
const mongoose = require('mongoose');
const config = require('./config/config');
const logger = require('./logging/logModule');
const util = require('util');


const Contacts = require('./models/contactsModel');

//const db = new MongoDBHelper('mongodb+srv://<username>:<password>@cluster0.mongodb.net/test?retryWrites=true&w=majority');
//await db.connect();
//const result = await db.find('test', 'contacts', {});
//console.log(result);
//await db.close();

// DB
mongoose.Promise = global.Promise;
mongoose.connect(config.getDbConnectionString());
logger.info("############### => getDbConnectionString = "+config.getDbConnectionString());

logger.info('Jay Swaminarayan, First log ! :D ');
logger.info('<<<>>>> config.TWILIO_ACCOUNT_SID='+config.TWILIO_ACCOUNT_SID);

const handler = async (event) => {
    var TwilioClient = require('./twilio/twilioClient');
    const sendMessagesAsync = util.promisify(TwilioClient.sendMessages);

    console.log('krutik event = '+ JSON.stringify(event));
    //for (const message of event.Records) {
    const message = event.Records[0];
    console.log(`krutik Processed message ${message.body}`);
    
    //
    var userId = message.body.userId;
    var group = message.body.groupName;
    var includeName = message.body.includeName;
    var textmessage  = message.body.textmessage;
    var isFailed = false;
    var contacts;
    try{
      contacts = await Contacts.find({ _userId: userId, groups: group});//, function(err, contacts){
  
    }catch(err){
      logger.error('[handler] error finding contacts with given criteria. error from DB = '+err.message + ' \nStack = '+err.stack);
      isFailed = true;
    }

    logger.info('[] total contacts in group -> '+ group + ' = ' + contacts.length);
    logger.info('[] textmessage = '+ textmessage);

    try{
      //send messages
      //const remainingMessageCount = await sendMessagesAsync(contacts, userId, remainingMessages, message,"",includeName);
      var remainingMessageCount = 1;
      logger.info('[] Messages on their way! . remainingMessageCount='+remainingMessageCount);
    }catch(err) {
      logger.error('[] error sending messages. error from DB = '+err + ' \nStack = '+err.stack);
    }
    //
    const response = {
      statusCode: 200,
      body: JSON.stringify('Hello from Lambda!'),
    };
    return response;
};

//call handler
const event = {
  "Records": [
    {
      "messageId": "c37a8fe2-cbcb-4f7d-9071-9463130c274e",
      "receiptHandle": "AQEBHptbLhht4zo4fjWvSbI3elBLEODh4zPAFnqxKLL4WZ87qYdJpVJHD5GAEMst5atHGJMnHVT+kLVj2F2j82azaUfybxkxFYlqPuGiJ72IQR2sAcDHtvJVPuB7DVnNEH8bAXithqLYMqHCzrclvUtewWmqiAtMSC3I7elSjbdvJVxfpr5pjmmLignGCsqlSb4vyxNH7QFx2E3R3R1uGySX5RUmxW0PxQNBhiqwtMj5H2/yR2LmgyAL6e6VjyNliw5KSzs9/QgNV8xrVvno/xUf5Dccp1/MiMG4r8ADXAT87zHghJvNy+T6Kw7/J8ZDBlT9WNIEp0HpoDzgBbQyiYMFvU07/AETw7Lw1X4BgG2cDAYkOGHhckpMUSw/cThesTxfARSaaGM/ENr4wwqOlu7T+A==",
      "body": {
        "userId": "60d5ec9af682fbd39a1b2f4c",
        "groupName": "patel",
        "includeName": true,
        "textmessage": "hello promo msg"
      },
      "attributes": {
        "ApproximateReceiveCount": "14",
        "SentTimestamp": "1713407181245",
        "SenderId": "886642041635",
        "ApproximateFirstReceiveTimestamp": "1713407181248"
      },
      "messageAttributes": {},
      "md5OfBody": "50ed97627b46ef4b59f882d541c07bb9",
      "eventSource": "aws:sqs",
      "eventSourceARN": "arn:aws:sqs:us-east-1:886642041635:sendtestmsgq",
      "awsRegion": "us-east-1"
    }
  ]
};

handler(event);

module.exports = {
  handler
};