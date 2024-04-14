var braintree = require("braintree");
var config = require('../config/config');
var logger = require('../logging/logModule');

var self = module.exports = {
/*
    gateway : braintree.connect({
        environment: braintree.Environment.Sandbox,
        merchantId: config.BT_MERCHANT_ID ,//"7x7xxscvxbfdkbpb",
        publicKey: config.BT_PUBLIC_KEY ,//"3dypgc75r5mx5dfs",
        privateKey: config.BT_PRIVATE_KEY //"078c6132a0016f7d20347f30caeadeae"
    }),
*/
    gateway : new braintree.BraintreeGateway({
        environment: braintree.Environment.Sandbox,
        merchantId: config.BT_MERCHANT_ID,
        publicKey: config.BT_PUBLIC_KEY,
        privateKey: config.BT_PRIVATE_KEY
    }),

};
