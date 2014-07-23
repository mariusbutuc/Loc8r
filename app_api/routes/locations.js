/*

ACTION                                METHOD  PATH                            PARAMS                  EXAMPLE

CREATE  a new location                POST    /locations                                              http://api.loc8r.com/locations/
READ    a list of several locations   GET     /locations                                              http://api.loc8r.com/locations/
READ    a specific location           GET     /locations                      locationId              http://api.loc8r.com/locations/123
UPDATE  a specific location           PUT     /locations                      locationId              http://api.loc8r.com/locations/123
DELETE  a specific location           DELETE  /locations                      locationId              http://api.loc8r.com/locations/123

CREATE  a new review                  POST    /locations/locationid/reviews                           http://api.loc8r.com/locations/123/reviews/
READ    a list of several reviews     GET     /locations/locationid/reviews                           http://api.loc8r.com/locations/123/reviews/
READ    a specific review             GET     /locations/locationid/reviews   locationId, reviewId    http://api.loc8r.com/locations/123/reviews/abc
UPDATE  a specific review             PUT     /locations/locationid/reviews   locationId, reviewId    http://api.loc8r.com/locations/123/reviews/abc
DELETE  a specific review             DELETE  /locations/locationid/reviews   locationId, reviewId    http://api.loc8r.com/locations/123/reviews/abc

*/
var ctrl = require('../controllers/locations');

module.exports = function(app) {
  // locations
  app.get('/api/locations', ctrl.locationsListByDistance);
  app.post('/api/locations', ctrl.locationsCreate);
  app.get('/api/locations/:locationid', ctrl.locationsReadOne);
  app.put('/api/locations/:locationid', ctrl.locationsUpdateOne);
  app.delete('/api/locations/:locationid', ctrl.locationsDeleteOne);

  // reviews
  app.post('/api/locations/:locationid/reviews', ctrl.reviewsCreate);
  app.get('/api/locations/:locationid/reviews/:reviewid', ctrl.reviewsReadOne);
  app.put('/api/locations/:locationid/reviews/:reviewid', ctrl.reviewsUpdateOne);
  app.delete('/api/locations/:locationid/reviews/:reviewid', ctrl.reviewsDeleteOne);
}
