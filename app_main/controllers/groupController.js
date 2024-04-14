var Groups = require('../models/groupModel');
var Users = require('../models/userModel');
var Contacts = require('../models/contactsModel');
var Campaigns = require('../models/campaignModel');
var bodyParser = require('body-parser');//we installed via npm
var logger = require('../logging/logModule');
var activityLogHelper = require('../helpers/activityLogHelper');
var config = require('../config/config');

module.exports = function(app){ //krutikq - we sent app here to get extended, we are adding methods to this object, so that called can use it

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true}));

    //1 - get by name krutikq : will it ever be required?
    app.get('/smsapi/groups/:groupName', async function(req,res) {

        logger.info('[groupController][get:/smsapi/groups/:groupName] groupName=' + req.params.groupName );
        try{
            const group = await Groups.find({ groupName: req.params.groupName});
            res.status(200).send({
                success: true, 
                message: 'Group found',
                group: group,
            });
        }catch(err){
            logger.error('[groupController][get:/smsapi/groups/:groupName] error finding group. error from DB = '+err.message + ' \nStack = '+err.stack);
            res.status(500).send({
                success: false, 
                message: 'There was problem with getting info from db'
            });
        }

    });

    //2 - get by id  krutikq : will it ever be required?
    //URL: smsapi/groups/?groupId=58041616572dc41cc4ffd343
    app.get('/smsapi/groups/', async function(req,res){

        logger.info('[groupController][get:/smsapi/groups] groupId=' + req.query.groupId );
        try{
            const groups = await Groups.findById(req.query.groupId);
            res.status(200).send({
                success: true, 
                message: 'Groups found',
                groups: groups,
            });

        }catch(err){
            logger.error('[groupController][get:/smsapi/groups] error finding group. error from DB = '+err.message + ' \nStack = '+err.stack);
            res.status(500).send({
                success: false, 
                message: 'There was problem with getting info from db'
            });
        }
;
    });

    /**
     * @swagger
     * definitions:
     *   Group:
     *     type: object
     *     required:
     *     properties:
     *       _id:
     *         type: string
     *       groupName:
     *         type: string
     *       _userId:
     *         type: string
     *       note:
     *         type: string
     *         
    */

    /**
     * @swagger
     * /smsapi/user/{userid}/groups:
     *   get:
     *     tags:
     *       - Groups
     *     description: Returns all groups under given userId
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: userId
     *         description: User's userId. Sample working userId - 58e4475807c7c133ac12799c
     *         in: path
     *         required: true
     *         type: string
     *     responses:
     *       200:
     *         description: Json array of group objects. { success - boolean, message - string, groups- groups}
     *         schema:
     *           $ref: '#/definitions/Group'
     *       500:
     *         description: json of error. { success - boolean, message - string}
     */    
    //3 - get groups by userId
    app.get('/smsapi/user/:userid/groups', async function(req,res){

        logger.info('[groupController][get:/smsapi/user/:userid/groups] userid=' + req.params.userid );
        try{
            const groups = await Groups.find({_userId: req.params.userid});
            logger.info('[groupController][get:/smsapi/user/:userid/groups] groups found =  '+groups.length);
            res.status(200).send({
                    success: true, 
                    message: 'Groups found',
                    groups: groups,
            });
        }catch(err){
            logger.error('[groupController][get:/smsapi/user/:userid/groups] error finding group. error from DB = '+err.message + ' \nStack = '+err.stack);
            res.status(500).send({
                success: false, 
                message: 'There was problem with getting info from db'
            });
        }

    });

    /**
     * @swagger
     * /smsapi/groups:
     *   post:
     *     tags:
     *       - Groups
     *     description: Create group object with passed info
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
     *     responses:
     *       200:
     *         description: success json { success - boolean, message - string, group- newGroup}
     *         schema:
     *           $ref: '#/definitions/Group'
     *       500:
     *         description: json of error. { success - boolean, message - string}
     *       400:
     *         description: json of error. { success - boolean, message - Bad request, error- Group name exist already}
     */
    //4 - post group
    /*
        Cannot allow user to create group with same name, otherwise there is no point
    */
    app.post('/smsapi/groups', async function(req,res){

        var groupName = req.body.groupName;
        var userId = req.body._userId;
        logger.info('[groupController][post:/smsapi/groups] groupName =  '+ groupName);

        try{
            //todo: find by groupname AND userID, diff users can have same group names !
            const groups = await Groups.find({groupName: groupName});

            if(groups.length==0)        //if not found then only create
            {
                logger.info('[groupController][post:/smsapi/groups] group noe found so creating one');
                                        /* krutikq 
                                            Note: the order of elems did not matter, its not matching with schema
                                        */
                var newGroup = new Groups({
                    groupName: groupName,
                    note: req.body.todo,
                    _userId : userId,
                    totalContacts : req.body.totalContacts,
                    //lastSent: --? krutikq  : since not setting it now, this field does not exits at this time in doc in db

                });

                try{
                    await newGroup.save();
                }catch(err){
                    logger.error('[groupController][post:/smsapi/groups] error saving new group. error from DB = '+err.message + ' \nStack = '+err.stack);
                    res.status(500).send({
                        success: false, 
                        message: 'There was problem with getting info from db'
                    });
                }

                //log activity
                var activityMsg = 'Group created : '+groupName;
                activityLogHelper.saveActivityLog(userId, config.Group_Created, activityMsg);

                res.status(200).send({
                    success: true, 
                    message: 'Group successfully created',
                    group: newGroup,
                });

            }//end if groups
            else{
                res.status(400).send({
                    success: false, 
                    message: 'Bad request, error: Group name exist already',
                });
            }
        }catch(err){
            logger.error('[groupController][post:/smsapi/groups] error finding group. error from DB = '+err.message + ' \nStack = '+err.stack);
            res.status(500).send({
                success: false, 
                message: 'There was problem with getting info from db'
            });
        }
    });

    //5 PUT - update
    app.put('/smsapi/groups', async function(req,res){
        
        logger.info('[groupController][put:/smsapi/groups] group Id ='+req.body.id);
        if(req.body.id){                            //id has to be passed to update existing group
            try{
                const groupOrig = await findById(req.body.id);
                await Groups.findByIdAndUpdate(req.body.id, {
                    groupName: req.body.groupName,      //pass whole json object
                    note: req.body.note,
                     
                                                        /*
                                                        krutikq ?????? do i need to set all props of object?
                                                        Ans: No, db still kept other props as they were
                                                        */ 
                });

                //Also update Campaigns that use this groupName
                const userId = groupOrig._userId;
                const campgns = await Campaigns.find({_userId : userId});
                
                for(const campgn in campgns){
                    if(campgn.groupName === groupOrig.groupName)
                        await Campaigns.findByIdAndUpdate(campgn._id, {groupName:req.body.groupName});
                }

                res.status(200).send({
                    success: true, 
                    message: 'Group updated'
                });

            }catch(err){
                logger.error('[groupController][put:/smsapi/groups] error updating group. error from DB = '+err.message + ' \nStack = '+err.stack);
                res.status(500).send({
                    success: false, 
                    message: 'There was problem with getting info from db'
                });
            }
        }
        else
            res.status(400).send({
                        success: false, 
                        message: 'Bad request, : no id sent'
            });
     });

    /**
     * @swagger
     * /smsapi/users/{userId}/groups/{groupId}:
     *   delete:
     *     tags:
     *       - Groups
     *     description: deletes group with passed groupId under passed userId
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: userId
     *         description: User's userId. Sample working userId - 58e4475807c7c133ac12799c
     *         in: path
     *         required: true
     *         type: string
     *       - name: groupId
     *         description: groupId under given userId
     *         in: path
     *         required: true
     *         type: string
     *     responses:
     *       200:
     *         description: success json { success - boolean, message - string}
     *       500:
     *         description: json of error. { success - boolean, message - string}
     */
    //6 - DELETE
    app.delete('/smsapi/users/:userId/groups/:groupId', async function(req,res){

        logger.info('[groupController][delete:/smsapi/users/:userId/groups/:groupId] userId ='+ req.params.userId +' and groupId = ' + req.params.groupId);
                            //ref: http://stackoverflow.com/questions/23794640/delete-object-from-array-by-given-id-in-in-mongoose
        
        var userId = req.params.userId;
        var groupId = req.params.groupId;
        try{
             //1. remove group from user array
            await Users.findByIdAndUpdate({ _id: userId}, {
                
                 $pull: {groups: req.params.groupId} 
            });

        }catch(err){
            logger.error('[groupController][delete:/smsapi/users/:userId/groups/:groupId] error updating User. error from DB = '+err.message + ' \nStack = '+err.stack);
            res.status(500).send({
                success: false, 
                message: 'There was problem with getting info from db'
            });
        }      

        logger.info('[groupController][delete:/smsapi/users/:userId/groups/:groupId] remove group from user array done');

        var group = null;
        try{
            //2 find group
            group = await Groups.findById(groupId);

            if(group)
            {           
                var groupName = group.groupName;
                logger.info('[groupController][delete:/smsapi/users/:userId/groups/:groupId] groupName to be deleted = ' + groupName);

                //3 remove from group DB       ref: http://mongoosejs.com/docs/api.html#query_Query-remove
                const groups = await Groups.remove({ _id: req.params.groupId});

                logger.info('[groupController][delete:/smsapi/users/:userId/groups/:groupId] groupName deleted ');
                //log activity
                var activityMsg = 'Group deleted : '+groupName;
                activityLogHelper.saveActivityLog(userId, config.Group_Deleted, activityMsg);

                //4 remove group from contacts db, each contact's group array'
                try{
                    const result = await Contacts.update({groups: groupName}, 
                                { $pull: {groups: groupName } }, 
                                {multi: true},);
                    //handle it
                    logger.info('[groupController][delete:/smsapi/users/:userId/groups/:groupId] contacts update with group removed, result = ' + JSON.stringify(result));

                }catch(err){
                    throw new Error('Error while updating contacts');
                }

            } else{
                throw new Error('group is NULL');
            }

            res.status(200).send({
                success: true, 
                message: 'Delete group done'
            });

        }catch(err){
            logger.error('[groupController][delete:/smsapi/users/:userId/groups/:groupId] error finding or removing group. error from DB = '+err.message + ' \nStack = '+err.stack);
            res.status(500).send({
                success: false, 
                message: 'There was problem with getting info from db'
            });
        }

    });   


}    