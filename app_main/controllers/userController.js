var Users = require('../models/userModel');
var bodyParser = require('body-parser');//we installed via npm

var logger = require('../logging/logModule');
var jwtHelper = require('../helpers/jwthelper');
var passport	= require('passport');
var config = require('../config/config');

module.exports = function(app){

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true}));

    // Secure endpoint
    //req.user = {"user":{"value":"krutikpatelextra@gmail.com"},"iat":1715920622,"exp":1715924222}
    app.get('/smsapp/memberinfo', jwtHelper.verifyTokenFromHeader, async function(req,res) {
        console.log('[usercontroller][get:smsapp/memberinfo] req.user = '+ JSON.stringify(req.user));
        var decoded = req.user.user;
        const email = decoded.value;
        console.log('[usercontroller][get:smsapp/memberinfo] email = '+ email);

        //console.log('[usercontroller][get:smsapp/memberinfo] req.token = ', req.token);
/*
        // Middleware to verify JWT
        const token = req.headers['authorization'];
        if (!token) return res.status(401).send('Access denied. No token provided.');
    
        try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        res.send(decoded);
        } catch (ex) {
        res.status(400).send('Invalid token.');
        }
*/
        console.log('[usercontroller][get:smsapp/memberinfo] passed middleware validation');
        try{
            const user = await Users.find({ email: decoded.value});
            if (!user) {
                logger.error('[usercontroller][get:smsapp/memberinfo] user not found in DB');
                return res.status(401).send({
                    success: false,
                    message: 'Authentication failed. User not found.'
                });
            }else {
                logger.info('[usercontroller][get:smsapp/memberinfo] user found in DB, email = '+user[0].email);
                                           //knote: value returned by mongoose find method is array, so even if there is only one obj found, to access that  object, user array anootation
                
                //res.json({success: true, msg: 'Welcome in the member area ' + user.email + '!'});//browser does not get email, sees "unknowen" instead
                //res.send(user);
                var retUser = user[0]; //not sending sensitive details
                retUser.password = '';
                retUser.resetPasswordToken = '';
                return res.status(200).send({
                    success: true,
                    message: 'user found',
                    user : retUser,
                });
                    
            }
        }catch(err){
            logger.error('[usercontroller][get:smsapp/memberinfo] Error = '+err.message + ' \nStack = '+err.stack);
            res.status(500).send({
                success: false,
                message: 'There was problem with getting info from db'
            });
        }
    });

    //google oauth2 flow
    app.get('abc/smsapp/memberinfo',async function(req,res) {
        console.log('[usercontroller][get:smsapp/memberinfo] req.body = '+ JSON.stringify(req.body));
        console.log('[usercontroller][get:smsapp/memberinfo] req.token = ', req.token);

        var decoded = jwtHelper.getDataAfterVerifyingJwtToken(req.token);//decoded._doc.email
        if (decoded) {
            //var decoded = jwt.verify(token, config.secret);
            logger.info('[usercontroller][get:smsapp/memberinfo] decoded email: '+ decoded.email);

            try{
                const user = await Users.find({ email: decoded.email});
                if (!user) {
                    logger.error('[usercontroller][get:smsapp/memberinfo] user not found in DB');
                    return res.status(401).send({
                        success: false,
                        message: 'Authentication failed. User not found.'
                    });
                }else {
                    logger.info('[usercontroller][get:smsapp/memberinfo] user found in DB, email = '+user[0].email);
                                               //knote: value returned by mongoose find method is array, so even if there is only one obj found, to access that  object, user array anootation
                    
                    //res.json({success: true, msg: 'Welcome in the member area ' + user.email + '!'});//browser does not get email, sees "unknowen" instead
                    //res.send(user);
                    var retUser = user[0]; //not sending sensitive details
                    retUser.password = '';
                    retUser.resetPasswordToken = '';
                    return res.status(200).send({
                        success: true,
                        message: 'user found',
                        user : retUser,
                    });
                        
                }
            }catch(err){
                logger.error('[usercontroller][get:smsapp/memberinfo] Error = '+err.message + ' \nStack = '+err.stack);
                res.status(500).send({
                    success: false,
                    message: 'There was problem with getting info from db'
                });
            }
        }
        else {
            return res.status(401).send({
                success: false,
                message: 'No token provided or wrong token or token expired'
            });
        }
    });

    /**
     * @swagger
     * definitions:
     *   User:
     *     type: object
     *     required:
     *     properties:
     *       _id:
     *         type: string
     *       firstName:
     *         type: string
     *       lastName:
     *         type: string
     *       email:
     *         type: string
     *       groups:
     *         type: Array of group obj id, string
     *       balance:
     *         type: object
     *         $ref: '#/definitions/balance' 
     *       twilioNumber:
     *         type: string
     *       billing:
     *         type: object
     *         $ref: '#/definitions/billing' 
     *       country:
     *         type: string
    */

    /**
     * @swagger
     * definitions:
     *   balance:
     *     type: object
     *     required:
     *     properties:
     *       remainingMessagesThisMonthCycle:
     *         type: integer
     *       billingCycleEndDate:
     *         type: strig/date
     *         
    */

    /**
     * @swagger
     * definitions:
     *   billing:
     *     type: object
     *     required:
     *     properties:
     *       plan:
     *         type: string
     *         
    */
    /**
     * @swagger
     * /smsapp/memberinfo/:
     *   get:
     *     tags:
     *       - User
     *     description: Returns a user information for passed user email
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: email
     *         description: User's email
     *         in: header
     *         required: true
     *         type: string
     *     responses:
     *       200:
     *         description: A single user
     *         schema:
     *           $ref: '#/definitions/User'
     */
    //1 - get by uname
    // app.get('/smsapp/memberinfo',passport.authenticate('jwt', { session: false}), async function(req,res) {  //krutiknew this does not work
    //legacy flow
    app.get('/smsapp/memberinfoLegacy',async function(req,res) {
        var decoded = jwtHelper.getDataAfterVerifyingJwtToken(req.headers);//decoded._doc.email
        if (decoded) {
            //var decoded = jwt.verify(token, config.secret);
            logger.info('[usercontroller][get:smsapp/memberinfo] decoded email: '+ decoded.email);

            try{
                const user = await Users.find({ email: decoded.email});
                if (!user) {
                    logger.error('[usercontroller][get:smsapp/memberinfo] user not found in DB');
                    return res.status(401).send({
                        success: false,
                        message: 'Authentication failed. User not found.'
                    });
                }else {
                    logger.info('[usercontroller][get:smsapp/memberinfo] user found in DB, email = '+user[0].email);
                                               //knote: value returned by mongoose find method is array, so even if there is only one obj found, to access that  object, user array anootation
                    
                    //res.json({success: true, msg: 'Welcome in the member area ' + user.email + '!'});//browser does not get email, sees "unknowen" instead
                    //res.send(user);
                    var retUser = user[0]; //not sending sensitive details
                    retUser.password = '';
                    retUser.resetPasswordToken = '';
                    return res.status(200).send({
                        success: true,
                        message: 'user found',
                        user : retUser,
                    });
                        
                }
            }catch(err){
                logger.error('[usercontroller][get:smsapp/memberinfo] Error = '+err.message + ' \nStack = '+err.stack);
                res.status(500).send({
                    success: false,
                    message: 'There was problem with getting info from db'
                });
            }
        }
        else {
            return res.status(401).send({
                success: false,
                message: 'No token provided or wrong token or token expired'
            });
        }
    });
