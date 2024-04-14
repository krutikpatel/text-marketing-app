var braintree = require("braintree");
var braintreeHelper = require('./braintreeHelper');
var logger = require('../logging/logModule');

var bluebird = require("bluebird");

//promisified functions
var btCustFind = bluebird.promisify(braintreeHelper.gateway.customer.find, {context: braintreeHelper.gateway.customer});
var btSubscCancel = bluebird.promisify(braintreeHelper.gateway.subscription.cancel, {context: braintreeHelper.gateway.subscription});

var self = module.exports = {

    /*
    1. get customer by custId
    2. get subsc id, inside paymentMethod (there must be only one subsc)
    3. then call cancel on that

    NOTE:
    cancelled ones are not deleted. new ones are added at end of array
    */
    cancelSubscription: async function(custId){

        try{    
            //1
            const customer = await btCustFind(custId);

            logger.info('[BraintreeDeleteHelper:cancelSubscription] successfully getting customer, customer = '+customer);
            var lastPaymentMethodIndex = customer.paymentMethods.length -1;
            var lastSubIndex = customer.paymentMethods[lastPaymentMethodIndex].subscriptions.length -1;
                
            logger.info('[BraintreeDeleteHelper:cancelSubscription] test, subsc id  = '+customer.paymentMethods[lastPaymentMethodIndex].subscriptions[lastSubIndex].id);
            
            try{
                const result = await btSubscCancel(customer.paymentMethods[lastPaymentMethodIndex].subscriptions[lastSubIndex].id);
                if(result && result.success == true)//result object should not be null. If exception (err) occcurs, it might be null
                {
                    logger.info('[BraintreeDeleteHelper:cancelSubscription] subscription successfully cancelled for custId ='+ custId +' , result = '+result);
                    callback(err,result);
                }
                else
                    return null;                                        
            }catch(err){
                logger.error('[BraintreeDeleteHelper:cancelSubscription] error while cancelling subscription, ' + err.message + ' \nStack = '+err.stack);
                return err;
            }   
        }catch(err){
            logger.error('[BraintreeDeleteHelper:cancelSubscription] error while getting customer, ' + err.message + ' \nStack = '+err.stack);
            return null;
        }
    },
}