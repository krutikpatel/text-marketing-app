var Groups = require('../models/groupModel');
var Users = require('../models/userModel');
var Contacts = require('../models/contactsModel');
var logger = require('../logging/logModule');

module.exports = {

    saveContact: function(phoneNumber,userId,groupName,firstName,lastName,email){

        if(!module.exports.validatePhoneNumber(phoneNumber))
            return;
        module.exports.checkIfContactAlreadyExistsForGroup(phoneNumber,userId, groupName, function(err,contactExistsAlready){

            if(err || contactExistsAlready){
                //console.log('########## contact exists already');
                return;
            }

            //console.log('inside save contact');
            var newContact = new Contacts({
                number: phoneNumber,
                _userId : userId,
                groups: [groupName,'All'],
                firstName : firstName,
                lastName : lastName,
                email : email
            });

            newContact.save(function(err){
                if(err)
                {
                    //THIS METHOD IS NOT SUPPOSED TO RETURN HTTP RESPONSE
                    //res.status(500).send({success: false, msg: 'There was problem with getting info from db'});
                    logger.info('[contactsDao][saveContact] error saving contact for userId = ' + userId + ' , err = ' + err);
                }
                
            });
        });
        
    },

    /*
    will fail for '(xxx)-xxx-xxx => dash after closing bracket fails
    Ref: https://stackoverflow.com/questions/18375929/validate-phone-number-using-javascript
    */
    validatePhoneNumber : function(number){
        var regex1 = /^(\([0-9]{3}\)\s*|[0-9]{3}\-)[0-9]{3}-[0-9]{4}$/;
        if(number.toString().valueOf().match(regex1)) {
            return true;
        }
        else {
            //for normal 10 digit number
            var regex2 = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
            if(number.toString().valueOf().match(regex2)) {
                return true;
            }
            
            logger.info('[contactsDao][validatePhoneNumber] validation failed , number = '+number);
            return false;
        }
    },

    /*
    
    */
    checkIfContactAlreadyExistsForGroup : function(number,userId, groupName,callback){
        logger.info('[contactsDao][checkIfContactAlreadyExistsForGroup] userId = ' + userId + ' and groupName = ' + groupName);
        Contacts.find({ groups: groupName,
                        _userId : userId,
                        number : number }, function(err, contacts){
            if(err)
            {
                logger.error('[contactsDao][checkIfContactAlreadyExistsForGroup] error finding contact. error from DB = '+err.message);
                callback(err,false);
            }
            if(contacts.length>0)
                callback(null,true);
            else
                callback(null,false);

        });

    }
};
