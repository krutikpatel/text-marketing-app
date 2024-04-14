/*
var JwtStrategy = require('passport-jwt').Strategy;
 
// load up the user model
var Users = require('../models/userModel');
var config = require('../config/index'); // get db config file
 
module.exports = function(passport) {
  var opts = {};
  opts.secretOrKey = config.secret;
  passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
    
    Users.findOne({email : jwt_payload.id}, function(err, user) {
          if (err) {
              return done(err, false);
          }
          if (user) {
              done(null, user);
          } else {
              done(null, false);
          }
    });

  }));
};

*/

var JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;

// load up the user model
var Users = require('../models/userModel');
var config = require('../config/config'); // get db config file

module.exports = function(passport) {
    var opts = {};
    //opts.jwtFromRequest = ExtractJwt.fromAuthHeader();
    opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
    opts.secretOrKey = config.secret;
    /*
    passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
        Users.findOne({id: jwt_payload.id}, function(err, user) {
            if (err) {
                return done(err, false);
            }
            if (user) {
                done(null, user);
            } else {
                done(null, false);
                // or you could create a new account
            }
        });
    }));
    */
    passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
        Users.findOne({id: jwt_payload.sub}, function(err, user) {
            if (err) {
                return done(err, false);
            }
            if (user) {
                return done(null, user);
            } else {
                return done(null, false);
                // or you could create a new account
            }
        });
    }));

    //these allow user to stay logged-in between pages
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });
    //these allow user to stay logged-in between pages
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

}