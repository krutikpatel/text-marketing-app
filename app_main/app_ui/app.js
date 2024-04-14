(function () {
    'use strict';

    angular
        .module('app', [ 'ngMessages', 'ui.router', 'ngStorage'])//,'ngMockE2E'])
        .config(config) //knote: config of "app" module
        .run(run);      //knote: run method of "app" module i guess

    function config($stateProvider, $urlRouterProvider,$httpProvider) { //$routeProvider, $locationProvider) {    //knote: angular provided inbuilt providers, that we will configure here. See thats why config name makes sense

        // default route
        $urlRouterProvider.otherwise("/");

        // app routes
        $stateProvider
            .state('home', {
                url: '/',
                templateUrl: 'app_ui/home/home.view.html',
                controller: 'HomeController',
                controllerAs: 'vm'
            })
            .state('login', {
                url: '/login',
                templateUrl: 'app_ui/login/login.view.html',
                controller: 'LoginController',
                controllerAs: 'vm'
            })
            .state('register', {
                url: '/register',
                templateUrl: 'app_ui/register/register.view.html',
                controller: 'RegisterController',
                controllerAs: 'vm'
            })
            .state('home.groups', {
                url: '/groups',
                templateUrl: 'app_ui/groups/groups.view.html',
                controller: 'GroupsController',
                controllerAs: 'vm'
            })
            .state('home.creategroup', {
                url: '/creategroup',
                templateUrl: 'app_ui/groups/creategroup.view.html',
                controller: 'GroupsController',
                controllerAs: 'vm'
            })
            .state('home.groups.creategroup', {
                url: '/creategroup',
                templateUrl: 'app_ui/groups/creategroup.view.html',
                controller: 'GroupsController',
                controllerAs: 'vm'
            })
            .state('home.sendmessage', {
                url: '/sendmessage',
                templateUrl: 'app_ui/send_messages/sendmessage.view.html',
                controller: 'SendMessageController',
                controllerAs: 'vm'
            })
            .state('home.uploadcontacts', {
                url: '/uploadcontacts',
                templateUrl: 'app_ui/contacts/uploadcontacts.view.html',
                controller: 'UploadContactsController',
                controllerAs: 'vm'
            })
            .state('home.checkout', {
                url: '/checkout',
                templateUrl: 'app_ui/checkout/checkoutcustom.view.html',
                controller: 'CheckoutController',
                controllerAs: 'vm'
        });

        //401 interceptor
        /*
        Ref:
            http://stackoverflow.com/questions/25041929/angularjs-routeprovider-http-status-403
            https://blog.thesparktree.com/angularjs-interceptors-globally-handle-401-and
            https://bneijt.nl/blog/post/angularjs-intercept-api-error-responses/
        */
        //$httpProvider.interceptors.push('responseObserver');
            $httpProvider.interceptors.push(function ($q,$location){
                return {
                    response: function(response){
                        if (response.status === 403) {
                            console.log("Response 401");
                        }
                        return response || $q.when(response);
                    },
                    responseError: function(rejection) {
                        if (rejection.status === 401) {
                            console.log("Response Error 401",rejection);
                            $location.path('/login').search('returnTo', $location.path());
                        }
                        return $q.reject(rejection);
                    }
                }
            });

    }
    
    function run($rootScope, $http, $location, $localStorage) { //knote: angular provided factories

        // keep user logged in after page refresh
        if ($localStorage.currentUser) {
            //$http.defaults.headers.common.Authorization = 'Bearer ' + $localStorage.currentUser.token;
            $http.defaults.headers.common.Authorization = $localStorage.currentUser.token;
        }

        // redirect to login page if not logged in and trying to access a restricted page
        $rootScope.$on('$locationChangeStart', function (event, next, current) {
            var publicPages = ['/login','/register'];
            var restrictedPage = publicPages.indexOf($location.path()) === -1;
            if (restrictedPage && !$localStorage.currentUser) {
                $location.path('/login');
            }
        });

    }

    function responseObserver($q,$location){
        return {
            response: function(response){
                if (response.status === 403) {
                    console.log("Response 401");
                }
                return response || $q.when(response);
            },
            responseError: function(rejection) {
                if (rejection.status === 401) {
                    console.log("Response Error 401",rejection);
                    $location.path('/login').search('returnTo', $location.path());
                }
                return $q.reject(rejection);
            }
        }
    }

})();