var TwilioClient = require('../twilio/twilioClient');
var bodyParser = require('body-parser');//we installed via npm
var logger = require('../logging/logModule');

var Groups = require('../models/groupModel');
var Users = require('../models/userModel');
var Contacts = require('../models/contactsModel');
var userBalanceHelper = require('../braintreePayment/userBalanceHelper');
var config = require('../config/config');
var activityLogHelper = require('../helpers/activityLogHelper');
var userHelper = require('../helpers/userHelper');
var util = require('util');

var sendMessagesAsync = util.promisify(TwilioClient.sendMessages);
const sendSqsMessage = require('../awshelpers/sqshelper');

module.exports = function(app){

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true}));
/*   Not used so commenting 
    //1 get by groupName AND userId, because same groupname can be used by multiple users
    app.get('/smsapi/groups/:groupName/contacts', async function(req,res) {

        logger.info('[contactsController][get:/smsapi/groups/:groupName/contacts] groupName = ' + req.params.groupName);
        try{
            const contacts = await Contacts.find({ groups: req.params.groupName});
            res.status(200).send({
                success: true,
                message: "Contacts successfully fetched",
                contacts: contacts
            });
        } catch(err){
            logger.error('[contactsController][get:/smsapi/groups/:groupName/contacts] error finding group. error from DB = '+err.message);
            res.status(500).send({
                success: false, 
                message: 'There was problem with getting contact info from db'
            });
        }
    });
*/

    //2 get contacts by userId 
    app.get('/smsapi/users/:userId/contacts', async function(req,res) {

        logger.info('[contactsController][get:/smsapi/users/:userId/contacts] userId = ' + req.params.userId);
        try{
            const contacts = await Contacts.find({ _userId: req.params.userId});
            logger.info('[contactsController][get:/smsapi/users/:userId/contacts] total contacts in user = '+ contacts.length);
            res.status(200).send({
                success: true,
                message: "Contacts successfully fetched",
                contacts: contacts
            });
        }catch (err){
            logger.error('[contactsController][get:/smsapi/users/:userId/contacts] error finding user. error from DB = '+err.message);
            res.status(500).send({
                success: false, 
                message: 'There was problem with getting contact info from db'
            });
        }
    });

    //3 get contacts by contactNumber 
    app.get('/smsapi/contacts/:contactNumber', async function(req,res) {

        logger.info('[contactsController][get:/smsapi/contacts/:contactNumber] contactNumber = '+ req.params.contactNumber);
        try{
            const contacts = await Contacts.find({ number: req.params.contactNumber});
            logger.info('[contactsController][get:/smsapi/contacts/:contactNumber] found contact with given number');
            res.status(200).send({
                success: true,
                message: "Contacts successfully fetched",
                contacts: contacts
            });
        }catch (err){
            logger.error('[contactsController][get:/smsapi/contacts/:contactNumber] error finding contact. error from DB = '+err.message);
            res.status(500).send({
                success: false, 
                message: 'There was problem with getting info from db'
            });
        }
    });

    //4 delete by number
    app.delete('/smsapi/users/:userId/contacts/:contactNum', async function(req,res){
        
        logger.info('[contactsController][delete:/smsapi/users/:userId/contacts/:contactNum] userId = ' + req.params.userId + ' and contactNum = ' + req.params.contactNum);
        //knote - see how multiple criteria are used in query
        try{
            const contact = await Contacts.remove({ _userId: req.params.userId, number: req.params.contactNum});
            logger.info('[contactsController][delete:/smsapi/users/:userId/contacts/:contactNum] contact for this user deleted');
            res.status(200).send({
                success: true,
                message: "success with contact delete",
            });
        }catch(err){
            logger.error('[contactsController][delete:/smsapi/users/:userId/contacts/:contactNum] error finding contact to delete. error from DB = '+err.message + ' \nStack = '+err.stack);
            res.status(500).send({
                success: false, 
                message: 'There was problem with getting info from db'
            });
        }
    });

    //5 update - if we search by id, there is no need of using userid in query
    app.put('/smsapi/contacts/:contactId', async function(req,res){
        
        logger.info('[contactsController][put:/smsapi/contacts/:contactId] contactId =' + req.params.contactId);

        try{
            //findOneAndUpdate if not by id
            const contact = await Contacts.findByIdAndUpdate(  req.params.contactId , {
                    //groups: req.body.groups,
                    $set: {groups: req.body.groups} });

            if(contact)
                logger.info('[contactsController][put:/smsapi/contacts/:contactId] contact found and updated');
            else
                logger.info('[contactsController][put:/smsapi/contacts/:contactId] contact not found for update');

            res.status(200).send({
                success: true, 
                message:'success with contact update'
            });
        }catch(err){
            logger.error('[contactsController][put:/smsapi/contacts/:contactId] error updating contact. error from DB = '+err.message + ' \nStack = '+err.stack);
            res.status(500).send({
                success: false, 
                message: 'There was problem with getting info from db'
            });
        }
        
        
    });

    //////////////////////////////////
    ////////// Action APIs
    //////////////////////////////////
    
    /**
     * @swagger
     * /smsapi/users/{userId}/groups/{groupName}/sendsms:
     *   post:
     *     tags:
     *       - Actions
     *     description: Sends SMS to all contacts under "groupName" of given "userId"
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: userId
     *         description: User's userId. Sample working userId - 58e4475807c7c133ac12799c
     *         in: path
     *         required: true
     *         type: string
     *       - name: groupName
     *         description: GroupName uder given userId
     *         in: path
     *         required: true
     *         type: string
     *       - name: message
     *         description: SMS message to be sent
     *         in: body
     *         required: true
     *         type: string
     *       - name: includeName
     *         description: whether to include contact name in SMS message to be sent
     *         in: body
     *         required: true
     *         type: boolean
     *  
     *     responses:
     *       200:
     *         description: json of success { success - boolean, message - string}
     *         
     *       500:
     *         description: json of error. { success - boolean, message - string}
     *         
     *              
    */
    //send by groupName
    app.post('/smsapi/users/:userId/groups/:groupName/sendsmsOrig', async function(req,res) {    
        
        var userId = req.params.userId;
        var group = req.params.groupName;
        var includeName = req.body.includeName;
        
        if(!includeName){
            includeName = false;
        }

        logger.info('[contactsController][post:/smsapi/users/:userId/groups/:groupName/sendsms] userId = ' + userId + ' and groupName = '+req.params.groupName);

        var contacts = null;
        try{
            contacts = await Contacts.find({ _userId: userId, groups: group});//, function(err, contacts){
        
        }catch(err){
                logger.error('[contactsController][post:/smsapi/users/:userId/groups/:groupName/sendsms] error finding contacts with given criteria. error from DB = '+err.message + ' \nStack = '+err.stack);
                res.status(500).send({
                    success: false,
                    message: 'There was problem with getting info from db'
                });
        }

        logger.info('[contactsController][post:/smsapi/users/:userId/groups/:groupName/sendsms] total contacts in group -> '+ group + ' = ' + contacts.length);

        var message  = req.body.message;
        logger.info('[contactsController][post:/smsapi/users/:userId/groups/:groupName/sendsms] message = '+ message);

        try{

            //validate if user has credit to send messages, thats why userId passed in param
            var remainingMessages = await userBalanceHelper.getNumberOfMessagesRemaining(userId);
            if(remainingMessages == 0)
            {
                res.status(500).send({
                    success: false, 
                    message: 'error sending messages'
                });
                return;
            }
            
            //send messages
            const remainingMessageCount = await sendMessagesAsync(contacts, userId, remainingMessages, message,"",includeName);//function(err,remainingMessages) {

            logger.info('[contactsController][post:/smsapi/users/:userId/groups/:groupName/sendsms] Messages on their way! . remainingMessageCount='+remainingMessageCount);

            //log activity
            var activityMsg = 'Messages sent to Group : '+group;
            activityLogHelper.saveActivityLog(userId, config.Messages_Sent_ToGroup, activityMsg);

            try{
                userHelper.updateUserMessageBalance(userId,remainingMessageCount);
                res.status(200).send({
                    success: true, 
                    message: 'done sending messages'
                });    
            }catch(err){
                logger.error('[contactsController][post:/smsapi/users/:userId/groups/:groupName/sendsms] error finding and updating user remaining messages. error from DB = '+err + ' \nStack = '+err.stack);
                res.status(200).send({
                    success: true, 
                    message: 'messages sent, but there was error in DB'
                });
            }

        }catch(err) {
            
            if(err.message == config.errors.Err_Msg_Over)
            {
                logger.error('[contactsController][post:/smsapi/users/:userId/groups/:groupName/sendsms][TwilioClient.sendMessages] error sending all messages. err = '+err.message + ' \nStack = '+err.stack);
                res.status(500).send({
                    success: false, 
                    message: 'error sending messages'
                });
            }
            else
            {
                logger.error('[contactsController][post:/smsapi/users/:userId/groups/:groupName/sendsms][TwilioClient.sendMessages] error sending twilio message. error from Twilio = '+err.message + ' \nStack = '+err.stack);
                res.status(500).send({
                    success: false, 
                    message: 'error sending messages'
                });
            }
            
        }
    });

    app.post('/smsapi/users/:userId/groups/:groupName/sendsms', async function(req,res) {    
        
        var userId = req.params.userId;
        var group = req.params.groupName;
        var includeName = req.body.includeName;
        
        if(!includeName){
            includeName = false;
        }

        logger.info('[contactsController][post:/smsapi/users/:userId/groups/:groupName/sendsms] userId = ' + userId + ' and groupName = '+req.params.groupName);

        //send sqs msg
        const queueURL = 'https://sqs.us-east-1.amazonaws.com/886642041635/sendtestmsgq';
        const messageBody = { params: req.params,
            message: req.body.message,
            includeName: includeName
         };
        await sendSqsMessage(queueURL, messageBody);
        console.log('Message sent to the SQS queue');

        res.status(200).send({
            success: true, 
            message: 'done sending messages'
        });
    });
}