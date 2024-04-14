(function(){
    'use strict';
    
    angular
        .module('app')
        .factory('UserFactory', UserFactory);//knote: name of function below
    
    UserFactory.$inject = ['$http', '$localStorage','ConfigFactory'];
    
    function UserFactory($http, $localStorage,ConfigFactory){
      
        var user;
        var factory = {};//knote: this object name is not much relavant in registration
        var urlBase = ConfigFactory.baseAppUrl + 'smsapp';
        
        factory.getUser = getUser;
        factory.getUser2 = getUser2;
        factory.getMemberInfo = getMemberInfo;
        
        return factory;
        
        //==//
        function getUser() {
            return user;
        }
        
        function getMemberInfo() {
/*knote:            
            user = $http.get(urlBase + '/memberinfo');//knote: http Authorization header was automatically added with received JWT token
            
            return user;//knote: user at this time is "promise" object, and NOT just plain user json object. If you console.log(user), you will see
*/

/*            
            var promise = $http.get(urlBase + '/memberinfo')//knote: http Authorization header was automatically added with received JWT token
            .success(function (retUser) {
                
                //1
                user = retUser[0];//knote : this is not working for some reason
                
                console.log('inside userfactory');
                
                //both available
                //console.log(retUser[0]);
                //console.log(user);
                
                //return user;
            })
            .error(function (data, status, headers, config) {
                //error!
            });
            
            return promise;
*/
            return $http.get(urlBase + '/memberinfo')//knote: http Authorization header was automatically added with received JWT
            
        };
        
        function getUser2(email) {
            user = $http.get(urlBase + '/users/:' + email);
            return user;
        };
    
        
    };//end factory

})();//knote: DONT FORGET LAST () WHICH MAKES IT IIFE IGUESS, MY FACTORY COULD NOT BE FOUND BY CONTROLLER JUST BECAUSE OF THAT, AND APP KEPT GETTING ERROR: 
//Error: [$injector:unpr] Unknown provider: UserFactoryProvider <- UserFactory <- HomeController