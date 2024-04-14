var http = require('http');
var logger = require('../logging/logModule');
var config = require('../config/config');

module.exports = {

    findLocation : function(req, res, next){

        //res.locals.kk = "krutik";
        var options = {
          host: 'freegeoip.net',
          port: 80,
          path: '/json/73.158.190.96'
        };

        /* Note:
            freegeoip.net/{format}/{IP_or_hostname}
            receive json and parse it
        */
        http.get(options, function(resp){
            resp.on('data', function(chunk){
                var resObj = JSON.parse(chunk);
                logger.info('[geoip:findLocation middleware] country = resObj.country_code');
                res.locals.country = resObj.country_code;
                next();
            });
        }).on("error", function(e){
            logger.error('[geoip:findLocation middleware] Got error: ' + e.message);
        });
    },
};