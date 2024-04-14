(function(){
    'use strict';
    
    angular
        .module('app')
        .factory('GroupsFactory', GroupsFactory);
    
    GroupsFactory.$inject = ['$http', '$localStorage', 'ConfigFactory'];
    
    function GroupsFactory($http, $localStorage,ConfigFactory){

        var factory = {};
        var urlBase = ConfigFactory.baseAppUrl + 'smsapi';
        
        factory.getGroups = getGroups;
        factory.createGroup = createGroup;
        return factory;
        
        //==//
        function getGroups(user) {
            
            return $http.get(urlBase + '/user/' + user._id + '/groups');
            
        };
        
        function createGroup(group){
            
            return $http.post(urlBase + '/groups',group);
        }
        
    };//end factory

})();