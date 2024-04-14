var bodyParser = require('body-parser');//we installed via npm
var multer = require('multer');
var csvParser = require('../helpers/csvParser');
var logger = require('../logging/logModule');
var Users = require('../models/userModel');
var Groups = require('../models/groupModel');
var activityLogHelper = require('../helpers/activityLogHelper');
var config = require('../config/config');
var xlxParse = require('../helpers/xlxParser');

module.exports = function(app){

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true}));

    var upload = multer({dest: './uploads/'});//knote: app.use does not work
/*
knote:
Multer adds a body object and a file or files object to the request object. 
The body object contains the values of the text fields of the form, the file or files object 
contains the files uploaded via the form.

ref:
https://github.com/expressjs/multer
*/
    /**
     * Not Used
     * 
     * //@swagger
     * definitions:
     *   ColObj:
     *     type: object
     *     required:
     *       - phoneNumberCol
     *       - firstNameCol
     *       - lastNameCol
     *       - emailCol
     *     properties:
     *       phoneNumberCol:
     *         type: integer
     *       firstNameCol:
     *         type: integer
     *       lastNameCol:
     *         type: integer
     *       emailCol:
     *         type: integer
     */


    /**
     * @swagger
     * /smsapi/users/upload:
     *   post:
     *     tags:
     *       - Upload File
     *     description: Uploads contacts file - .csv or .xlx , to given userId and groupName under that user
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: userId
     *         description: User's userId. Sample working userId - 58e4475807c7c133ac12799c
     *         in: body
     *         required: true
     *         type: string
     *       - name: groupName
     *         description: GroupName under given userId
     *         in: body
     *         required: true
     *         type: string
     *       - name: phoneNumberCol
     *         description: phoneNumber Column number
     *         in: body
     *         required: true
     *         type: integer
     *       - name: firstNameCol
     *         description: firstName Column number
     *         in: body
     *         required: true
     *         type: integer
     *       - name: lastNameCol
     *         description: lastName Column number
     *         in: body
     *         required: true
     *         type: integer
     *       - name: emailCol
     *         description: email Column number
     *         in: body
     *         required: true
     *         type: integer
     * 
     *     responses:
     *       200:
     *         description: json of success. { success - boolean, message - string}
     *       500:
     *         description: json of error. { success - boolean, message - string}
     *         
     *              
    */
    //1
    app.post('/smsapi/users/upload', upload.single('fileSent'), function(req,res) {
                                            /* knote: upload.single('fileSent') , use same string as used in angular side in post formdata
                                                Ref: https://github.com/expressjs/multer/issues/159
                                            */
        logger.info('[fileController][post:/smsapi/users/upload] userId=' + req.body.userId + ' and groupName = ' +req.body.groupName + ' and phoneNoColumn = ' +req.body.phoneNoColumn);

        //check user_id, if exists then only
        Users.findById(req.body.userId, function(err, user){
            if(err)
            {
                logger.error('[fileController][post:/smsapi/users/upload] error finding user. error from DB = '+err.message);
                res.status(500).send({
                    success: false, 
                    message: 'There was problem with getting info from db'
                });
            }

            if(user)//if user found
            {
                Groups.find({groupName: req.body.groupName}, function(err, groups){
                    if(err)
                    {
                        logger.error('[fileController][post:/smsapi/users/upload] error finding group. error from DB = '+err.message);
                        res.status(500).send({
                            success: false, 
                            message: 'There was problem with getting info from db'
                        });
                    }

                    if(groups.length!=0)
                    {
                        /*
                        var colObj = {
                            phoneNumberCol: 0,
                            firstNameCol: 1,
                            lastNameCol: 2,
                            emailCol: 3
                        }
                        */
                        var colObj = {
                            phoneNumberCol: req.body.phoneNumberCol,
                            firstNameCol: req.body.firstNameCol,
                            lastNameCol: req.body.lastNameCol,
                            emailCol: req.body.emailCol
                        }

                        //save contacts to this groupName
                        var origFileName = req.file.originalname;
                        logger.info('[fileController][post:/smsapi/users/upload] original Filename=' + origFileName );
                        
                        if(origFileName.substr(origFileName.lastIndexOf('.')) === '.csv')
                        {
                            logger.info('[fileController][post:/smsapi/users/upload] its CSV file');
                            csvParser.parseCsvFile(req.file.filename,req.body.userId,req.body.groupName,colObj, function(results,failRows){

                                logger.info('[fileController][post:/smsapi/users/upload] Parsing complete. Results = '+ results);
                                
                                var activityMsg = 'Contacts uploaded via CSV file, to Group : '+req.body.groupName;
                                activityLogHelper.saveActivityLog(req.body.userId, config.Contacts_Uploaded, activityMsg);

                                res.status(200).send({
                                    success: true,
                                    message : 'success, filename = '+req.file.originalname + ', and failed to fetch phone number on '+ failRows +' rows'
                                });
                            });
                        }
                        else if(origFileName.substr(origFileName.lastIndexOf('.')) === '.xlsx'){
                            /*
                            //temp:
                            //console.log('pasring xslx');
                            //xlxParse.parseXsl();
                            console.log('parsed');
                            res.status(200).send({
                                    success: true,
                                    message : 'success'
                                });
                            */
                            logger.info('[fileController][post:/smsapi/users/upload] its XLX file');

                            //req.body.colObj
                            xlxParse.parseXlxFile(req.file.filename,req.body.userId,req.body.groupName,req.body.colObj,function(failRows){

                                logger.info('[fileController][post:/smsapi/users/upload] Parsing complete. failRows = '+failRows);
                                
                                var activityMsg = 'Contacts uploaded via XLX file, to Group : '+req.body.groupName;
                                activityLogHelper.saveActivityLog(req.body.userId, config.Contacts_Uploaded, activityMsg);

                                res.status(200).send({
                                    success: true,
                                    message : 'success, filename = '+req.file.originalname + ', and failed to fetch phone number on '+failRows +' rows'
                                });
                            });

                        }
                    }
                    else
                        res.status(500).send({
                            success: false, 
                            message: 'Group with given name does not exist'
                        });
                });
            }
            else
                res.status(500).send({
                    success: false, 
                    message: 'User with given id does not exist'
                });

        });
       
    });

}