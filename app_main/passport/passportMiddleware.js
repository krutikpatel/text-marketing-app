var passport = require("pasport"), LocalStrategy = require('passport-local').Strategy;
var Users = require('../models/userModel');

//=============THIS FILE NOT USED ====== FROM PASSPORT DOCS 
passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  },
  function(username, password, done) {
    Users.findOne({ email: username }, function(err, user) {
      if (err) { return done(err); }
      
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      
      if (!user.validPassword(password)) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      
      return done(null, user);
    });
  }
));
