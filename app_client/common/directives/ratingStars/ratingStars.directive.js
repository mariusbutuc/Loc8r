(function () {

  angular
    .module('loc8rApp')
    .directive('ratingStars', ratingStars);

  function ratingStars () {
    return {
      restrict : 'EA',
      // create an isolate scope
      scope : {
        // The value of '=rating' tells Angular look for an attribute
        // called rating on the same HTML element that defined the directive.
        thisRating : '=rating'
      },
      // As a rule of thumb, unless a directive template is very simple
      // it should exist in its own HTML file.
      templateUrl : '/common/directives/ratingStars/ratingStars.template.html'
    }
  };

})();
