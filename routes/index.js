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
  const async = require('async');
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
        res.redirect(config.server_root + '/login');
      }
    };
  }

  module.exports = function (app) {

    /*
     * Navigation
     */

    app.get(config.server_root, navigation.renderIndex);
    app.get(config.server_root + '/login', navigation.renderLogin);
    app.get(config.server_root + '/forgotpassword', navigation.renderForgotPass);
    app.get(config.server_root + '/changepass', authenticate(['manager', 'admin']), navigation.renderChangePass);

    /*
     * File uploads
     */

    app.post(config.server_root + '/upload', fileParser.array('appendix'), upload.uploadFile);
    app.get(config.server_root + '/upload/:id', upload.getFileData);
    app.delete(config.server_root + '/upload/:id', upload.removeFile);


    /*
     * Forms
     */

    app.post(util.format('%s/form', config.server_root), form.createForm);
    app.post(util.format('%s/update', config.server_root), authenticate(['manager', 'admin']), form.updateForm);
    app.get(util.format('%s/form/:id', config.server_root), authenticate(['manager', 'admin']), form.getForm);

    /*
     *  Admin
     */

    app.get(config.server_root + '/admin', authenticate(['manager', 'admin']), admin.renderAdminView);
    app.get(config.server_root + '/export', authenticate(['manager', 'admin']), admin.createXlsx);

    /*
     * User
     */

    app.post(config.server_root + '/login', user.login);
    app.post(config.server_root + '/signup', authenticate(['admin']), user.create);
    app.get(config.server_root + '/user/list', authenticate(['admin']), user.list);
    app.post(config.server_root + '/user/archieve', authenticate(['admin']), user.archieve);
    app.get(config.server_root + '/logout', user.logout);
    app.post(config.server_root + '/forgotpassword', user.forgotpassword);
    app.get(config.server_root + '/resetpassword/:token', user.resetpassword);
    app.post(config.server_root + '/setpasstoken', user.setpassToken);
    app.post(config.server_root + '/setpass', authenticate(['manager', 'admin']), user.setpass);
    app.get(config.server_root + '/user/manage', authenticate(['admin']), user.manage);
    app.get(config.server_root + '/user/get/:id', authenticate(['admin', 'manager']), user.get);
  };

}).call(this);
