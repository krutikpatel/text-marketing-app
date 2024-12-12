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
    
    //use this as common middleware for all rest api calls
    verifyTokenFromHeader: function (req, res, next) {
        const authHeader = req.headers['authorization'];
        logger.info('[verifyTokenFromHeader] verifyToken invoked, authHeader = '+authHeader);

        if (!authHeader) {
          return res.status(401).send('Access denied from middleware. No token provided.');
        }
      
        const authHeadertoken = authHeader.split(' ')[1]; // Extract the token from the Bearer scheme
      
        try {
          const decoded = jwt.verify(authHeadertoken, config.secret);
          req.user = decoded; // Add the decoded token to the request object
          next(); // Call the next middleware function
        } catch (ex) {
          res.status(400).send('Invalid token.');
        }
    },

    verifyTokenFromCookie: function (req, res, next) {
        logger.info('verifyToken invoked, req.cookies = '+req.cookies);

        //get info from cookie
        const token = req.cookies['token'];
        logger.info('verifyToken invoked, token = '+token);

        if (!token) {
          return res.status(401).send('Access denied from middleware. No token provided.');
        }
      
        try {
          const decoded = jwt.verify(token, config.secret);
          req.user = decoded; // Add the decoded token to the request object for use in next function or conotroller
          next(); // Call the next middleware function
        } catch (ex) {
          res.status(400).send('Invalid token.');
        }
    }
};