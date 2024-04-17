
//ref: https://blog.devgenius.io/integrate-aws-secret-manager-in-your-nodejs-application-c167115eec3e
var AWS = require('aws-sdk'),
    region = "us-east-1",
    secret,
    secretName="smsapp_secrets", // You can load this secret based on the environment
    decodedBinarySecret;
// Create a Secrets Manager client
var client = new AWS.SecretsManager({
    region: region
});
client.getSecretValue({SecretId: secretName}, function(err, data) {
    if (err) {
        if (err.code === 'DecryptionFailureException')
            // Secrets Manager can't decrypt the protected secret text using the provided KMS key.
            // Deal with the exception here, and/or rethrow at your discretion.
            throw err;
        else if (err.code === 'InternalServiceErrorException')
            // An error occurred on the server side.
            // Deal with the exception here, and/or rethrow at your discretion.
            throw err;
        else if (err.code === 'InvalidParameterException')
            // You provided an invalid value for a parameter.
            // Deal with the exception here, and/or rethrow at your discretion.
            throw err;
        else if (err.code === 'InvalidRequestException')
            // You provided a parameter value that is not valid for the current state of the resource.
            // Deal with the exception here, and/or rethrow at your discretion.
            throw err;
        else if (err.code === 'ResourceNotFoundException')
            // We can't find the resource that you asked for.
            // Deal with the exception here, and/or rethrow at your discretion.
            throw err;
    }
    else {
        // Decrypts secret using the associated KMS key.
        // Depending on whether the secret is a string or binary, one of these fields will be populated.
        if ('SecretString' in data) {
            console.log('<<<<<>>>>> getSecret data='+ JSON.stringify(data) );
            secret = JSON.parse(data.SecretString);
            
            // Add all secret which is present on AWS to process.env 
            // which will be available in all over application
            for(const envKey of Object.keys(secret)) {
                process.env[envKey] = secret[envKey];
            }
        } else {
            let buff = new Buffer(data.SecretBinary, 'base64');
            decodedBinarySecret = buff.toString('ascii');
            console.log('<<<<<>>>>> decodedBinarySecret='+decodedBinarySecret );
        }
    }
    
    // console log in case of error
    console.log(err);
});