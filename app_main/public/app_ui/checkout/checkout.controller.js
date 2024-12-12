(function () {
    'use strict';

    angular
        .module('app')
        .controller('CheckoutController', CheckoutController);

    CheckoutController.$inject = ['$scope', '$log','BraintreeFactory','UserFactory'];
    
    function CheckoutController($scope, $log,BraintreeFactory,UserFactory) {
        var vm = this;
        var clientToken;
   
        var submit = document.querySelector('input[type="submit"]');

        initController();//calling init
        
        //==// 
        //knote: function definitions //
        function initController() {
            
            //get client token
            BraintreeFactory.getClientToken(UserFactory.user)
            .success(function (response) {
                
                vm.clientToken = response.clientToken;
                braintreeSetup();//call braintree setup once we obtain client token from server
            })
            .error(function (data, status, headers, config) {
                //error!
            });
            
        }//end initController()
        
        function braintreeSetup() {
            braintree.client.create({
              authorization: vm.clientToken //this has to be client token form server
            }, function (err, clientInstance) {
              if (err) {
                console.error(err);
                return;
              }

              braintree.hostedFields.create({
                client: clientInstance,
                styles: {
                  'input': {
                    'font-size': '14px',
                    'font-family': 'helvetica, tahoma, calibri, sans-serif',
                    'color': '#3a3a3a'
                  },
                  ':focus': {
                    'color': 'black'
                  }
                },
                fields: {
                  number: {
                    selector: '#card-number',
                    placeholder: '4111 1111 1111 1111'
                  },
                  cvv: {
                    selector: '#cvv',
                    placeholder: '123'
                  },
                  expirationMonth: {
                    selector: '#expiration-month',
                    placeholder: 'MM'
                  },
                  expirationYear: {
                    selector: '#expiration-year',
                    placeholder: 'YY'
                  },
                  postalCode: {
                    selector: '#postal-code',
                    placeholder: '90210'
                  }
                }
              }, function (err, hostedFieldsInstance) {
                if (err) {
                  console.error(err);
                  return;
                }

                hostedFieldsInstance.on('validityChange', function (event) {
                  var field = event.fields[event.emittedBy];

                  if (field.isValid) {
                    if (event.emittedBy === 'expirationMonth' || event.emittedBy === 'expirationYear') {
                      if (!event.fields.expirationMonth.isValid || !event.fields.expirationYear.isValid) {
                        return;
                      }
                    } else if (event.emittedBy === 'number') {
                      $('#card-number').next('span').text('');
                    }

                    // Apply styling for a valid field
                    $(field.container).parents('.form-group').addClass('has-success');
                  } else if (field.isPotentiallyValid) {
                    // Remove styling  from potentially valid fields
                    $(field.container).parents('.form-group').removeClass('has-warning');
                    $(field.container).parents('.form-group').removeClass('has-success');
                    if (event.emittedBy === 'number') {
                      $('#card-number').next('span').text('');
                    }
                  } else {
                    // Add styling to invalid fields
                    $(field.container).parents('.form-group').addClass('has-warning');
                    // Add helper text for an invalid card number
                    if (event.emittedBy === 'number') {
                      $('#card-number').next('span').text('Looks like this card number has an error.');
                    }
                  }
                });

                hostedFieldsInstance.on('cardTypeChange', function (event) {
                  // Handle a field's change, such as a change in validity or credit card type
                  if (event.cards.length === 1) {
                    $('#card-type').text(event.cards[0].niceType);
                  } else {
                    $('#card-type').text('Card');
                  }
                });

                $('.panel-body').submit(function (event) {
                  event.preventDefault();
                  hostedFieldsInstance.tokenize(function (err, payload) {
                    if (err) {
                      console.error(err);
                      return;
                    }

                    // This is where you would submit payload.nonce to your server
                    BraintreeFactory.submitNonce(payload.nonce,UserFactory.user)
                    .success(function (response) {

                        console.log(response);
                        
                    })
                    .error(function (data, status, headers, config) {
                        //error!
                    });
                      
                      
                  });
                });
              });
            });
            
        }//end braintreeSetup
    }

})();