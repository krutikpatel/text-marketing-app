(function () {
    'use strict';

    angular
        .module('app')
        .controller('SendMessageController', SendMessageController);

    SendMessageController.$inject = ['$scope', '$log','UserFactory','GroupsFactory','MessageFactory'];
    
    function SendMessageController($scope, $log, UserFactory, GroupsFactory,MessageFactory) {
        var vm = this;
        var selectedGroup;
        var message;
        var sendMsgFormSubmitted;
        vm.sendMessage = sendMessage;
        
        //alert related vars
        var alertType;
        var showAlert = false;
        var resSendMsg;
        //
        initController();//calling init
        
        //==//
        function initController() {
            
            vm.resSendMsg = '';//clear msg
            
            if(!$scope.groups)//this might be initialized by groups controller
            {    
                GroupsFactory.getGroups(UserFactory.user)//knote: $scope.user works BUT UserFactory.user does not !!!
                .success(function (response) {
                    //1 scope
                    $scope.groups = response.groups;

                })
                .error(function (data, status, headers, config) {
                    //error!
                });
            }
            
        }
        
        function sendMessage(isFormValid){
            
            vm.sendMsgFormSubmitted = true;//for error message appearing
            if(!isFormValid)
            {
                //error!
                vm.resSendMsg = 'Form is invalid, please correct the form';
                vm.alertType = 'danger';
                vm.showAlert = true;

                return;
            }
            
            MessageFactory.sendMessageToGroup(UserFactory.user,vm.selectedGroup, vm.message)
                .success(function (response) {
                    
                    vm.resSendMsg = response.message;
                    vm.alertType = 'success';
                    vm.showAlert = true;
                })
                .error(function (data, status, headers, config) {
                    //error!
                    vm.resSendMsg = 'There was a problem while sending messages, please try again';
                    vm.alertType = 'danger';
                    vm.showAlert = true;
                });
            
        }
    }

})();