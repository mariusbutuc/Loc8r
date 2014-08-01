var mongoose = require('mongoose'),

    LocationModel = mongoose.model('Location'),

    theEarth = (function() {
      var earthRadius = 6371; // km, miles is 3959

      var getDistanceFromRads = function(rads) {
        return parseFloat(rads * earthRadius);
      };

      var getRadsFromDistance = function(distance) {
        return parseFloat(distance / earthRadius);
      };

      return {
        getDistanceFromRads : getDistanceFromRads,
        getRadsFromDistance : getRadsFromDistance
      };
    })();

// utility functions

var sendJsonResponse = function (res, status, content) {
  res.status(status);
  res.json(content);
};

var doAddReview = function(req, res, location) {
  if (!location) {
    sendJsonResponse(res, 404, {
      "message" : "locationid not found"
    });
  } else {
    location.reviews.push({
      author: {
        displayName: req.body.author
      },
      rating: req.body.rating,
      reviewText: req.body.reviewText
    });

    location.save(function(err, location) {
      var thisReview;
      if (err) {
        sendJsonResponse(res, 404, err);
      } else {
        updateAverageRating(location._id);
        thisReview = location.reviews[location.reviews.length - 1];
        sendJsonResponse(res, 201, thisReview);
      }
    });
  }
};

var updateAverageRating = function(locationid) {
  LocationModel
    .findById(locationid)
    .select('rating reviews')
    .exec(function(err, location) {
      if (!err) {
        doSetAverageRating(location);
      }
    });
};

var doSetAverageRating = function(location) {
  var i, reviewCount, ratingAverage, ratingTotal;
  if (location.reviews && location.reviews.length > 0) {
    reviewCount = location.reviews.length;
    ratingTotal = 0;
    for (i = 0; i < reviewCount; i++) {
      ratingTotal = ratingTotal + location.reviews[i].rating;
    }

    ratingAverage = parseInt(ratingTotal / reviewCount, 10);
    location.rating = ratingAverage;
    location.save(function(err) {
      if (err) {
        console.log(err);
      } else {
        console.log("Average rating updated to: ", ratingAverage);
      }
    });
  }
};

// locations

module.exports.locationsCreate = function (req, res) {
  var lng = parseFloat(req.body.lng),
      lat = parseFloat(req.body.lat);

  LocationModel.create({
    name: req.body.name,
    address: req.body.address,
    facilities: req.body.facilities.split(","),
    coords: [lng, lat],
    // TODO: put into a loop checking for the existence of the values.
    openingTimes: [{
      days: req.body.days1,
      opening: req.body.opening1,
      closing: req.body.closing1,
      closed: req.body.closed1,
    }, {
      days: req.body.days2,
      opening: req.body.opening2,
      closing: req.body.closing2,
      closed: req.body.closed2,
    }]
  }, function(err, location) {
    if (err) {
      sendJsonResponse(res, 400, err);
    } else {
      sendJsonResponse(res, 201, location);
    }
  });
};

module.exports.locationsReadOne = function (req, res) {
  if (req.params && req.params.locationid) {
    LocationModel
      .findById(req.params.locationid)
      .exec(function(err, location) {
        if (!location) {
          sendJsonResponse(res, 404, {
            "message": "locationid not found"
          });
          return;
        } else if (err) {
          sendJsonResponse(res, 404, err);
          return;
        }
        sendJsonResponse(res, 200, location);
      });
  } else {
    sendJsonResponse(res, 404, {
      "message": "No locationid in the request"
    });
  }
};

module.exports.locationsUpdateOne = function (req, res) {
  if(!req.params.locationid) {
    sendJsonResponse(res, 404, {
      "message": "Noy found, locationid is required"
    });
    return;
  }

  LocationModel
    .findById(req.params.locationid)
    .select('-reviews -ratings')    // retrieve all but the dashed ones
    .exec(function(err, location) {
      if(!location) {
        sendJsonResponse(req, 400, {
          "messsage": "locationid not found"
        });
      } else if (err) {
        sendJsonResponse(res, 400, err);
        return;
      }

      location.name = req.body.name;
      location.address = req.body.address;
      location.facilities = req.body.facilities.split(",");
      location.coords = [ parseFloat(req.body.lng), parseFloat(req.body.lat)];
      // TODO iterate nicely over the openingTimes
      location.openingTimes = [{
        days: req.body.days1,
        opening: req.body.opening1,
        closing: req.body.closing1,
        closed: req.body.closed1,
      }, {
        days: req.body.days2,
        opening: req.body.opening2,
        closing: req.body.closing2,
        closed: req.body.closed2,
      }];

      location.save(function(err, location) {
        if (err) {
          sendJsonResponse(res, 404, err);
        } else {
          sendJsonResponse(res, 200, location);
        }
      });
    });
};

module.exports.locationsDeleteOne = function (req, res) {
  var locationid = req.params.locationid;
  if (locationid) {
    LocationModel
      .findByIdAndRemove(locationid)
      .exec(function(err, location) {
        if (err) {
          sendJsonResponse(res, 404, err);
          return;
        }

        sendJsonResponse(res, 204, null);
      });
  } else {
    sendJsonResponse(res, 404, {
      "message": "No locationid"
    });
  }
};

