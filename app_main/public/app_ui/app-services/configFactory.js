(function(){
    'use strict';
    
    angular
        .module('app')
        .factory('ConfigFactory', ConfigFactory);
    
    ConfigFactory.$inject = ['$http', '$localStorage'];
    
    function ConfigFactory($http, $localStorage){
        
        var factory = {};
        
        //if (process.env.NODE_ENV !== 'production') //Note: process is not defined for angular app. its only meant for nodejs app
        //    factory.baseAppUrl = 'https://textraction.herokuapp.com/';//for cloud
        //
        //if (process.env.BACKENDURL !== undefined) // UI code does not have access to process.env
        //    factory.baseAppUrl = BACKENDURL
        //else    

        //ktemp: commenting for local testing
        //factory.baseAppUrl = 'http://smsalb1-1172469992.us-east-1.elb.amazonaws.com/';//URL must end with slash / and port 80 for local machine
        factory.baseAppUrl = 'http://localhost:3000/';//URL must end with slash / 
        //factory.baseAppUrl = 'https://d018456e.ngrok.io/' ; //ngrok
        
        return factory;
        
        //==//
        
        
    };//end factory

})();