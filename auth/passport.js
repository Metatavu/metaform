var LocalStrategy = require('passport-local').Strategy;

var User = require('../model/user');

module.exports = function(passport) {

  // =========================================================================
  // passport session setup ==================================================
  // =========================================================================

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });

  // =========================================================================
  // LOGIN ===================================================================
  // =========================================================================

  passport.use('local-login', new LocalStrategy({
    usernameField : 'email',
    passwordField : 'password',
    passReqToCallback : true
  }, function(req, email, password, done) {
    User.findOne({
      'email' : email
    }, function(err, user) {
      if (err)
        return done(err);

      if (!user)
        return done(null, false, req.flash('loginMessage', 'No user found.'));

      if (!user.validPassword(password))
        return done(null, false, req.flash('loginMessage',
            'Oops! Wrong password.'));

      if(user.archieved)
        return done(null, false, req.flash('loginMessage', 'Account has been archieved.'))
      
      return done(null, user);
    });

  }));
};