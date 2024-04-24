
//ref: https://blog.devgenius.io/integrate-aws-secret-manager-in-your-nodejs-application-c167115eec3e
const logger = require('../logging/logModule');
logger.info('Loading config function');
var AWS = require('aws-sdk'),
    region = "us-east-1",
    secret,
    secretName="smsapp_secrets", // You can load this secret based on the environment
    decodedBinarySecret;
// Create a Secrets Manager client
var client = new AWS.SecretsManager({
    region: region
});

async function getSecretValueAsync(secretName) {
    try {
        logger.info('before getSecretValue');
        const data = await client.getSecretValue({ SecretId: secretName }).promise();
        logger.info('after getSecretValue');
        // Decrypts secret using the associated KMS key.
        // Depending on whether the secret is a string or binary, one of these fields will be populated.
        if ('SecretString' in data) {
            logger.info('<<<<<>>>>> getSecret data='+ JSON.stringify(data) );
            secret = JSON.parse(data.SecretString);
            
            // Add all secret which is present on AWS to process.env 
            // which will be available in all over application
            for(const envKey of Object.keys(secret)) {
                process.env[envKey] = secret[envKey];
            }
        } else {
            let buff = new Buffer(data.SecretBinary, 'base64');
            decodedBinarySecret = buff.toString('ascii');
            logger.info('<<<<<>>>>> decodedBinarySecret='+decodedBinarySecret );
        }
    } catch (err) {
        logger.info(err);
    }
}

async function main() {
    logger.info('before getSecretValueAsync');
    await getSecretValueAsync(secretName);
    logger.info('after getSecretValueAsync');
}
  
main();

/*
function getSecretValuePromise(secretName) {
    return client.getSecretValue({ SecretId: secretName }).promise()
        .then(data => {
            logger.info('after getSecretValue');
            if ('SecretString' in data) {
                logger.info('<<<<<>>>>> getSecret data='+ JSON.stringify(data) );
                secret = JSON.parse(data.SecretString);
                for(const envKey of Object.keys(secret)) {
                    process.env[envKey] = secret[envKey];
                }
            } else {
                let buff = new Buffer(data.SecretBinary, 'base64');
                decodedBinarySecret = buff.toString('ascii');
                logger.info('<<<<<>>>>> decodedBinarySecret='+decodedBinarySecret );
            }
        })
        .catch(err => {
            logger.info(err);
        });
}

function main() {
    logger.info('before getSecretValuePromise');
    getSecretValuePromise(secretName)
        .then(() => {
            logger.info('after getSecretValuePromise');
        });
}

main();
*/