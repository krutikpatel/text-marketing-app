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
        if (process.env.BACKENDURL !== undefined)
            factory.baseAppUrl = BACKENDURL
        else    
            factory.baseAppUrl = 'http://localhost:80/';//for local machine
        
        //factory.baseAppUrl = 'https://d018456e.ngrok.io/' ; //ngrok
        
        return factory;
        
        //==//
        
        
    };//end factory

})();