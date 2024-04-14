(function () {
    'use strict';

    //knote: this is actually a factory
    angular
        .module('app')
        .factory('AuthenticationService', AuthenticationService);

    AuthenticationService.$inject = ['$http', '$localStorage', 'ConfigFactory'];
    
    function AuthenticationService($http, $localStorage,ConfigFactory) {
        var service = {};

        service.Login = Login;
        service.Logout = Logout;
        service.Register = Register;
        
        return service;

        function Login(username, password, callback) {
            
            console.log("hello");
            
            ///api/authenticate
            //http://localhost:3000/login
            $http.post(ConfigFactory.baseAppUrl + 'login', { email: username, password: password }) //knote: dont forget to add http in url while testing locally with nodejs running separately and ui from brackets
                .success(function (response) {
                    // login successful if there's a token in the response
                    if (response.token) {
                        // store username and token in local storage to keep user logged in between page refreshes
                        $localStorage.currentUser = { email: username, token: response.token };

                        // add jwt token to auth header for all requests made by the $http service
                        //$http.defaults.headers.common.Authorization = 'Bearer ' + response.token;
                        $http.defaults.headers.common.Authorization = response.token;
                        
                        // execute callback with true to indicate successful login
                        callback(true);
                    } else {
                        // execute callback with false to indicate failed login
                        callback(false);
                    }
                })
                .error(function (response, status, headers, config) {
                    //error!
                     callback(false);
                });
                
        }

        function Logout() {
            // remove user from local storage and clear http auth header
            delete $localStorage.currentUser;
            $http.defaults.headers.common.Authorization = '';
        }
        
        function Register(formData, callback) {
            
            console.log("inside register");
            
            $http.post(ConfigFactory.baseAppUrl + 'signup', {
                    'firstName': formData.firstName,
                    'lastName' : formData.lastName,
                    'email' : formData.email,
                    'password' : formData.password
                })
                .success(function (response) {
                    // login successful if there's a token in the response
                    if (response.token) {
                        // store username and token in local storage to keep user logged in between page refreshes
                        $localStorage.currentUser = { email: formData.email, token: response.token };

                        // add jwt token to auth header for all requests made by the $http service
                        //$http.defaults.headers.common.Authorization = 'Bearer ' + response.token;
                        $http.defaults.headers.common.Authorization = response.token;
                        
                        // execute callback with true to indicate successful login
                        callback(true);
                    } else {
                        // execute callback with false to indicate failed login
                        callback(false);
                    }
                });
        }

    }
})();