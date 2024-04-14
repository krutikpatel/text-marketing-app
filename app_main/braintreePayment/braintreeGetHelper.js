var braintree = require("braintree");
var logger = require('../logging/logModule');
var braintreeHelper = require('./braintreeHelper');

var bluebird = require("bluebird");

//promisified functions
var btCustFind = bluebird.promisify(braintreeHelper.gateway.customer.find, {context: braintreeHelper.gateway.customer});

var self = module.exports = {

    getCustomer: async function(custId){   
        try{
            const customer = await btCustFind(custId);
            logger.info('[BraintreeHelper:getCustomerDefaultPaymentToken] customer successfully getting customer, customer = '+customer);
            return customer;
        }catch(err){
            logger.error('[BraintreeHelper:getCustomerDefaultPaymentToken] error while getting customer, ' + err.message);
            return null;
        }
    },

    //get cust default payment token
    getCustomerDefaultPaymentToken: async function(custId){
        try{
            const customer = await btCustFind(custId);
            logger.info('[BraintreeHelper:getCustomerDefaultPaymentToken] customer successfully getting customer, customer = '+customer);
            return customer.creditCards[result.customer.creditCards.length -1].token;
        }catch(err){
            logger.error('[BraintreeHelper:getCustomerDefaultPaymentToken] error while getting customer, ' + err.message + ' \nStack = '+err.stack);
            return null;
        }

    },
};