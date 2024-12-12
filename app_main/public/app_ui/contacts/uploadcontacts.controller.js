(function () {
    'use strict';

    angular
        .module('app')
        .controller('UploadContactsController', UploadContactsController);

    UploadContactsController.$inject = ['$scope', '$log','UserFactory','UploadFactory','GroupsFactory'];
    
    function UploadContactsController($scope, $log, UserFactory, UploadFactory, GroupsFactory) {
        var vm = this;
        var fileToSend;
        var selectedGroup;
        var colIndex;
        var uploadContactsFormSubmitted;
        vm.uploadContactsFile = uploadContactsFile;
        
        //alert related vars
        var alertType;
        var showAlert = false;
        var resUploadContacts;
        
        //knote: controller actions to take
        initController();//calling init
        
        //==// 
        function initController() {
            
            vm.resUploadContacts = '';
            
            if(!$scope.groups)//this might be initialized by groups controller
            {    
                GroupsFactory.getGroups(UserFactory.user)
                .success(function (response) {
                    //1 scope
                    $scope.groups = response.groups;

                })
                .error(function (response, status, headers, config) {
                    //error!
                });
            }

        }
        
        function uploadContactsFile(isFormValid){
            vm.uploadContactsFormSubmitted = true;//for error message appearing
            if(!isFormValid)
            {
                //error!
                vm.resUploadContacts = 'Form is invalid, please correct the form';
                vm.alertType = 'danger';
                vm.showAlert = true;

                return;
            }
            
            UploadFactory.uploadContactsFile(vm.fileToSend, UserFactory.user,vm.selectedGroup.groupName,vm.colIndex)
            .success(function (response) {
                
                vm.resUploadContacts = response.message;
                vm.alertType = 'success';
                vm.showAlert = true;
            })
            .error(function (response, status, headers, config) {
                //error!
                vm.resUploadContacts = 'There was a problem with uploading or processing file, please try again';
                vm.alertType = 'danger';
                vm.showAlert = true;
            });
            
         
        }
        
    }

})();