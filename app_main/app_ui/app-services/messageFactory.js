(function(){
    'use strict';
    
    angular
        .module('app')
        .factory('MessageFactory', MessageFactory);
    
    MessageFactory.$inject = ['$http', '$localStorage','ConfigFactory'];
    
    function MessageFactory($http, $localStorage,ConfigFactory){
    
        var groups;
        var factory = {};
        var urlBase = ConfigFactory.baseAppUrl + 'smsapi';
        
        factory.sendMessageToGroup = sendMessageToGroup;
        
        return factory;
        
        //==//
        function sendMessageToGroup(user,group,message){
            
            //smsapi/users/:userId/groups/:groupName/sendsms
            return $http.post(urlBase + '/users/'+user._id + '/groups/'+ group.groupName +'/sendsms' ,{groupName: group.groupName, message: message});
        }
        
    };//end factory

})();