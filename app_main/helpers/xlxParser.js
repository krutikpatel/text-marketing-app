var xlsx = require('xlsx');
var fs = require('fs');
var logger = require('../logging/logModule');
var contactsDao = require('./contactsDao');

module.exports = {

    /* 
    Note:
    1. Format for colObj:
    {
        phoneNumberCol: int
        firstNameCol: int,
        lastNameCol: int,
        emailCol: int
    }

    2. Fist row is expected to be col names and not values, otherwise first col will be skipped
    */
    parseXlxFile : function(fileName,userId,groupName,colObj,callback){

        var content = fs.readFileSync('./uploads/'+fileName, { encoding: 'binary' });

        //var workbook = xlsx.readFile('G:/nodejs/tempContacts.xlsx'); // parses a file
        var workbook = xlsx.read(content,{type:"binary"}); // parses a content. ref: file:///G:/nodejs/apps/SmsAppSvn/node_modules/xlsx/README.md

        // Get worksheet
        var first_sheet_name = workbook.SheetNames[0];
        var worksheet = workbook.Sheets[first_sheet_name];

        //var obj = xlsx.parse('G:\nodejs' + '\sampleExcel.xlsx'); // parses a file
        //console.log(workbook);

        //
        var failRows = 0;
        var rows = xlsx.utils.sheet_to_json(worksheet);
        for(var i =0;i<rows.length ; i++){
            var row = rows[i];
            console.log(row);
            var numColName = Object.keys(row)[colObj.phoneNumberCol];
            var fnColName = Object.keys(row)[colObj.firstNameCol];
            var lnColName = Object.keys(row)[colObj.lastNameCol];
            var emailColName = Object.keys(row)[colObj.emailCol];
            
            var phoneNumber = row[numColName];
            var firstName = row[fnColName];
            var lastName = row[lnColName];
            var email = row[emailColName];
            /*
            console.log('@@@ phoneNumber = ' + phoneNumber);
            console.log('@@@ firstName = ' + firstName);
            console.log('@@@ lastName = ' + lastName);
            console.log('@@@ email = ' + email);
            */
            //validate and save to DB
            if(phoneNumber && contactsDao.validatePhoneNumber(phoneNumber))
            {
                //logger.info('[xlxParser][parseXlxFile] Row phoneNumber =' +phoneNumber);
                contactsDao.saveContact(phoneNumber,userId,groupName,firstName,lastName,email);
            }    
            else
            {
                failRows = failRows+1;
                logger.info('[xlxParser][parseXlxFile] phone no. extraction form row failed or validation for that number failed',{ phoneNoColumn : phoneNoColumn, failRows:failRows});
            }

        }

        //
        fs.unlinkSync('./uploads/'+fileName);

        //call callbak which will return message to browser
        logger.info('[xlxParser][parseXlxFile] all row parsing finished. and failRows count = ' + failRows);
        callback(failRows);

    }
    
};