/* Not Used
    //1 - get by email
    app.get('/smsapp/users/:email', async function(req,res) {

        logger.info('[usercontroller][get:smsapp/users/:email] email = '+req.params.email);
        try{
            const user = Users.find({ email: req.params.email});
            //delete pw before sending to UI
            user.password = '';
            
            res.status(200).send({
                success: true,
                message: 'user found',
                user : user,//tODO - dont send whole user object
            });

        }catch(err){
            logger.error('[usercontroller][get:smsapp/users/:email] Error = '+err.message + ' \nStack = '+err.stack);
            res.status(500).send({
                success: false,
                message: 'There was problem with getting info from db'
            });
        }
    });
*/
    /*
    Not intended to update groups array in user document
    -that should be done by groups api
    */
    app.put('/smsapp/users', async function(req,res) {

        logger.info('[usercontroller][put:smsapp/users] id = '+req.body.id);
        if(!req.body.id){ //if id given, look if it already exists
            res.status(500).send({
                success: false,
                message: 'There was problem with getting info from db'
            });
        }
        try{
            const user = await Users.findByIdAndUpdate(req.body.id, {
                firstName: req.body.firstName
            });

            logger.info('[usercontroller][put:smsapp/users] user updated');
            res.status(200).send({
                success: true,
                message: 'User updated successfully'
            });
        }catch(err){
            logger.error('[usercontroller][put:smsapp/users] Error = '+err.message + ' \nStack = '+err.stack);
            res.status(500).send({
                success: false,
                message: 'There was problem with getting info from db'
            });
        }
    });

};
