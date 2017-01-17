/*jshint esversion: 6 */
(function() {
  'use strict';
    
  var util = require('util');
  var form = require('./components/form');
  var admin = require('./components/admin');
  var user = require('./components/user');
  var config = require('../config');
  var multer  = require('multer');
  var Appendix = require('../model/appendix');
  var upload = multer({ dest: 'uploads/' })
  var async = require('async');
  var path = require('path');
  var fs = require('fs');
  
  function authenticate(allowedRoles) {
    return function(req, res, next) {
      if (req.isAuthenticated()) {
        var role = req.user.role;
        if(allowedRoles.indexOf(role) != -1){
          next();
        }else{
          res.status(403).send('Go away!');
        }
      } else {
        res.redirect(config.server_root+'/login');
      }
    };
  }
  
  module.exports = function(app){
    
    /*
     * Navigation
     */
     
    app.get(config.server_root, form.viewForm);
    
    app.post(config.server_root+'/upload', upload.array('appendix'), function (req, res, next) {
      var savedFiles = [];
      async.each(req.files, function(file, callback){
        var appendix = new Appendix();
        appendix.originalname = file.originalname;
        appendix.mimetype = file.mimetype;
        appendix.filename = file.filename;
        appendix.save(function(err, appendix){
          if(err){
            callback(err);
          }else{
            savedFiles.push(appendix);
            callback();
          }
        });
      }, function(err){
        if(err){
          res.status(500).send(err);
        }else{
          res.send(savedFiles);
        }
      });
    });
    
    app.get(config.server_root+'/upload/:id', function (req, res) {
      var id = req.params.id;
      Appendix.findById(id, function(err, appendix){
        if(err || !appendix){
          res.status(404).send();
        }else{
          res.set('Content-Type', appendix.mimetype);
          res.sendFile(path.resolve(__dirname+'/../uploads/'+appendix.filename));
        }
      });
    });
    
    app.delete(config.server_root+'/upload/:id', function (req, res) {
      var id = req.params.id;
      Appendix.findById(id, function(err, appendix){
        if(err || !appendix){
          res.status(404).send();
        }else{
          fs.unlink(path.resolve(__dirname+'/../uploads/'+appendix.filename), function(){
            Appendix.findByIdAndRemove(id, function(){
              res.send({status: 'removed'});
            });
          });
        }
      });
    });
    
    app.get(config.server_root+'/login', function(req, res) {
      res.render('login', {
        message : req.flash('loginMessage'),
        root: config.server_root
      });
    });
    
    app.get(config.server_root+'/forgotpassword', function(req, res) {
      res.render('forgotpassword', {root: config.server_root});
    });
    
    app.get(config.server_root+'/changepass', authenticate(['manager', 'admin']), function(req, res) {
      res.render('setpassword', {root: config.server_root});
    });
    
    /*
     * Applications
     */
    app.post(util.format('%s/form', config.server_root), form.createForm);
    app.post(util.format('%s/update', config.server_root), authenticate(['manager', 'admin']), form.updateForm);
    app.get(util.format('%s/form/:id', config.server_root), authenticate(['manager', 'admin']), form.getForm);
    
    /*
     *  Admin
     */
    app.get(config.server_root+'/admin', authenticate(['manager', 'admin']), admin.renderAdminView);
    app.get(config.server_root+'/export', authenticate(['manager', 'admin']), admin.createXlsx);
    
    /*
     * User
     */
    app.post(config.server_root+'/login', user.login);
    app.post(config.server_root+'/signup', authenticate(['admin']), user.create);
    app.get(config.server_root+'/user/list', authenticate(['admin']), user.list);
    app.post(config.server_root+'/user/archieve', authenticate(['admin']), user.archieve);
    app.get(config.server_root+'/logout', user.logout);
    app.post(config.server_root+'/forgotpassword', user.forgotpassword);
    app.get(config.server_root+'/resetpassword/:token', user.resetpassword);
    app.post(config.server_root+'/setpasstoken', user.setpassToken);
    app.post(config.server_root+'/setpass',authenticate(['manager', 'admin']), user.setpass);
    app.get(config.server_root+'/user/manage', authenticate(['admin']), user.manage);
    app.get(config.server_root+'/user/get/:id', authenticate(['admin', 'manager']), user.get);
  };
  
}).call(this);