module.exports.locationsListByDistance = function (req, res) {
  var lng = parseFloat(req.query.lng),
      lat = parseFloat(req.query.lat),
      point = {
        type: "Point",
        coordinates: [lng, lat]
      },
      geoOptions = {
        spherical: true,
        maxDistance: theEarth.getRadsFromDistance(req.query.maxDistance),
        num: 10
      };

  // What if someone happened to be on the equator or on the Prime Meridian
  // (that’s the Greenwich Mean Time line)? They should not receive an API error
  if ((!lng && lng !== 0) || (!lat && lat !== 0)) {
    sendJsonResponse(res, 404, {
      "message": "lng and lat parameters are required"
    });
    return;
  }

  LocationModel.geoNear(point, geoOptions, function(err, results, stats) {
    var locations = [];
    if (err) {
      sendJsonResponse(res, 404, err);
    } else {
      results.forEach(function(doc) {
        locations.push({
          distance: theEarth.getDistanceFromRads(doc.dis),
          name: doc.obj.name,
          address: doc.obj.address,
          rating: doc.obj.rating,
          facilities: doc.obj.facilities,
          _id: doc.obj._id
        });
      });

      sendJsonResponse(res, 200, locations);
    }
  });
};

// reviews;

module.exports.reviewsCreate = function (req, res) {
  // TODO: extract `req.params.locationid` into a variable?
  if (req.params.locationid) {
    LocationModel
      .findBy(req.params.locationid)
      .select('reviews')
      .exec( function(err, location) {
        if (err) {
          sendJsonResponse(res, 400, err);
        } else {
          doAddReview(req, res, location);
        }
      });
  } else {
    sendJsonResponse(res, 404, {
      "message": "Not found, locationid required"
    });
  }
};

module.exports.reviewsReadOne = function (req, res) {
  if (req.params && req.params.locationid && req.params.reviewid) {
    LocationModel
      .findById(req.params.locationid)
      .select('name reviews')
      .exec(
        function(err, location) {
          var response, review;
          if (!location) {
            sendJsonResponse(res, 404, {
              "message": "locationid not found"
            });
            return;
          } else if (err) {
            sendJsonResponse(res, 404, err);
            return;
          }

          if (location.reviews && location.reviews.length > 0) {
            review = location.reviews.id(req.params.reviewid);
            if (!review) {
              sendJsonResponse(res, 404, {
                "message": "reviewid not found"
              });
            } else {
              response = {
                location : {
                  name : location.name,
                  id : req.params.locationid
                },
                review : review
              };
              sendJsonResponse(res, 200, response);
            }
          } else {
            sendJsonResponse(res, 404, {
              "message": "No reviews found"
            });
          }
        }
      );
  } else {
    sendJsonResponse(res, 404, {
      "message": "Not found: both locationid and reviewid are required"
    });
  }
};

module.exports.reviewsUpdateOne = function (req, res) {
  if (!req.params.locationid || !req.params.reviewid) {
    sendJsonResponse(res, 404, {
      "message": "Not found, locationid and reviewid are both required"
    });
    return;
  }

  LocationModel
    .findById(req.params.locationid)
    .select('reviews')
    .exec(function(err, location) {
      var thisReview;
      if (!location) {
        sendJsonResponse(res, 404, {
          "message": "locationid not found"
        });
        return;
      } else if (err) {
        sendJsonResponse(res, 400, err);
        return;
      }
      if(location.reviews && location.reviews.length > 0) {
        thisReview = location.reviews.id(req.params.reviewid);
        if (!thisReview) {
          sendJsonResponse(res, 404, {
            "message": "reviewid not found"
          });
        } else {
          thisReview.author.displayName = req.body.author;
          thisReview.rating = req.body.rating;
          thisReview.reviewText = req.body.reviewText;
          location.save(function(err, location) {
            if (err) {
              sendJsonResponse(res, 404, err);
            } else {
              updateAverageRating(location._id);
              sendJsonResponse(res, 200, thisReview);
            }
          });
        }
      } else {
        sendJsonResponse(res, 404, {
          "message": "No review to update"
        });
      }
    });
};

module.exports.reviewsDeleteOne = function (req, res) {
  if (!req.params.locationid || !req.params.rewiewid) {
    sendJsonResponse(res, 404, {
      "message": "Not found, locationid and reviewid are both required"
    });
    return;
  }

  LocationModel
    .findById(req.params.locationid)
    .select('reviews')
    .exec(function (err, location) {
      if (!location) {
        sendJsonResponse(res, 404, {
          "message" : "locationid not found"
        });
        return;
      } else if (err) {
        sendJsonResponse(res , 400, err);
        return;
      }

      if (location.reviews && location.reviews.length > 0) {
        if (!location.reviews.id(req.params.reviewid)) {
          sendJsonResponse(res, 404, {
            "message" : "reviewid not found"
          });
        } else {
          location.reviews.id(req.param.reviewid).remove();
          location.save(function (err) {
            if (err) {
              sendJsonResponse(res, 404, err);
            } else {
              updateAverageRating(location._id);
              sendJsonResponse(res, 204, null);
            }
          });
        }
      } else {
        sendJsonResponse(res, 404, {
          "message" : "No review to delete"
        });
      }
    });
}
