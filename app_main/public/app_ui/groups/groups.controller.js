(function () {
    'use strict';

    angular
        .module('app')
        .controller('GroupsController', GroupsController);

    GroupsController.$inject = ['$scope', '$log','GroupsFactory', 'UserFactory'];
    
    function GroupsController($scope, $log, GroupsFactory,UserFactory) {
        var vm = this;
        vm.submitNewGroup = submitNewGroup;
        var group_name;
        var group_note;
        var createGroupFormSubmitted;
        
        //alert related vars
        var alertType;
        var showAlert = false;
        var resGroupCreated;
        //
        initController();

        // methods
        function initController() {
            
            vm.resGroupCreated = '';
            
            GroupsFactory.getGroups(UserFactory.user)//knote: $scope.user works BUT UserFactory.user does not !!!
            .success(function (response) {
                //1
                $scope.groups = response.groups;
                
            })
            .error(function (data, status, headers, config) {
                //error!
            });

        }
        
        function submitNewGroup(isFormValid){
            vm.createGroupFormSubmitted = true;//for error message appearing
            if(!isFormValid)
            {
                
                //error!
                vm.resGroupCreated = 'Form is invalid, please correct the form';
                vm.alertType = 'danger';
                vm.showAlert = true;
                
                //alert('Form is invalid, please correct the form');
                return;
            }
            
            //if form is valid then proceed
            var group = {
                groupName: vm.group_name,
                _userId : UserFactory.user._id,
                note: vm.group_note,
                totalContacts: 0,
                //lastSent: Date
            };
            
            GroupsFactory.createGroup(group)
            .success(function (response) {    //knote : this is response message

                vm.resGroupCreated = response.message;//'Group Successfully Created';
                vm.alertType = 'success';
                vm.showAlert = true;
            })
            .error(function (data, status, headers, config) {
                //error!
                vm.resGroupCreated = 'There was a problem while creating group, please try again';
                vm.alertType = 'danger';
                vm.showAlert = true;
            });
        };
    }

})();