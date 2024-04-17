// create a module to export a function that sends a message to aws sqs
const AWS = require('aws-sdk');

// Set the region 
AWS.config.update({region: 'us-east-1'});

// Create an SQS service object
const sqs = new AWS.SQS({apiVersion: '2012-11-05'});

async function sendMessage(queueURL, messageBody) {
    const params = {
        MessageBody: JSON.stringify(messageBody),
        QueueUrl: queueURL
    };

    try {
        const data = await sqs.sendMessage(params).promise();
        console.log(`Message sent, ID: ${data.MessageId}`);
    } catch (error) {
        console.error(`Error sending message: ${error}`);
    }
}

module.exports = sendMessage;