/*jshint esversion: 6 */
(function () {
  'use strict';

  const util = require('util');
  const form = require(__dirname + '/components/form');
  const admin = require(__dirname + '/components/admin');
  const user = require(__dirname + '/components/user');
  const navigation = require(__dirname + '/components/navigation');
  const upload = require(__dirname + '/components/upload');
  const multer = require('multer');
  const fileParser = multer({ storage: multer.memoryStorage() });
  const config = require(__dirname + '/../config');
  const path = require('path');
  const fs = require('fs');

  function authenticate(allowedRoles) {
    return function (req, res, next) {
      if (req.isAuthenticated()) {
        var role = req.user.role;
        if (allowedRoles.indexOf(role) != -1) {
          next();
        } else {
          res.status(403).send('Go away!');
        }
      } else {
        res.redirect('/login');
      }
    };
  }

  module.exports = function (app) {

    /*
     * Navigation
     */

    app.get(config.server_root, navigation.renderIndex);
    app.get('/login', navigation.renderLogin);
    app.get('/forgotpassword', navigation.renderForgotPass);
    app.get('/changepass', authenticate(['manager', 'admin']), navigation.renderChangePass);

    /*
     * File uploads
     */

    app.post('/upload', fileParser.array('file'), upload.uploadFile);
    app.get('/upload/:id', upload.getFileData);
    app.delete('/upload/:id', upload.removeFile);


    /*
     * Forms
     */

    app.post(util.format('%s/formReply', config.server_root), form.postReply);
    // app.post(util.format('%s/update', config.server_root), authenticate(['manager', 'admin']), form.updateForm);
    
    app.post(util.format('%s/reply', config.server_root), form.postReply);

    /*
     *  Admin
     */

    app.get('/admin', authenticate(['manager', 'admin']), admin.renderAdminView);
    app.get('/export', authenticate(['manager', 'admin']), admin.createXlsx);
    app.get('/admin/users', authenticate(['admin']), admin.renderUserManagementView);
    app.get('/admin/replies/:id', authenticate(['manager', 'admin']), admin.getFormReply);
    
    /*
     * User
     */

    app.post('/login', user.login);
    app.post('/signup', authenticate(['admin']), user.create);
    app.get('/user/list', authenticate(['admin']), user.list);
    app.delete ('/user/:id', authenticate(['admin']), user.archieve);
    app.get('/logout', user.logout);
    app.post('/forgotpassword', user.forgotpassword);
    app.get('/resetpassword/:token', user.resetpassword);
    app.post('/setpasstoken', user.setpassToken);
    app.post('/setpass', authenticate(['manager', 'admin']), user.setpass);
    app.get('/user/get/:id', authenticate(['admin', 'manager']), user.get);
  };

}).call(this);
