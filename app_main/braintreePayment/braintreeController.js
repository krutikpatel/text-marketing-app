var braintree = require("braintree");
var logger = require('../logging/logModule');
var braintreeHelper = require('./braintreeHelper');
var braintreeCreateHelper = require('./braintreeCreateHelper');
var braintreeGetHelper = require('./braintreeGetHelper');
var braintreeUpdateHelper = require('./braintreeUpdateHelper');
var braintreeDeleteHelper = require('./braintreeDeleteHelper');

//var emailHelper = require('./emailHelper');
var userBalanceHelper = require('./userBalanceHelper');
var activityLogHelper = require('../helpers/activityLogHelper');

module.exports = function(app){

    /**
     * @swagger
     * /smsapi/payment/client_token:
     *   get:
     *     tags:
     *       - Payment
     *     description: get Braintree client token
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: userId
     *         description: User's userId. Sample working userId - 58e4475807c7c133ac12799c
     *         in: path
     *         required: true
     *         type: string
     * 
     *     responses:
     *       200:
     *         description: Json array of campaign objects. { success - boolean, message - string, clientToken- clientToken-some object}
     *       500:
     *         description: json of error. { success - boolean, message - string}
    */
    //note: it should take userId, and with that we obtain braintree custId for that user Id and use to generate token
    app.get("/smsapi/payment/client_token", async function (req, res) {
        var custId = req.body.userId;
        try{
            const response = await braintreeCreateHelper.generateClientTokenByCustId(custId);
            if(response){
                res.status(200).send({
                    success: true,
                    message: "",
                    clientToken : response.clientToken
                    });
            }else{
                throw new Error('Error while getting Braintree token for userId = '+userId);
            }
        }catch(err){
            logger.error('[braintreeController][get:/smsapi/payment/client_token] There was error. Error = ' +err.message + ' \nStack = '+err.stack);
            res.status(500).send({
                success: false, 
                message: err.message
            });
        }

    });
/*
    app.post("/smsapi/checkout", function (req, res) {
        var nonceFromTheClient = req.body.payment_method_nonce;
        // Use payment method nonce here

        braintreeHelper.gateway.transaction.sale({
            amount: "20.00",
            paymentMethodNonce: nonceFromTheClient,
            customerId: '13227258',
            recurring: true,
            options: {
                submitForSettlement: true
            }
        }, function (err, result) {

            if(!err)
                res.status(200).send('success');
        });

    });
*/
    /**
     * @swagger
     * /smsapi/payment/subscribe:
     *   post:
     *     tags:
     *       - Payment
     *     description: Create subscription for this user
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: payment_method_nonce
     *         description: braintree ui provided object. will be prepared by Braintree UI
     *         in: body
     *         required: true
     *         type: string/object
     *       - name: userId
     *         description: User's userId. Sample working userId - 58e4475807c7c133ac12799c
     *         in: body
     *         required: true
     *         type: string
     *       - name: planId
     *         description: subscription Plan's ID/Name
     *         in: body
     *         required: true
     *         type: boolean
     *     responses:
     *       200:
     *         description: success json { success - boolean, message - string}
     *       500:
     *         description: json of error. { success - boolean, message - string}
    */
    app.post("/smsapi/payment/subscribe", async function (req, res) {
        var nonceFromTheClient = req.body.payment_method_nonce;
        var custId = req.body.userId;
        var planId = 'Test1';//req.body.planId;
        //
        try{
            //create payment method for customer using payment nonce
            const createdPaymentToken = await braintreeCreateHelper.createPayamentMethodForCustomer(custId, nonceFromTheClient);//, function(err,createdPaymentToken){
            if(createdPaymentToken)
            {
                logger.info('[braintreeController][post:/smsapi/payment/subscribe] Payment-Method and token successfully created for userId = '+userId);
                //create subscription for customer using token
                const result = await braintreeCreateHelper.createSubscriptionWithToken(custId, createdPaymentToken,planId);
                if(result){
                    logger.info('[braintreeController][post:/smsapi/payment/subscribe] Subscription successfully created for userId = '+userId);
                    //set trial ended flag for user
                    userBalanceHelper.setEndTrialFlagForUser(custId);
                    res.status(200).send({
                        success: true,
                        message: 'success',
                    });
                }else{
                    logger.error('[braintreeController][post:/smsapi/payment/subscribe] Error in Subscription creation for userId = '+userId);
                    throw new Error('Error in Subscription creation for userId = '+userId);
                }
            }else{
                logger.error('[braintreeController][post:/smsapi/payment/subscribe] Error in PaymentMethod creation for userId = '+userId);
                throw new Error('Error in PaymentMethod creation for userId = '+userId);
            }

        }catch(err){
            logger.error('[braintreeController][post:/smsapi/payment/subscribe] There was error. Error = ' +err.message + ' \nStack = '+err.stack);
            res.status(500).send({
                success: false, 
                message: err.message
            });
        }
        

    });

    /**
     * @swagger
     * /smsapi/payment/updatecard:
     *   post:
     *     tags:
     *       - Payment
     *     description: Update payment card for this user
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: payment_method_nonce
     *         description: braintree ui provided object. will be prepared by Braintree UI
     *         in: body
     *         required: true
     *         type: string/object
     *       - name: userId
     *         description: User's userId. Sample working userId - 58e4475807c7c133ac12799c
     *         in: body
     *         required: true
     *         type: string
     *     responses:
     *       200:
     *         description: success json { success - boolean, message - string}
     *       500:
     *         description: json of error. { success - boolean, message - string}
    */
    app.post("/smsapi/payment/updatecard", async function (req, res) {
        var nonceFromTheClient = req.body.payment_method_nonce;
        var custId = req.body.userId;
        try{
            const result = await braintreeUpdateHelper.updateCreditCardPaymentMethodForCustomer(custId, nonceFromTheClient);    
            if(result){
                logger.info('[braintreeController][post:/smsapi/payment/updatecard] Creadi card payment method successfully updated for userId = '+userId);
                res.status(200).send({
                    success: true,
                    message: 'success',
                });
            }else
                throw new Error('Error in updating card info for userId = '+userId);
        }catch(err){
            logger.error('[braintreeController][post:/smsapi/payment/updatecard] There was error. Error = ' +err.message + ' \nStack = '+err.stack);
            res.status(500).send({
                success: false, 
                message: err.message
            });
        }
        
    });

    /**
     * @swagger
     * /smsapi/payment/cancelsubscription:
     *   post:
     *     tags:
     *       - Payment
     *     description: Cancel subscription for this user
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: userId
     *         description: User's userId. Sample working userId - 58e4475807c7c133ac12799c
     *         in: body
     *         required: true
     *         type: string
     *     responses:
     *       200:
     *         description: success json { success - boolean, message - string}
     *       500:
     *         description: json of error. { success - boolean, message - string}
    */
    app.post("/smsapi/payment/cancelsubscription", async function (req, res) {

        var custId = req.body.userId;
        try{
            const success = await braintreeDeleteHelper.cancelSubscription(custId);
            if(success){
                logger.info('[braintreeController][post:/smsapi/payment/cancelsubscription] subscription successfully cancelled for userId = '+userId);
                res.status(200).send({
                    success: true,
                    message: 'success',
                });
            }else
                throw new Error('Error in cancelling subscription for userId = '+userId);
        }catch(err){
            logger.error('[braintreeController][post:/smsapi/payment/cancelsubscription] There was error. Error = ' +err.message + ' \nStack = '+err.stack);
            res.status(500).send({
                success: false, 
                message: err.message
            });
        }
        
    });

    /**
     * @swagger
     * /smsapi/payment/changesubscription:
     *   post:
     *     tags:
     *       - Payment
     *     description: changesubscription subscription plan for this user
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: payment_method_nonce
     *         description: braintree ui provided object. will be prepared by Braintree UI
     *         in: body
     *         required: true
     *         type: string/object
     *       - name: userId
     *         description: User's userId. Sample working userId - 58e4475807c7c133ac12799c
     *         in: body
     *         required: true
     *         type: string
     *       - name: newPlanId
     *         description: new subscription Plan's ID/Name
     *         in: body
     *         required: true
     *         type: boolean
     *     responses:
     *       200:
     *         description: success json { success - boolean, message - string}
     *       500:
     *         description: json of error. { success - boolean, message - string}
    */
    app.post("/smsapi/payment/changesubscription", async function (req, res) {
        var nonceFromTheClient = req.body.payment_method_nonce;
        var custId = req.body.userId;
        var newplan = req.body.newPlanId;
        
        try{
            const success = await braintreeDeleteHelper.cancelSubscription(custId);
            if(!success)
                throw new Error('Error in cancelling old subscription for userId = '+userId);
            else{
                logger.info('[braintreeController][post:/smsapi/payment/changesubscription] old subscription successfully cancelled for userId = '+userId);
                const result = await braintreeUpdateHelper.updateCreditCardPaymentMethodForCustomer(custId, nonceFromTheClient);    
                if(result){
                    logger.info('[braintreeController][post:/smsapi/payment/changesubscription] success in updating payment card for userId = '+userId);
                    success = await braintreeCreateHelper.createSubscriptionWithToken(custId, result.paymentMethod.token,newplan);
                    if(success){
                        logger.info('[braintreeController][post:/smsapi/payment/changesubscription] success in creating new subscription for userId = '+userId);
                        //log activity
                        var activityMsg = 'Subscription plan changed to : '+newplan;
                        activityLogHelper.saveActivityLog(custId, config.Plan_Changed, activityMsg);
    
                        res.status(200).send({
                            success: true,
                            message: 'success',
                        });
                    }else{
                        throw new Error('Error in creating new subscription for userId = '+userId);
                    }
                }else{
                    throw new Error('Error in updating payment card for userId = '+userId);
                }
            }
        }catch(err){
            logger.error('[braintreeController][post:/smsapi/payment/changesubscription] There was error. Error = ' +err.message + ' \nStack = '+err.stack);
            res.status(500).send({
                success: false, 
                message: err.message
            });
        }
        

    });

    //Test1
    app.post("/smsapi/test", function (req, res) {
        var nonceFromTheClient = req.body.payment_method_nonce;
/*
        //emailHelper.sendEmail(function(err,result){
        braintreeDeleteHelper.cancelSubscription('58e3326506dc0725c063e4f1',function(err,result){
            if(!err)
            {
                res.status(200).send('success');
            }
            else
                res.status(500).send('error in api');
        });
*/
    });

};