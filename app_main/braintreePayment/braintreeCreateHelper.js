var braintree = require("braintree");
var logger = require('../logging/logModule');
var braintreeHelper = require('./braintreeHelper');
var bluebird = require("bluebird");

//promisified functions
var btSubscCreate = bluebird.promisify(braintreeHelper.gateway.subscription.create, {context: braintreeHelper.gateway.subscription});
var btCustCreate = bluebird.promisify(braintreeHelper.gateway.customer.create, {context: braintreeHelper.gateway.customer});
var btGenToken = bluebird.promisify(braintreeHelper.gateway.clientToken.generate, {context: braintreeHelper.gateway.clientToken});

/*
Note:
    All functions return null when there is an error in braintree
*/

var self = module.exports = {

    generateClientTokenByCustId : async function(custId){
        try{
            const response = await btGenToken({
                                customerId: custId,
                                //verifyCard : true
                            });
            return response;
        } catch(err){
            logger.info('[BraintreeHelper:generateClientTokenByCustId] error from braintree = , ' +err + ' \nStack = '+err.stack);
            return null;
        }
    },

    createCustomer : async function(user){
        logger.info('[BraintreeHelper:createCustomer] user._id = , ' + user._id);

        try{
            const result = await btCustCreate({
                /*
                firstName: "Jen",
                lastName: "Smith",
                company: "Braintree",
                email: "jen@example.com",
                phone: "312.555.1234",
                fax: "614.555.5678",
                website: "www.example.com"
                */
                id: user._id.toString(),//imp: mongodb id is object
                firstName: user.firstName,
                lastName: user.lastName,
                //company: user.company,
                email: user.email,
                phone: user.phone,
                //fax: user.,
                website: user.website,
            });
        
            if(result && result.success == true)//result object should not be null. If exception (err) occcurs, it might be null
            {
                logger.info('[BraintreeHelper:createCustomer] successfully created braintree customer ');

                //Note: result has cust object: result.customer.id
                return result;
            }
            else{
                return null;
            }
        }catch(err){
            logger.error('[BraintreeHelper:createCustomer] error while creating customer, ' + err.message + ' \nStack = '+err.stack);
            return null;
        }
    },

    createPayamentMethodForCustomer : async function(custId,paymentNonce){

        try{
            const result = await btSubscCreate({
                customerId : custId,
                paymentMethodNonce : paymentNonce,
                options: {
                    //failOnDuplicatePaymentMethod : true,
                    makeDefault: true,
                    verifyCard: true
                }
            });
            
            if(result && result.success == true){//result object should not be null. If exception (err) occcurs, it might be null
                logger.info('[BraintreeHelper:createPayamentMethodForCustomer] paymentMethod successfully updated, result = '+result);

                return result.paymentMethod.token;
            }
            else
                return null;
        }catch(err){
            logger.error('[BraintreeHelper:createPayamentMethodForCustomer] error while creating  paymentMethod, ' + err.message + ' \nStack = '+err.stack);
            return null;
        }
    },

    //check if cust already subscribed. otherwise braintree does not prevent from creating another subscription
    createSubscriptionWithToken : async function(custId,createdPaymentToken,planId){

        //response has response.clientToken (which is diff from token we see on braintree console)
        //response.success
        try{    
            const result = await btSubscCreate({
                //paymentMethodNonce : paymentNonce, --> does not work. only works with drop-in ui
                paymentMethodToken : createdPaymentToken,   //"cfmdgy", //response.clientToken, --> does not work
                planId :             planId,
            });

            if(result && result.success == true)//result object should not be null. If exception (err) occcurs, it might be null
            {
                logger.info('[BraintreeHelper:createSubscriptionWithNonce] subscription successfully created, result = '+result);
                return true;
            }
            else
                return false;
        
        }catch(err){
            logger.error('[BraintreeHelper:createSubscriptionWithNonce] error while creating subscription, ' + err.message + ' \nStack = '+err.stack);
            //result.errors contains all errors
            return false;        
        }    
    }

};