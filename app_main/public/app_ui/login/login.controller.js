(function () {
    'use strict';

    angular
        .module('app')
        .controller('LoginController', LoginController);

    LoginController.$inject = ['$scope','$location', 'AuthenticationService'];
    
    function LoginController($scope,$location, AuthenticationService) {
        var vm = this;
        vm.login = login;

        initController();

        function initController() {
            // reset login status
            AuthenticationService.Logout();

            console.log('LoginController.initController: ');
        };

        function login() {
            console.log('LoginController.initController: login');
            vm.loading = true;
            AuthenticationService.LoginOauth(vm.username, vm.password, function (result) {
                if (result === true) {
                    console.log('LoginController.login: result = '+result);
                    $location.path('/smsapp/memberinfo');
                    //window.location = '/';
                } else {
                    vm.error = 'Username or password is incorrect';
                    vm.loading = false;
                }
            });
        };
    }

})();