var braintree = require("braintree");
var braintreeHelper = require('./braintreeHelper');
var braintreeGetHelper = require('./braintreeGetHelper');
var logger = require('../logging/logModule');

var bluebird = require("bluebird");

//promisified functions
var btCustUpdate = bluebird.promisify(braintreeHelper.gateway.customer.update, {context: braintreeHelper.gateway.customer});
var btPaymentUpdate = bluebird.promisify(braintreeHelper.gateway.paymentMethod.update, {context: braintreeHelper.gateway.paymentMethod});

var self = module.exports = {

    //should return that method's payment token
    addCustomerPayment : async function(custId,paymentNonce){

        try{
            const result = await btCustUpdate(custId, {
                                    paymentMethodNonce : paymentNonce });
            
            if(result && result.success == true)//result object should not be null. If exception (err) occcurs, it might be null
            {
                logger.info('[BraintreeHelper:addCustomerPayment] customer successfully updated, result = '+result);

                logger.info('[BraintreeHelper:addCustomerPayment] customer token = '+result.customer.creditCards[result.customer.creditCards.length -1].token);
                return result.customer.creditCards[result.customer.creditCards.length -1].token;
            }
            else
                return null;

        }catch(err){
            logger.error('[BraintreeHelper:addCustomerPayment] error while updating customer, ' + err.message + ' \nStack = '+err.stack);
            return null;
        }
    },

    //
    updateCreditCardPaymentMethodForCustomer : async function(custId,paymentNonce){
        
        try{
            //get Customer
            const customer = await braintreeGetHelper.getCustomer(custId);
            if(customer)
            {
                var token = customer.creditCards[customer.creditCards.length -1].token;
                if(token == null)
                {
                    logger.error('[BraintreeHelper:updateCreditCardPaymentMethodForCustomer] token from customer is null, cant do update payment ');
                    return null;
                }
                
                try{
                    const result = await btPaymentUpdate(token, {
                        paymentMethodNonce : paymentNonce,
                        options: {
                            //failOnDuplicatePaymentMethod : true,
                            makeDefault: true,
                            verifyCard: true
                        }
                    });
                    if(result && result.success == true)//result object should not be null. If exception (err) occcurs, it might be null
                    {
                        logger.info('[BraintreeHelper:updateCreditCardPaymentMethodForCustomer] credit card payment method successfully updated, result = '+result);

                        //logger.info('[BraintreeHelper:updateCreditCardPaymentMethodForCustomer] customer paymentToken token = '+result.paymentMethod.token);
                        return result;
                    }
                    else
                        return null;
                }catch(err){
                    logger.error('[BraintreeHelper:updateCreditCardPaymentMethodForCustomer] error while updating credit card payment method, ' + err.message + ' \nStack = '+err.stack);
                    return null;
                }

            }//end if cust
            else
                return null;
        }catch(err){
            logger.error('[BraintreeHelper:updateCreditCardPaymentMethodForCustomer] error while updating credit card payment method, ' + err.message + ' \nStack = '+err.stack);
            return null;
        }

    },
 
};
