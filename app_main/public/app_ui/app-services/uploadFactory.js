(function(){
    'use strict';
    
    angular
        .module('app')
        .factory('UploadFactory', UploadFactory);
    
    UploadFactory.$inject = ['$http', '$localStorage','ConfigFactory'];
    
    function UploadFactory($http, $localStorage,ConfigFactory){
    
        var factory = {};
        var urlBase = ConfigFactory.baseAppUrl + 'smsapi';
        
        factory.uploadContactsFile = uploadContactsFile;
        
        return factory;
        
        //==//
        function uploadContactsFile(file, user,groupName, colIndex){
            
            console.log('upload called');
            console.log(file.name);
            
            var fd = new FormData();
            fd.append('fileSent', file);//knote: VImp, use same name in nodejs multer middleware: app.upload.single('fileSent')
            fd.append('userId', user._id);
            fd.append('groupName', groupName);
            //fd.append('phoneNoColumn', 0);
            fd.append('phoneNoColumn', colIndex);
            
            
            console.log('inside upload factory');
            console.log(file);
            var fullUrl = urlBase + '/users/upload';
            
            return $http.post(fullUrl, fd, {
                transformRequest: angular.identity, //knote: we dont want angular to serialize data
                headers: {'Content-Type': undefined } //knote: let browser handle it itself

            });
            
            
        }
        
    };//end factory

})();