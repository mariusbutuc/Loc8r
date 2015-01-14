(function () {

  angular
    .module('loc8rApp')
    .service('loc8rData', loc8rData);

  loc8rData.$inject = ['$http'];
  function loc8rData ($http) {
    var locationByCoords = function(lat, lng) {
      query_api = '/api/locations?lng=' + lng + '&lat=' + lat + '&maxDistance=50000'
      return $http.get(query_api);
    };

    var locationById = function(locationid) {
      return $http.get('/api/locations/' + locationid);
    };

    return {
      locationByCoords : locationByCoords,
      locationById: locationById
    };
  };

})();
