(function () {
    'use strict';

    angular
        .module('app')
        .controller('HomeController', HomeController);

    HomeController.$inject = ['$scope', '$log','UserFactory'];
    
    function HomeController($scope, $log, UserFactory) {
        var vm = this;

        //knote: controller actions to take
        initController();//calling init
        
        //==// 
        //knote: function definitions //
        function initController() {

            
        /*knote:    just  putting promise in service is not working !!!
                    $scope.user = UserFactory.getMemberInfo();
                    console.log($scope.user);//knote: $scope.user is not set yet !!! thus just  putting promise in service is not working !!!
        */            
            UserFactory.getMemberInfo()
            .success(function (response) {
                
                //1
                $scope.user = response.user;
                //console.log('homeCtlr, user id = '+ user[0]._id);
                
                //2
                UserFactory.user = response.user;//knote: this is so far the way setting service/factory data which has worked for me
                //console.log(UserFactory.user);
            })
            .error(function (data, status, headers, config) {
                //error!
            });
            
        }
        
    }

})();