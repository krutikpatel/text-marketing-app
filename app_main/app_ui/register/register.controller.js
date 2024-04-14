(function () {
    'use strict';

    angular
        .module('app')
        .controller('RegisterController', RegisterController);

    RegisterController.$inject = ['UserFactory', '$location', '$rootScope','AuthenticationService'];
    
    function RegisterController(UserFactory, $location, $rootScope,AuthenticationService) {
        var vm = this;
        var firstName;
        var lastName;
        var email;
        var password;
        var registerFormSubmitted;
        
        vm.register = register;

        function register(isFormValid) {
            vm.registerFormSubmitted = true;
            if(!isFormValid){
                return;
            }   
            
            var formData = 
            {    
                firstName : vm.firstName,
                lastName : vm.lastName,
                email : vm.email,
                password : vm.password
            }
            
            AuthenticationService.Register(formData, function (result) {
                if (result === true) {
                    $location.path('/');
  
                } else {
                    vm.error = 'Username or password is incorrect';
                    vm.loading = false;
                }
            });
                
        }
    }

})();
