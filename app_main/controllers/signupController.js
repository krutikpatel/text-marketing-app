var bodyParser = require('body-parser');//we installed via npm
var jwtHelper = require('../helpers/jwthelper');
var async = require('async');
var logger = require('../logging/logModule');

var Users = require('../models/userModel');
var Groups = require('../models/groupModel');
var config = require('../config/config');
var braintreeCreateHelper = require('../braintreePayment/braintreeCreateHelper');
var twilioClient = require('../twilio/twilioClient');
var util = require('util');

var sendSinglMsgAsync = util.promisify(twilioClient.sendSingleMessage);
var twQueryAndGetNumberAsync = util.promisify(twilioClient.queryAndGetAvailableNumber);


module.exports = function(app){

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true}));

    /**
     * @swagger
     * /signup:
     *   post:
     *     tags:
     *       - Signup
     *     description: Signup for new user
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: email
     *         description: login email
     *         in: body
     *         required: true
     *         type: string
     *       - name: password
     *         description: password
     *         in: body
     *         required: true
     *         type: string
     *       - name: country
     *         description: country of user. Accepted codes- US,UK,CAN
     *         in: body
     *         required: true
     *         type: string
     *       - name: firstName
     *         description: firstName
     *         in: body
     *         required: true
     *         type: string
     *       - name: lastName
     *         description: lastName
     *         in: body
     *         required: true
     *         type: string
     *     responses:
     *       200:
     *         description: success json { success - boolean, message - string, token - JWT token string}
     *         schema:
     *           $ref: '#/definitions/LoginResult'
     *       500:
     *         description: json of error. { success - boolean, message - string}
     *       400:
     *         description: json of error. { success - boolean, message - string}
    */
    //1 knote: i have here callback inside callback
    app.post('/signup', async function(req, res) {

        var user = null;
        req.body.country = 'US'; //default to US
        if (!req.body.email || !req.body.password) {
            res.status(400).send({
                success: false,
                message: 'Bad request, please provide name and password.'
            });
        } else if(!req.body.country) {
            
            res.status(400).send({
                success: false,
                message: 'Bad request, please provide country.'
            });
            
        } else if(!twilioClient.validateCountryCode(req.body.country)) {
            res.status(400).send({
                success: false,
                message: 'Bad request, country code provided is wrong : .' + req.body.country
            });
        } else {

            logger.info('[signupController][post:/signup] email: '+req.body.email);

            try{
                //1 checkIfEmailAlreadyUsed
                var tempuser = await Users.findOne({ email: req.body.email });
                if (tempuser) {
                    throw new Error('Error: Account with this email-id already exists.');
                }

                //2 createAndSaveNewGroup
                //a every user needs default group so create one group first
                var newGroup = new Groups({
                    groupName: "All",//default groupname for all users
                    note: "default group which will have all your contacts",
                    //_userId : req.body._userId,
                    totalContacts : 0,
                    //lastSent: 
                });

                //b save new group to db
                const group = await newGroup.save();
                logger.info('[signupController][post:/signup] new default group for new user saved');

                //3 createAndSaveNewUser
                //a create new user
                var newUser = new Users({
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    email: req.body.email,
                    password: req.body.password,
                    groups: [group._id],
                    country: req.body.country,
                    monthlyCycleBeginDate: new Date(),
                });

                //b save the user
                user = await newUser.save();
                logger.info('[signupController][post:/signup] new user saved');

                //4 getTwilioNumberForUser
                const purchasedNumber = await twQueryAndGetNumberAsync();
                logger.info('[signupController][post:/signup] successfully obtained new number for user. Number = '+ purchasedNumber.number , ' , number.sid = ' + purchasedNumber.sid);

                //5 saveTwilioNumberInUserDb
                //save user with twilio number
                const retuser = await Users.findByIdAndUpdate(user._id, {
                    twilioNumber: purchasedNumber.number,
                    twilioNumberSid: purchasedNumber.sid
                });
                logger.info('[signupController][post:/signup] user updated with twilio number');

                //6 updateGroupWithUserId
                //update group with this userid
                await Groups.findByIdAndUpdate(user.groups[0], {
                    _userId: user._id,
                    note: "default group for user: "+ user.email+" which will have all your contacts"
                });
                logger.info('[signupController][post:/signup] updated default group with new user\'s id');

                //7 createBraintreeCustObjectForUser
                //create braintree customer object for this user
                try{
                    const result = await braintreeCreateHelper.createCustomer(user);
                    logger.info('[signupController][post:/signup] successfully created braintree customer');

                }catch(err){
                    //try one more time
                    await braintreeCreateHelper.createCustomer(user);
                }

                //7 createJwtToken
                user.password = '-';
                var token = jwtHelper.createJwtToken(user);

                //8 return the information including token as JSON
                res.status(200).send({
                    success: true,
                    message: 'user successfully created',
                    token: 'JWT ' + token   //NOTE: browser somehow does not like plaing mongoose object sent in token, its invalid header field
                });

            }catch(err){
                logger.error('[signupController][post:/signup] There was an error, Error message = ' + err.message + ' \nSatck = '+err.stack);

                //If there is any error, i MUST remove user object from DB, IF created and then we got error. 
                //  Otherwise user will not be able to resue that emailID
                //  remove user by email
                if(user){
                    Users.remove({ _id: user._id}, function(newerr,users){
                        if(newerr)
                        {
                            logger.error('[signupController][post:/signup] error deleting user upon other error. error from DB = '+err.message);                    
                        }

                        logger.info('[signupController][post:/signup] user deleted upon other error');

                        return res.status(500).send({
                            success: false, 
                            message: err.message
                        });
                        //return;

                    });
                }
                else{
                    return res.status(500).send({
                            success: false, 
                            message: err.message
                    });
                }
            }
        }
    
    });

}