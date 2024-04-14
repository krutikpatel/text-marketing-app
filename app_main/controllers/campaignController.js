var Campaigns = require('../models/campaignModel');
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
     *   Campaign:
     *     type: object
     *     required:
     *     properties:
     *       _id:
     *         type: string
     *       campaignName:
     *         type: string
     *       _userId:
     *         type: string
     *       groupName:
     *         type: string
     *       note:
     *         type: string
     *       messageToSend:
     *         type: string
     *       includeName:
     *         type: boolean
     *       lastSent:
     *         type: string-date
     *         
    */

    /**
     * @swagger
     * /smsapi/campgns:
     *   post:
     *     tags:
     *       - Campaign
     *     description: Create Campaign object
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: name
     *         description: Campaign name
     *         in: body
     *         required: true
     *         type: string
     *       - name: groupName
     *         description: name of group that this campaign wants to send message to
     *         in: body
     *         required: true
     *         type: string
     *       - name: userId
     *         description: User's userId. Sample working userId - 58e4475807c7c133ac12799c
     *         in: body
     *         required: true
     *         type: string
     *       - name: includeName
     *         description: whether to include name of person in SMS
     *         in: body
     *         required: true
     *         type: boolean
     *     responses:
     *       200:
     *         description: success json { success - boolean, message - string}
     *       500:
     *         description: json of error. { success - boolean, message - string}
    */
    //1
    app.post('/smsapi/campgns', async function(req,res) {

        var name = req.body.name;
        var groupName = req.body.groupName;
        var userId = req.body.userId;
        var includeName = req.body.includeName;

        logger.info('[campaignController][post:/smsapi/campgns] campgn = ' + name + ' , groupName =  '+ groupName +  ' , userId = '+ userId);
    
        try{
            //1 checkIfNameExists
            const campgn = await Campaigns.find({ campaignName: name, _userId : userId});
            if(campgn.length>0){
                logger.info('[campaignController][post:/smsapi/campgns] Campaign with this name already exists');
                throw new Error('Campaign with this name already exists');
            }

            //2 createAndSaveCampaign
            var newCampgn = new Campaigns({
                campaignName: name,
                _userId : userId,
                groupName: groupName,
                includeName: includeName,
            });

            await newCampgn.save();

            //log activity
            //var activityMsg = 'Group created : '+groupName;
            //activityLogHelper.saveActivityLog(userId, config.Group_Created, activityMsg);

            res.status(200).send({
                success: true,
                message: 'Campaign successfully created and saved',
            });

        }catch(err){
            logger.error('[campaignController][post:/smsapi/campgns] There was error. Error = ' +err.message + ' \nStack = '+err.stack);
            res.status(500).send({
                success: false, 
                message: err.message
            });
            return;
        }

    });

    /**
     * @swagger
     * /smsapi/user/{userid}/campgns:
     *   get:
     *     tags:
     *       - Campaign
     *     description: get all Campaigns for given user
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
     *         description: Json array of campaign objects. { success - boolean, message - string, campaigns- campaigns}
     *         schema:
     *           $ref: '#/definitions/Campaign'
     *       500:
     *         description: json of error. { success - boolean, message - string}
    */    
    //2 get all Campaigns for given user
    app.get('/smsapi/user/:userid/campgns', async function(req,res) {
        
        var userid = req.params.userid;

        if(!userid){
            res.status(500).send({
                success: false, 
                message: 'error processing request, Please provide correct user-id'
            });
            return;
        }

        logger.info('[campaignController][get:/smsapi/user/:userid/campgns] userid ='+ userid);

        try{
            //1 getCampaigns
            const campaigns = await Campaigns.find({_userId: userid});

            res.status(200).send({
                success: true,
                message: 'Campaigns successfully fetched',
                campaigns : campaigns
            });

        }catch(err){
            logger.error('[campaignController][get:/smsapi/user/:userid/campgns] There was error. Error = ' +err.message + ' \nStack = '+err.stack);
            res.status(500).send({
                success: false, 
                message: err.message
            });
            return;
        }

    });

    /**
     * @swagger
     * /smsapi/campgns/{campgnid}:
     *   delete:
     *     tags:
     *       - Campaign
     *     description: delete Campaign object
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: campgnid
     *         description: campgn obj id
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
    //3
    app.delete('/smsapi/campgns/:campgnid', async function(req,res) {
        
        var campgnid = req.params.campgnid;

        if(!campgnid){
            res.status(500).send({
                success: false, 
                message: 'error processing request, Please provide correct Campaign-id'
            });
            return;
        }

        logger.info('[campaignController][delete:/smsapi/campgns/:campgnid] campgnid ='+campgnid);

        try{
            //delete Campaign
            await Campaigns.remove({_id: campgnid});

            res.status(200).send({
                success: true,
                message: 'Campaign successfully deleted',
            });

        }catch(err){
            logger.error('[campaignController][delete:/smsapi/campgns/:campgnid] There was error. Error = ' +err.message + ' \nStack = '+err.stack);
            res.status(500).send({
                success: false, 
                message: err.message
            });
            return;
        }

    });

}