/**
* @desc order directive that is specific to the order module at a company named Acme
* @example <div acme-order-calendar-range></div>
*/

(function () {
    'use strict';
    
    angular
        .module('app')
        .directive('kngFilemodel', kngFilemodel);

    kngFilemodel.$inject = ['$parse'];
    
    function kngFilemodel($parse) {
        
        /* implementation details */
        var directive = {
            restrict: 'A',

            link: linkFunc,
            
            controller: 'UploadContactsController', // knote: This would be 'ExampleController' (the exported controller name, as string)
                                                    // since we refer to a defined controller in its separate file.
            
            controllerAs: 'vm',     //knote: thus any var declared as vm.xxx will be added to bound controller, in this case 'UploadContactsController'
            
            bindToController: true  // because the scope is isolated
        };

        return directive;           //knote: This is directive object that contains all info abt directive
        
        function linkFunc(scope, element, attributes, controller) {//knote: 4th param is controller, pre-decided by angular itself
            
            var model = $parse(attributes.kngFilemodel);//knote: look for attribute named  "kngFilemodel" on this html element
            var modelSetter = model.assign;
            
            element.bind('change', function(){
                scope.$apply(function(){
                    modelSetter(scope,element[0].files[0])//knote: we are looking for vm.fileread (from html),
                                                            //and assign value (filename) to it
                    
                    //console.log(controller.fileToSend.name);
                })
            })
            
        }
    }

    
})();