/*jshint esversion: 6 */
(function () {
  'use strict';
  
  const util = require('util');
  const passport = require('passport');
  const generatePassword = require('password-generator');
  const Form = require(__dirname + '/../../form');
  const mailer = require('../../services/mailer');
  const User = require('../../model/user');
  const ResetToken = require('../../model/resettoken');
  const pug = require('pug');
  
  exports.login = passport.authenticate('local-login', {
    successRedirect : '/admin',
    failureRedirect : '/login',
    failureFlash : false
  });
  
  exports.create = function(req, res) {
    var email = req.body.email;
    var password = generatePassword(12, false);
    var role = req.body.role;
    User.findOne({ 'email' : email }, function(err, user) {
      if(err){
        res.status(500).send(err);
      } else {
        if (user) {
          res.status(400).send('Email already exists');
        } else {
          var newUser = new User();
          newUser.email = email;
          newUser.password = newUser.generateHash(password);
          newUser.role = role;
          
          newUser.save(function(err, user){
            if (err) {
              res.status(500).send(err);
            } else {
              var resetToken = new ResetToken();
              resetToken.user_id = user._id;
              resetToken.token = resetToken.generateToken();
              resetToken.expires = new Date().getTime()+ 172800000;
              resetToken.save(function(err, resetToken){
                if (err) {
                  res.status(500).send(err);
                } else {
                  var viewModel = Form.viewModel();
                  var activateLink = util.format("%s://%s/resetpassword/%s", req.secure ? 'https' : 'http', req.headers.host, encodeURIComponent(resetToken.token));
                  var emailContent = pug.renderFile(util.format('%s/../../views/mails/newuser.pug', __dirname), { 
                    viewModel: viewModel,
                    activateLink: activateLink
                  });
                  
                  mailer.sendMail(email, util.format('%s - Uusi käyttäjätili', viewModel.title), emailContent);
                  res.redirect('/admin/users');
                }
              });
            }
          }); 
        }
      }    
    });
  };
  
  exports.list = function(req, res) {
    User.find({}, function(err, users) {
      if(err){
        res.status(500).send(err);
      }else{
        res.send(users);
      }
    });
  };
  
  exports.logout = function(req, res) {
    req.logout();
    res.redirect("/");
  };
  
  exports.archieve = function(req, res){
    var id = req.param('id');
    User.findById(id, function(err, user){
      if(err){
        res.status(500).send(err);
      }else{
        user.archived = true;
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
      if (err) {
        res.status(500).send(err);
      } else {
        if (!user) {
          res.status(400).send('Sähköpostosoitteella ei löytynyt käyttäjää');
        } else {
          var resetToken = new ResetToken();
          resetToken.user_id = user._id;
          resetToken.expires = new Date().getTime() + 3600000;
          resetToken.token = resetToken.generateToken();
          resetToken.save(function(err, resetToken){
            if (err) {
              res.status(500).send(err);
            } else {
              var resetLink = util.format("%s://%s/resetpassword/%s", req.secure ? 'https' : 'http', req.headers.host, encodeURIComponent(resetToken.token));
              var emailContent = pug.renderFile(util.format('%s/../../views/mails/forgotpassword.pug', __dirname), { 
                viewModel: Form.viewModel(),
                resetLink: resetLink
              });
              
              mailer.sendMail(email, 'Salasanan palautus.', emailContent);
              res.send('success');
            }
          });
        }
      }
    });
  };
  
  exports.getResetpassword = function(req, res){
    var token = decodeURIComponent(req.params.token);
    
    ResetToken.findOne({
      token: token
    }, function(err, resetToken) {
      if (err) {
        res.status(500).send(err);
      } else {
        if (!resetToken) {
          res.status(403).send('Virheellinen linkki');
          return;
        }
        
        if (resetToken.isValid(token)) {
          res.render('resetpassword', { token : resetToken.token });
        } else {
          res.status(403).send('Virheellinen linkki');
        }
      }
    });
  };
  
  exports.postResetpassword = function(req, res) {
    var pass = req.body.pass;
    var token = decodeURIComponent(req.params.token);
    
    if (!token) {
      return res.status(400).render('resetpassword', {
        message: 'Virheellinen linkki',
        token: token
      });
    }
    
    if (!pass) {
      return res.status(400).render('resetpassword', {
        message: 'Ole hyvä ja syötä salasana',
        token: token
      });
    }
    
    if (req.body.pass2 !== pass) {
      return res.status(400).render('resetpassword', {
        message: 'Salasanan eivät täsmää',
        token: token
      });
    } else {
      ResetToken.findOne({
        token: token
      }, function(err, resetToken){
        if (err) {
          res.status(500).send(err);
        } else {
          if (!resetToken) {
            return res.status(400).render('resetpassword', {
              message: 'Virheellinen tai vanhentunut linkki.',
              token: token
            });
          }
          
          User.findById(resetToken.user_id, function(err, user){
            if (err) {
              return res.status(400).render('resetpassword', {
                message: 'Virheellinen tai vanhentunut linkki.'
              });
            } else {
              user.password = user.generateHash(pass);
              user.save(function(err) {
                if (err) {
                  return res.status(500).render('resetpassword', {
                    message: err,
                    token: token
                  });
                }else{
                  res.redirect('/login');
                }
              });
            }
          });
        }
      });
    }
  };

  
  exports.getChangePass = (req, res) => {
    res.render('setpassword', { });
  }
  
  exports.postChangePass = function(req, res) {
    var oldpass = req.body.old_pass;
    var pass = req.body.pass;
    if (req.body.pass2 !== pass) {
      return res.status(500).render('setpassword', {
        message: 'Salasanat eivät täsmää'
      });
    } else {
      User.findById(req.user._id, function(err, user){
        if (err) {
          return res.status(500).render('setpassword', {
            message: err
          });
        }else{
          if(!user.validPassword(oldpass)){
            return res.status(403).render('setpassword', {
              message: 'Väärä salasana'
            });
          }else{
            user.password = user.generateHash(pass);
            user.save(function(err, user){
              if (err) {
                return res.status(500).render('setpassword', {
                  message: err
                });
              } else {
                res.redirect('/admin');
              }
            });
          }
        }
      })
    }
  }
}).call(this);