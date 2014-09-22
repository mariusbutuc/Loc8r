angular.module('loc8rApp', []);

var locationListCtrl = function ($scope, loc8rData, geolocation) {
  // TODO: take it to the next level by including an ajax spinner
  $scope.message = 'Checking your location...';

  // the native geolocation API passes a ‘position’ object to this callback
  $scope.getData = function(position) {
    var lat = position.coords.latitude,
        lng = position.coords.longitude;
    $scope.message = 'Searching for nearby places';

    loc8rData.locationByCoords(lat, lng)
      .success(function(data){
        $scope.message = data.length > 0 ? '' : 'No locations found';
        $scope.data = { locations: data };
      })
      .error(function(e) {
        $scope.message = 'Sorry, something\'s gone wrong';
      });
  }

  // if geolocation is supported but not successful, the native geolocation API
  // passes an ‘error’ object to the callback containing a message property
  $scope.showError = function(error) {
    $scope.$apply(function() {
      $scope.message = error.message;
    });
  };

  $scope.noGeo = function() {
    $scope.$apply(function() {
      $scope.message = 'Geolocation not supported by this browser.';
    });
  };

  // As a rule, any code that's interacting with APIs, running logic or
  // performing operations should be externalized into services.
  // Leave the controller to control the services, rather than perform the
  // functions.
  geolocation.getPosition($scope.getData, $scope.showError, $scope.noGeo);
};

var loc8rData = function ($http) {
  var locationByCoords = function(lat, lng) {
    query_api = '/api/locations?lng=' + lng + '&lat=' + lat + '&maxDistance=50000'

    return $http.get(query_api);
  }

  return {
    locationByCoords : locationByCoords
  }
};

var geolocation = function () {
  var getPosition = function (cbSuccess, cbError, cbNoGeo) {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(cbSuccess, cbError);
    } else {
      cbNoGeo();
    }
  };

  return {
    getPosition : getPosition
  };
};

var _isNumeric = function (n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
};

var formatDistance = function() {
  // To be used as an Angular filter, the formatDistance function must
  // return a function that accept the distance parameter,
  // rather than accepting it itself.
  return function (distance) {
    var numDistance, unit;
    if (distance && _isNumeric(distance)) {
      if (distance > 1) {
        numDistance = parseFloat(distance).toFixed(1);
        unit = 'km';
      } else {
        numDistance = parseInt(distance * 1000,10);
        unit = 'm';
      }
      return numDistance + unit;
    } else {
      return "?";
    }
  };
};

var ratingStars = function() {
  return {
    // create an isolate scope
    scope : {
      // The value of '=rating' tells Angular look for an attribute
      // called rating on the same HTML element that defined the directive.
      thisRating : '=rating'
    },
    // As a rule of thumb, unless a directive template is very simple
    // it should exist in its own HTML file.
    templateUrl : '/angular/rating-stars.html'
  }
};

angular
  .module('loc8rApp')
  .controller('locationListCtrl', locationListCtrl)
  .filter('formatDistance', formatDistance)
  .directive('ratingStars', ratingStars)
  .service('loc8rData', loc8rData)
  .service('geolocation', geolocation);
