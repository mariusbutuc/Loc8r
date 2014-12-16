(function () {

  angular
    .module('loc8rApp')
    .filter('formatDistance', formatDistance);

  var _isNumeric = function (n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  };

  function formatDistance () {
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
  }

})();
