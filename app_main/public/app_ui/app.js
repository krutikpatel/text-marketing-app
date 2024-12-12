(function () {
    'use strict';

    angular
        .module('app', [ 'ngMessages', 'ui.router', 'ngStorage', 'ngCookies', 'ngStorage'])//,'ngMockE2E'])
        .config(config) //knote: config of "app" module
        .run(run);      //knote: run method of "app" module i guess

    function config($stateProvider, $urlRouterProvider,$httpProvider) { //$routeProvider, $locationProvider) {    //knote: angular provided inbuilt providers, that we will configure here. See thats why config name makes sense

        // default route
        $urlRouterProvider.otherwise("/");
        //$urlRouterProvider.otherwise("/login");

        // app routes
        $stateProvider
            .state('home', {
                url: '/',
                templateUrl: 'app_ui/home/home.view.html',
                controller: 'HomeController',
                controllerAs: 'vm'
            })
            /*
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
            */
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
    
    function run($rootScope, $http, $location, $localStorage, $cookies) { //knote: angular provided factories
        console.log("app.run");

        console.log("all cookies = "+$cookies.getAll());
        //print all cookies in loop
        var allCookies = $cookies.getAll();
        //console.log("allCookies = "+JSON.stringify(allCookies));
        console.log(typeof allCookies); // Check the type of allCookies

        for (var key in allCookies) {
            console.log("key = "+key);
            if (allCookies.hasOwnProperty(key)) {
                console.log(key + " -> " + allCookies[key]);
            }
        }
        
/*
        //if cookie not set then redirect to login page
        if (!$cookies.get('token')) {
            console.log("token not found");
            //$location.path('/login');
            var baseUrl = $location.absUrl().split('#')[0].split('/app')[0];
            console.log("baseUrl = "+baseUrl);
            if(baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0,-1);
            
            //window.location.href = baseUrl + '/login';//ejs view
        } else {
            console.log("token found");
        }
*/
//if ($localStorage.jwt) {
if (window.localStorage.getItem('jwt')) {   //this works
    console.log("token found");
    //$http.defaults.headers.common.Authorization = 'Bearer ' + $localStorage.jwt;
    $localStorage.jwt = window.localStorage.getItem('jwt');
    $http.defaults.headers.common.Authorization = 'Bearer ' + $localStorage.jwt;
} else {
    console.log("token not found");
    //$location.path('/login');
    var baseUrl = $location.absUrl().split('#')[0].split('/app')[0];
    console.log("baseUrl = "+baseUrl);
    if(baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0,-1);
    //window.location.href = baseUrl + '/login';//ejs view
}

/*
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
*/
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