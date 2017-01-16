var passport = require('passport');
var generatePassword = require('password-generator');
var mailer = require('../../services/mailer');
var User = require('../../model/user');
var config = require('../../config');
var ResetToken = require('../../model/resetToken');

exports.login = passport.authenticate('local-login', {
  successRedirect : config.server_root+'/admin',
  failureRedirect : config.server_root+'/login',
  failureFlash : false
});

exports.create = function(req, res) {
  var email = req.body.email;
  var password = generatePassword(12, false);
  var role = req.body.role;
  User.findOne({ 'email' : email }, function(err, user) {
    if(err){
      res.status(500).send(err);
    }else{
      if(user){
        res.status(400).send('Email already exists');
      }else{
        var newUser = new User();
        newUser.email = email;
        newUser.password = newUser.generateHash(password);
        newUser.role = role;
        
        newUser.save(function(err, user){
          if(err){
            res.status(500).send(err);
          }else{
              var resetToken = new ResetToken();
              resetToken.user_id = user._id;
              resetToken.token = resetToken.generateToken();
              resetToken.expires = new Date().getTime()+ 172800000;
              resetToken.save(function(err, resetToken){
                if(err){
                  res.status(500).send(err);
                }else{
                  var resetUrl = 'http://'+req.headers.host+config.server_root+'/resetpassword/'+encodeURIComponent(resetToken.token);
                  mailer.sendMail(email, 'Kesäpesti - käyttäjätili', 'Sinullle on luotu käyttäjätili Kesäpesti - sovellukseen. Käy aktivoimassa tilisi osoitteessa: ' +
                    resetUrl + ' Tämä kutsu vanhenee 48 tunnin kuluttua.');
                  res.redirect(config.server_root+'/user/manage');
                }
              });

          }
        }); 
      }
    }    
  });
};

exports.list = function(req, res) {
  User.find({}, function(err, users){
    if(err){
      res.status(500).send(err);
    }else{
      res.send(users);
    }
  });
};

exports.logout = function(req, res) {
  req.logout();
  res.redirect(config.server_root);
};

exports.manage = function(req, res){
  res.render('usermanagement', {user : req.user, root: config.server_root, query: {state: '', primaryRequest: '', secondaryRequest: ''}, positions: config.positions});
};

exports.archieve = function(req, res){
  var id = req.body.id;
  User.findById(id, function(err, user){
    if(err){
      res.status(500).send(err);
    }else{
      user.archieved = true;
      user.save(function(err, user){
        if(err){
          res.status(500).send(err);
        }else{
          res.send(user);
        }
      });
    }
  });
};

exports.get = function(req, res){
  var id = req.param('id');
  User.findById(id, function(err, user){
    if(err){
      res.status(500).send(err);
    }else{
      delete user.password;
      res.send(user);
    }
  });
};

exports.forgotpassword = function(req, res) {
  var email = req.body.email;
  User.findOne({email: email}, function(err, user){
    if(err){
      res.status(500).send(err);
    }else{
      if(typeof(user) === 'undefined'){
        res.status(400).send();
      }else{
        var resetToken = new ResetToken();
        resetToken.user_id = user._id;
        resetToken.expires = new Date().getTime() + 3600000;
        resetToken.token = resetToken.generateToken();
        resetToken.save(function(err, resetToken){
          if(err){
            res.status(500).send(err);
          }else{
            var resetUrl = 'http://'+req.headers.host+config.server_root+'/resetpassword/'+encodeURIComponent(resetToken.token);
            mailer.sendMail(email, 'Salasanan palautus', 'Olet pyytänyt salasanasi palautusta Kesäpesti - sovelluksessa, voit palauttaa salasanasi menemällä osoitteeseen: ' +
                resetUrl + ' Jos et ole pyytänyt salasanan palautusta, voit jättää tämän viestin huomiotta.');
            res.send('success');
          }
        });
      }
    }
  });
};

exports.resetpassword = function(req, res){
  var token = req.param('token');
  ResetToken.findOne({
    token: token
  }, function(err, resetToken){
    if(err) {
      res.status(500).send(err);
    }else{
      if(resetToken.isValid(token)){
        res.render('resetpassword', { token : resetToken.token, root: config.server_root });
      }else{
        res.status(403).send('Go away!');
      }
    }
  });
};

exports.setpassToken = function(req, res) {
  var pass = req.body.pass;
  if (req.body.pass2 !== pass) {
    res.status(400).send('passwords dont match');
  } else {
    ResetToken.findOne({
      token: req.body.token
    }, function(err, resetToken){
      if(err) {
        res.status(500).send(err);
      }else{
        User.findById(resetToken.user_id, function(err, user){
          if(err){
            res.status(500).send(err);
          }else{
            user.password = user.generateHash(pass);
            user.save(function(err, user){
              if(err){
                res.status(500).send(err);
              }else{
                res.redirect(config.server_root+'/login');
              }
            });
          }
        });
      }
    });
  }
};

exports.setpass = function(req, res) {
  var oldpass = req.body.old_pass;
  var pass = req.body.pass;
  if (req.body.pass2 !== pass) {
    res.status(400).send('passwords dont match');
  } else {
    User.findById(req.user._id, function(err, user){
      if(err){
        res.status(500).send(err);
      }else{
        if(!user.validPassword(oldpass)){
          res.status(403).send('wrong password');
        }else{
          user.password = user.generateHash(pass);
          user.save(function(err, user){
            if(err){
              res.status(500).send(err);
            }else{
              res.redirect(config.server_root+'/admin');
            }
          });
        }
      }
    })
  }
};
