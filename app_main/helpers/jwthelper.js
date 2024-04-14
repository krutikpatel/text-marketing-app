var logger = require('../logging/logModule');
var config = require('../config/config');
var jwt = require('jsonwebtoken');//('jwt-simple');

//using jsonwebtoken npm module
module.exports = {

    /*
    create token with expiry
    -NOTE: expiry does not work is data is not json
    */
    createJwtToken : function(data){
        return jwt.sign(data, config.secret, { expiresIn: 60 * config.JWT_EXPIRY_MINS });//30 min. time considered in epoch time
    },

    /* JWT token verification     
    -return null if any problem with header or jwt or verification
    */
    getDataAfterVerifyingJwtToken : function (headers) {

        if (headers && headers.authorization) {
            var parted = headers.authorization.split(' ');
            if (parted.length === 2) {
                //return parted[1];
                var decoded;
                var token = parted[1];
                //check jwt expiry time
                try {
                     decoded = jwt.verify(token, config.secret);
                } catch(err) {
                    // err 
                    logger.error('[getTokenAndVerify] error in jwt verification. err = '+err + ' \nStack = '+err.stack);
                    return decoded;
                }
                //return decoded._doc;
                return decoded;
            
            } else {//no JWT
                logger.error('[getTokenAndVerify] no JWT in header');
                return null;
            }
        } else {//no header
            logger.error('[getTokenAndVerify] no header, or no authorization in header');
            return null;
        }
    },
    
};