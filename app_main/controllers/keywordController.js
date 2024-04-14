var Keywords = require('../models/keywordModel');
var async = require('async');

var bodyParser = require('body-parser');//we installed via npm
var logger = require('../logging/logModule');
var activityLogHelper = require('../helpers/activityLogHelper');
var config = require('../config/config');

module.exports = function(app){

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true}));

    /**
     * @swagger
     * definitions:
     *   Keyword:
     *     type: object
     *     required:
     *     properties:
     *       _id:
     *         type: string
     *       keywordString:
     *         type: string
     *       _userId:
     *         type: string
     *       group:
     *         type: string
     *       responseMessage:
     *         type: string
     *         
    */

    /**
     * @swagger
     * /smsapi/keywords:
     *   post:
     *     tags:
     *       - Keyword
     *     description: Create Keyword object
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: keyword
     *         description: keyword name
     *         in: body
     *         required: true
     *         type: string
     *       - name: groupName
     *         description: name of group that this Keyword will save contact to
     *         in: body
     *         required: true
     *         type: string
     *       - name: userId
     *         description: User's userId. Sample working userId - 58e4475807c7c133ac12799c
     *         in: body
     *         required: true
     *         type: string
     *       - name: responseMessage
     *         description: responseMessage when person send SMS with this keyword
     *         in: body
     *         required: true
     *         type: string
     *     responses:
     *       200:
     *         description: success json { success - boolean, message - string}
     *       500:
     *         description: json of error. { success - boolean, message - string}
    */
    app.post('/smsapi/keywords', async function(req,res) {

        var keyword = req.body.keyword;
        var groupName = req.body.groupName;
        var userId = req.body.userId;
        var responseMessage = req.body.responseMessage;

        logger.info('[keywordController][post:/smsapi/keywords] keyword = ' + keyword + ' , groupName =  '+ groupName +  ' , userId = '+ userId);

        try{
            //1 checkIfKeywordExists
            const keywords = await Keywords.find({ keywordString: keyword, _userId : userId});
            if(keyword.length>0){
                logger.info('[keywordController][post:/smsapi/keywords] keyword already exists');
                throw new Error('keyword already exists');
                //return;//to avoid calling below callback again
            }

            //2 createAndSaveKeyword
            var newKw = new Keywords({
                keywordString: keyword,
                _userId : userId,
                groupName: groupName,
                responseMessage: responseMessage
            });

            await newKw.save();

            //log activity
            //var activityMsg = 'Group created : '+groupName;
            //activityLogHelper.saveActivityLog(userId, config.Group_Created, activityMsg);

            res.status(200).send({
                success: true,
                message: 'keyword successfully created and saved',
            });

        }catch(err){
            logger.error('[keywordController][post:/smsapi/keywords] There was error. Error = ' +err.message + ' \nStack = '+err.stack);
            res.status(500).send({
                success: false, 
                message: err.message
            });
            return;
        }

    });

    /**
     * @swagger
     * /smsapi/keywords:
     *   put:
     *     tags:
     *       - Keyword
     *     description: Edit Keyword object
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: groupName
     *         description: name of group that this Keyword will save contact to
     *         in: body
     *         required: true
     *         type: string
     *       - name: id
     *         description: object-id for keyword object
     *         in: body
     *         required: true
     *         type: string
     *       - name: responseMessage
     *         description: responseMessage when person send SMS with this keyword
     *         in: body
     *         required: true
     *         type: string
     *     responses:
     *       200:
     *         description: success json { success - boolean, message - string, group- newGroup}
     *       500:
     *         description: json of error. { success - boolean, message - string}
    */
    app.put('/smsapi/keywords', async function(req,res) {

        var id = req.body.id;
        var groupName = req.body.groupName;
        var responseMessage = req.body.responseMessage;

        if(!id){
            res.status(500).send({
                success: false, 
                message: 'error processing request, Please provide correct Keyword object-id'
            });
            return;
        }

        logger.info('[keywordController][put:/smsapi/keywords] keywordId ='+req.body.id + ' , groupName =  '+ groupName);

        try{
            //1 updateKeyword
            await Keywords.findByIdAndUpdate(id, {
                groupName: groupName,
                responseMessage: responseMessage,
            });

            res.status(200).send({
                success: true,
                message: 'keyword successfully updated',
            });

        }catch(err){
            logger.error('[keywordController][put:/smsapi/keywords] There was error. Error = ' +err.message + ' \nStack = '+err.stack);
            res.status(500).send({
                success: false, 
                message: err.message
            });
        }

    });    

    /**
     * @swagger
     * /smsapi/user/{userid}/keywords:
     *   get:
     *     tags:
     *       - Keyword
     *     description: get all Keywords for given user
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: userId
     *         description: User's userId. Sample working userId - 58e4475807c7c133ac12799c
     *         in: path
     *         required: true
     *         type: string
     * 
     *     responses:
     *       200:
     *         description: Json array of keyword objects. { success - boolean, message - string}
     *         schema:
     *           $ref: '#/definitions/Keyword'
     *       500:
     *         description: json of error. { success - boolean, message - string}
    */
    //get all keywords for given user
    app.get('/smsapi/user/:userid/keywords', async function(req,res) {

        var userid = req.params.userid;

        if(!userid){
            res.status(500).send({
                success: false, 
                message: 'error processing request, Please provide correct user-id'
            });
            return;
        }

        logger.info('[keywordController][get:/smsapi/user/:userid/keywords] userid ='+ userid);

        try{
            //1 getKeywords
            const keywords = await Keywords.find({_userId: userid});

            res.status(200).send({
                success: true,
                message: 'keyword successfully fetched',
                keywords : keywords
            });

        }catch(err){
            logger.error('[keywordController][get:/smsapi/user/:userid/keywords] There was error. Error = ' +err.message + ' \nStack = '+err.stack);
            res.status(500).send({
                success: false, 
                message: err.message
            });
            return;
        }

    });

    /**
     * @swagger
     * /smsapi/keywords/{keywordid}:
     *   delete:
     *     tags:
     *       - Keyword
     *     description: delete Keyword object
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: keywordid
     *         description: keywordid obj id
     *         in: path
     *         required: true
     *         type: string
     * 
     *     responses:
     *       200:
     *         description: success json { success - boolean, message - string}
     *       500:
     *         description: json of error. { success - boolean, message - string}
    */
    app.delete('/smsapi/keywords/:keywordid', async function(req,res) {

        var keywordid = req.params.keywordid;

        if(!keywordid){
            res.status(500).send({
                success: false, 
                message: 'error processing request, Please provide correct keyword-id'
            });
            return;
        }

        logger.info('[keywordController][delete:/smsapi/keywords/:keywordid] keywordid ='+keywordid);

        try{
            //deleteKeyword
            await Keywords.remove({_id: keywordid});

            res.status(200).send({
                success: true,
                message: 'keyword successfully deleted',
            });

        }catch(err){
            logger.error('[keywordController][delete:/smsapi/keywords/:keywordid] There was error. Error = ' +err.message + ' \nStack = '+err.stack);
            res.status(500).send({
                success: false, 
                message: err.message
            });
            return;
        }

    });

}