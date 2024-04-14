var MsgJobs = require('../models/campaignJobModel');
var bodyParser = require('body-parser');//we installed via npm
var logger = require('../logging/logModule');
var activityLogHelper = require('../helpers/activityLogHelper');
var config = require('../config/config');
var validator = require('validator');

module.exports = function(app){

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true}));

    /**
     * @swagger
     * definitions:
     *   MsgJob:
     *     type: object
     *     required:
     *     properties:
     *       _id:
     *         type: string
     *       _campaignId:
     *         type: string
     *       _userId:
     *         type: string
     *       when:
     *         type: date-string-ISO
     *       isDone:
     *         type: boolean
     *         
    */

    /**
     * @swagger
     * /smsapi/msgjobs:
     *   post:
     *     tags:
     *       - MsgJobs
     *     description: Create MsgJobs object - schedule some campaign
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: campaignId
     *         description: campaignId
     *         in: body
     *         required: true
     *         type: string
     *       - name: userId
     *         description: User's userId. Sample working userId - 58e4475807c7c133ac12799c
     *         in: body
     *         required: true
     *         type: string
     *       - name: schedule
     *         description: ISO8601 date-time string, when to schedule this job for. Time zone offset TBD
     *         in: body
     *         required: true
     *         type: string
     *     responses:
     *       200:
     *         description: success json { success - boolean, message - string}
     *       500:
     *         description: json of error. { success - boolean, message - string}
    */
    //1
    app.post('/smsapi/msgjobs', async function(req,res) {

        var cmpgnId = req.body.campaignId;
        var userId = req.body.userId;
        var schedDate = req.body.schedule;
        
        logger.info('[scheduleJobController][post:/smsapi/msgjobs] cmpgnId = ' + cmpgnId + ' and schedule time = '+schedDate);
    
        //validation for date. It cannot be in past
        if(!validator.isISO8601(schedDate)){
            logger.error('[scheduleJobController][post:/smsapi/msgjobs] Schdule Date validation failed. schedDate = '+schedDate);
            res.status(500).send({
                success: false, 
                message: 'Schdule Date validation failed'
            });
            return;
        }

        try{
            var newJob = new MsgJobs({
                _campaignId: cmpgnId,
                _userId: userId,
                when: schedDate,
            });

            await newJob.save();

            //TODO : log activity
            //var activityMsg = 'Group created : '+groupName;
            //activityLogHelper.saveActivityLog(userId, config.Group_Created, activityMsg);

            res.status(200).send({
                success: true,
                message: 'Message Job successfully created and saved',
            });

        }catch(err){
            logger.error('[scheduleJobController][post:/smsapi/msgjobs] There was error. Error = ' +err.message + ' \nStack = '+err.stack);
            res.status(500).send({
                success: false, 
                message: err.message
            });
            return;
        }

    });

    /**
     * @swagger
     * /smsapi/user/{userid}/msgjobs:
     *   get:
     *     tags:
     *       - MsgJobs
     *     description: get all MsgJobs for given user
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
     *         description: Json array of MsgJobs objects. { success - boolean, message - string}
     *         schema:
     *           $ref: '#/definitions/MsgJob'
     *       500:
     *         description: json of error. { success - boolean, message - string}
    */
    //2 get all Jobs for given user
    app.get('/smsapi/user/:userid/msgjobs', async function(req,res) {
        
        var userid = req.params.userid;

        if(!userid){
            res.status(500).send({
                success: false, 
                message: 'error processing request, Please provide correct user-id'
            });
            return;
        }

        logger.info('[scheduleJobController][get:/smsapi/user/:userid/msgjobs] userid ='+ userid);

        try{
            const msgJobs = await MsgJobs.find({_userId: userid});

            res.status(200).send({
                success: true,
                message: 'MsgJobs successfully fetched',
                msgJobs : msgJobs
            });

        }catch(err){
            logger.error('[scheduleJobController][get:/smsapi/user/:userid/msgjobs] There was error. Error = ' +err.message + ' \nStack = '+err.stack);
            res.status(500).send({
                success: false, 
                message: err.message
            });
            return;
        }

    });

    /**
     * @swagger
     * /smsapi/campgns/{campgnId}/msgjobs:
     *   get:
     *     tags:
     *       - MsgJobs
     *     description: get all MsgJobs for given user
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: campgnId
     *         description: campgnId
     *         in: path
     *         required: true
     *         type: string
     * 
     *     responses:
     *       200:
     *         description: Json array of MsgJobs objects. { success - boolean, message - string}
     *         schema:
     *           $ref: '#/definitions/MsgJob'
     *       500:
     *         description: json of error. { success - boolean, message - string}
    */
    //3 get all Jobs for given campaign
    app.get('/smsapi/campgns/:campgnId/msgjobs', async function(req,res) {
        
        var campgnId = req.params.campgnId;

        if(!campgnId){
            res.status(500).send({
                success: false, 
                message: 'error processing request, Please provide correct campgn-id'
            });
            return;
        }

        logger.info('[scheduleJobController][get:/smsapi/campgns/:campgnId/msgjobs] campgnId ='+ campgnId);

        try{
            const msgJobs = await MsgJobs.find({_campaignId: campgnId});

            res.status(200).send({
                success: true,
                message: 'MsgJobs successfully fetched',
                msgJobs : msgJobs
            });

        }catch(err){
            logger.error('[scheduleJobController][get:/smsapi/campgns/:campgnId/msgjobs] There was error. Error = ' +err.message + ' \nStack = '+err.stack);
            res.status(500).send({
                success: false, 
                message: err.message
            });
            return;
        }

    });

    /**
     * @swagger
     * /smsapi/msgjobs/{msgjobId}:
     *   delete:
     *     tags:
     *       - MsgJobs
     *     description: delete MsgJobs object
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: msgjobId
     *         description: msgjob obj id
     *         in: path
     *         required: true
     *         type: string
     *     responses:
     *       200:
     *         description: success json { success - boolean, message - string}
     *       500:
     *         description: json of error. { success - boolean, message - string}
    */
    //4
    app.delete('/smsapi/msgjobs/:msgjobId', async function(req,res) {
        
        var msgjobId = req.params.msgjobId;

        if(!msgjobId){
            res.status(500).send({
                success: false, 
                message: 'error processing request, Please provide correct msgjobId-id'
            });
            return;
        }

        logger.info('[scheduleJobController][delete:/smsapi/msgjobs/:msgjobId] msgjobId ='+msgjobId);

        try{
            //delete job
            await MsgJobs.remove({_id: msgjobId});

            res.status(200).send({
                success: true,
                message: 'MsgJob successfully deleted',
            });

        }catch(err){
            logger.error('[scheduleJobController][delete:/smsapi/msgjobs/:msgjobId] There was error. Error = ' +err.message + ' \nStack = '+err.stack);
            res.status(500).send({
                success: false, 
                message: err.message
            });
            return;
        }

    });

}