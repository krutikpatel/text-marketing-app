var papa = require('babyparse');
var fs = require('fs');
var logger = require('../logging/logModule');
var contactsDao = require('./contactsDao');

//knote: refer twilioClient.js -> that is just one kind of helper
module.exports = {

    /*
    TODO:
    -need to figure out which column has phone numbers
    -error handling and reporting to ui
    */
    /* 
    Note:
    1. Format for colObj:
    {
        phoneNumberCol: int
        firstNameCol: int,
        lastNameCol: int,
        emailCol: int
    }
    */
    parseCsvFile : function (fileName,userId,groupName,colObj,callback) {

        logger.info('[csvParse][parseCsvFile] ',{fileName: fileName, userId : userId, colObj: colObj});
        //1. read file from fs
        var content = fs.readFileSync('./uploads/'+fileName, { encoding: 'binary' });

        var failRows = 0;
        //2. parse using baby parse
        papa.parse(content, {
            
            step: function(row){
                logger.info('[csvParse][parseCsvFile] Row =' +row.data);
                
                var phoneNumber = row.data[0][colObj.phoneNumberCol];//row.data[colObj.phoneNumberCol];
                var firstName = row.data[0][colObj.firstNameCol];
                var lastName = row.data[0][colObj.lastNameCol];
                var email = row.data[0][colObj.emailCol];
                /*
                console.log('@@@ phoneNumber = ' + phoneNumber);
                console.log('@@@ firstName = ' + firstName);
                console.log('@@@ lastName = ' + lastName);
                console.log('@@@ email = ' + email);
                */
                
                //3. add entries to DB
                if(phoneNumber && contactsDao.validatePhoneNumber(phoneNumber))
                {
                    //logger.info('[csvParse][parseCsvFile] Row phoneNumber =' +phoneNumber);
                    contactsDao.saveContact(phoneNumber,userId,groupName,firstName,lastName,email);
                }    
                else
                {
                    failRows = failRows+1;
                    logger.info('[csvParse][parseCsvFile] phone no. extraction form row failed or validation for that number failed',{ failRows:failRows});
                }

            },
            
            complete: function(results) {

                //4. remove file from uploads folder
                fs.unlinkSync('./uploads/'+fileName);

                //5. call callbak which will return message to browser
                logger.info('[csvParse][parseCsvFile] all row parsing finished. ',{ results : results, failRows:failRows});
                callback(results,failRows);
            }

        });

    }

};