var bodyParser = require('body-parser');//we installed via npm
var jwtHelper = require('../helpers/jwthelper');

var Users = require('../models/userModel');
var config = require('../config/config');
var logger = require('../logging/logModule');
var userBalanceHelper = require('../braintreePayment/userBalanceHelper');

var crypto = require('crypto');//part on nodejs, dont have to install
var async = require('async');
var flash = require('express-flash');
var emailhelper = require('../helpers/emailHelper');

module.exports = function(app){

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true}));

    /**
     * @swagger
     * definitions:
     *   LoginResult:
     *     type: object
     *     required:
     *     properties:
     *       success:
     *         type: boolean
     *       message:
     *         type: string
     *       token:
     *         type: string
     *         
    */

    /**
     * @swagger
     * /login:
     *   post:
     *     tags:
     *       - Login
     *     description: login
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
     * 
     *     responses:
     *       200:
     *         description: success json { success - boolean, message - string, token - JWT token string}
     *         schema:
     *           $ref: '#/definitions/LoginResult'
     *       500:
     *         description: json of error. { success - boolean, message - string}
     *       401:
     *         description: json of error. { success - boolean, message - string}
    */
    //1
    app.post('/login', async function(req, res) {
        
        logger.info('[loginController][post:/login] email: '+req.body.email);
        
        try{        
            const user = await Users.findOne({email: req.body.email});
            //const user = userObject.toObject();
            //throw { err: 'dfsd', code : 400};

            if (!user) {
                res.status(401).send({
                    success: false,
                    message: 'Authentication failed. User not found.'
                });
            } else {
                // check if password matches
                const isMatch = await user.comparePassword(req.body.password);
                    if (isMatch) {
                        
                        // if user is found and password is right create a token
                        var token = jwtHelper.createJwtToken(user.toObject());
                        
                        //check trial expiry
                        userBalanceHelper.checkTrialPeriodExpiry(user);

                        logger.info('[loginController][post:/login] login successful for: '+ user.email);
                        // return the information including token as JSON
                        res.status(200).send({
                            success: true,
                            message: 'login successful',
                            token: 'JWT ' + token
                        });
                    } else {
                        res.status(401).send({
                            success: false,
                            message: 'Authentication failed. Wrong password.'
                        });
                    }
            }
        } catch(err){
            logger.error('[loginController][post:/login] error finding user error from DB = '+err + ' \nStack = '+err.stack);
            res.status(500).send({
                success: false, 
                message: 'There was problem with getting info from db'
            });
        }
    });

    //2 forgot password
    app.post('/forgot', async function(req, res, next) {

        try{
            const buf = await crypto.randomBytes(20);
            console.log('buf created');
            var token = buf.toString('hex');

            const user = await Users.findOne({ email: req.body.email });
            if (!user) {
                req.flash('error', 'No account with that email address exists.');                        
                res.redirect('/forgot');
            }
            user.resetPasswordToken = token;
            user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

            console.log('email = ' + req.body.email);

            const savedUser = await user.save();

            var pwResetLink = 'http://' + req.headers.host + '/reset/' + token;
            console.log('@@@@ PW Reset Link: ' + pwResetLink);
            emailhelper.sendTokenEmail(pwResetLink,null);
            console.log('@@@ ==> email sending called');
            req.flash('info', 'An e-mail has been sent to ' + user.email + ' with further instructions.');

            //finally Done
            res.redirect('/forgot');

        } catch(err){
            req.flash('There was an error processing your request, please try again');
            res.redirect('/forgot');
            //return next(err);//sends 500 internal server error --> this next gives error
        }
       
    });

    //pw reset done and sent by user
    app.post('/reset/:token', async function(req, res,next) {
        
        try{
            const user = await Users.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } });
            if (!user) {
                req.flash('error', 'Password reset token is invalid or has expired.');
                /*
                res.status(500).send({
                    success: false,
                    message: 'Password reset token is invalid or has expired.',
                });
                */
                return res.redirect('back');
            }
            user.password = req.body.password;
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            await user.save();

            //TODO send email

            //done
            res.redirect('/forgot');

        }catch(err){
            logger.error('[loginController][post /reset/:token] There was error. Error = '+err.message + ' \nStack = '+err.stack);
            req.flash('error', 'Password reset token is invalid or has expired.');
            /*
            res.status(500).send({
                success: false,
                message: 'Password reset token is invalid or has expired.',
            });
            */
            //return next(err);//sends 500 internal server error
            return res.redirect('back');
        }
    });

    //Jade pages
    app.get('/forgot', function(req, res) {
        //console.log("@@@@@ param = "+res.locals.kk);
        res.render('forgot', {
            user: req.user
        });
    });

    app.get('/reset/:token', async function(req, res) {
        
        try{
            const user = await Users.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } });

            if (!user) {
                req.flash('error', 'Password reset token is invalid or has expired.');
                return res.redirect('/forgot');
            }
        }catch(err){
            logger.error('[loginController][get /reset/:token] There was error. Error = '+err.message + ' \nStack = '+err.stack);

            req.flash('error', 'Password reset token is invalid or has expired.');
            return res.redirect('/forgot');
            /*
            res.status(500).send({
                success: false,
                message: 'Password reset token is invalid or has expired.',
            });
            */
        }

        res.render('reset', {
            user: req.user
        });

    });

}