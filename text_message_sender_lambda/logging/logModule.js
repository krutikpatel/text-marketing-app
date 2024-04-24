var winston = require('winston');
var fs = require('fs');
var config = require('../config/config');

// Create the log directory if it does not exist
if (!fs.existsSync(config.logDir)) {
//  fs.mkdirSync(config.logDir);
;
}

//var date = new Date();
//const tsFormat = () => date.toDateString() + date.toLocaleTimeString();
const tsFormat = () => '[' + (new Date()).toLocaleString() + ']';
const env = process.env.NODE_ENV || 'development';

const logger = winston.createLogger({
    level: env === 'development' ? 'info' : 'info',
    format: winston.format.combine(
        winston.format.timestamp({
            format: tsFormat
        }),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console({
            handleExceptions: true,
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        }),
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' })
    ],
    exitOnError: false
});

logger.stream = {
    write: function(message, encoding) {
      logger.info(message);
    },
  };

/*
module.exports = {
    logger
};
*/
module.exports = logger;