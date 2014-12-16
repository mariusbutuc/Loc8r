(function () {

  angular
    .module('loc8rApp')
    .controller('homeCtrl', homeCtrl);

  // Manually inject dependencies to protect against minification
  homeCtrl.$inject = ['$scope', 'loc8rData', 'geolocation'];
  function homeCtrl ($scope, loc8rData, geolocation) {
    // use ViewModel
    var vm = this;
    vm.pageHeader = {
      title: 'Loc8r',
      strapline: 'Find places to work with wifi near you!'
    };

    vm.sidebar = {
      content: "Looking for wifi and a seat? Loc8r helps you find places to work \
        when out and about. Perhaps with coffee, cake or a pint? Let Loc8r help \
        you find the place you're looking for."
    };

    // TODO: take it to the next level by including an ajax spinner
    vm.message = 'Checking your location...';

    // the native geolocation API passes a ‘position’ object to this callback
    vm.getData = function(position) {
      var lat = position.coords.latitude,
          lng = position.coords.longitude;
      vm.message = 'Searching for nearby places';

      loc8rData.locationByCoords(lat, lng)
        .success(function(data){
          vm.message = data.length > 0 ? '' : 'No locations found';
          vm.data = { locations: data };
        })
        .error(function(e) {
          vm.message = 'Sorry, something\'s gone wrong';
        });
    }

    // if geolocation is supported but not successful, the native geolocation API
    // passes an ‘error’ object to the callback containing a message property
    vm.showError = function(error) {
      $scope.$apply(function() {
        vm.message = error.message;
      });
    };

    vm.noGeo = function() {
      $scope.$apply(function() {
        vm.message = 'Geolocation not supported by this browser.';
      });
    };

    // As a rule, any code that's interacting with APIs, running logic or
    // performing operations should be externalized into services.
    // Leave the controller to control the services, rather than perform the
    // functions.
    geolocation.getPosition(vm.getData, vm.showError, vm.noGeo);
  }

})();
