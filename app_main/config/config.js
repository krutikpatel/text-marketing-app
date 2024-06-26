var configValues = require('./configValues');//note: we dont have to put .js or .json , it understands
require('dotenv').config();


let secrets = {
        TWILIO_ACCOUNT_SID : process.env.TWILIO_ACCOUNT_SID,
        TWILIO_AUTH_TOKEN : process.env.TWILIO_AUTH_TOKEN,
        TWILIO_NUMBER : process.env.TWILIO_NUMBER,
        secret: process.env.SECRET,
        BT_MERCHANT_ID : process.env.BT_MERCHANT_ID,
        BT_PUBLIC_KEY : process.env.BT_PUBLIC_KEY,
        BT_PRIVATE_KEY: process.env.BT_PRIVATE_KEY,
        SENDGRID_EMAIL_API_KEY : process.env.SENDGRID_EMAIL_API_KEY
    };

module.exports = {
    //aws smsapp_secrets
    // Port
    port: process.env.PORT || 80,

    // env
    env: 'devEnv', // 'prod'
	
    // Logs
    logDir: '../logs',
    logFile: '/logsMain.log', 
    
    getPlanMessages : function(plan){
        if(plan === configValues.PLAN_ID_PLAN1)
            return 300;
        else if(plan === configValues.PLAN_ID_PLAN30)
            return 1000;

        return 0;
    },

    
    //Trial Period
    trailMessages : 300,

    //errors
    errors : {
        Err_Msg_Over : 'Message balance over',
    },

    //Activity Types
    Payment_Processed : 'Payment_Processed',
    Contacts_Uploaded : 'Contacts_Uploaded',
    Messages_Sent_ToGroup : 'Messages_Sent_ToGroup',
    Group_Deleted : 'Group_Deleted',
    Group_Created : 'Group_Created',
    Plan_Changed : 'Plan_Changed',
    Payment_PastDue : 'Payment_PastDue',
    
    //Message Job Interval
    maxDiffMs : (60*60*1000),//60 mins

    //JWT
    JWT_EXPIRY_MINS : 30,
    
    // DB related
    getDbConnectionString : function(){
    
        if (process.env.NODE_ENV === 'production') {
            //heroku mlab
            //mongodb://<dbuser>:<dbpassword>@ds143141.mlab.com:43141/heroku_8b0ctp8b
            return 'mongodb+srv://' + configValues.uname + ':' + configValues.pwd + 
                '@cluster1.orkdxnn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1';
        }
        else{
            //mongodb://<dbuser>:<dbpassword>@ds011311.mlab.com:11311/nodetotosample
            return 'mongodb+srv://' + configValues.uname + ':' + configValues.pwd + 
                '@cluster1.orkdxnn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1';
        }

        
    },

    // Twilio related
    TWILIO_ACCOUNT_SID : secrets.TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN : secrets.TWILIO_AUTH_TOKEN,
    TWILIO_NUMBER : secrets.TWILIO_NUMBER,
    
    // Passport/JWT authentication related
    secret: secrets.secret,
    
    //Braintree
    BT_MERCHANT_ID : secrets.BT_MERCHANT_ID,
    BT_PUBLIC_KEY : secrets.BT_PUBLIC_KEY,
    BT_PRIVATE_KEY: secrets.BT_PRIVATE_KEY,

    //email api
    SENDGRID_EMAIL_API_KEY : secrets.SENDGRID_EMAIL_API_KEY,

}