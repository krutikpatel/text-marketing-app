(function(){
    'use strict';
    
    angular
        .module('app')
        .factory('BraintreeFactory', BraintreeFactory);
    
    BraintreeFactory.$inject = ['$http', '$localStorage', 'ConfigFactory'];
    
    function BraintreeFactory($http, $localStorage,ConfigFactory){

        var factory = {};
        var urlBase = ConfigFactory.baseAppUrl + 'smsapi/payment';
        
        factory.getClientToken = getClientToken;
        factory.submitNonce = submitNonce;
        
        return factory;
        
        //==//
        function getClientToken(user) {
            
            //return $http.get(urlBase + '/user/' + user._id + '/groups');
            return $http.get(urlBase + '/client_token',{userId: user._id});
            
        };
        
        function submitNonce(nonce,user){
            //main
            //return $http.post(urlBase + '/checkout',{payment_method_nonce:nonce, userId : user._id});
            //return $http.post(urlBase + '/subscribe',{payment_method_nonce:nonce, userId : user._id});
            
            //return $http.post(urlBase + '/updatecard',{payment_method_nonce:nonce, userId : user._id});
            //return $http.post(urlBase + '/test',{payment_method_nonce:nonce, userId : user._id});
            
            return $http.post(urlBase + '/changesubscription',{payment_method_nonce:nonce, userId : user._id});
        }
        
    };//end factory

})();