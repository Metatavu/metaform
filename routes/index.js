/*jshint esversion: 6 */
/* global __dirname */

(function () {
  'use strict';

  const form = require(__dirname + '/components/form');
  const admin = require(__dirname + '/components/admin');
  const user = require(__dirname + '/components/user');
  const navigation = require(__dirname + '/components/navigation');
  const upload = require(__dirname + '/components/upload');
  const multer = require('multer');
  const gridFsStorage = require(__dirname + '/../multer/gridfs-storage');
  const fileParser = multer({ storage: gridFsStorage() });
  
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
  
  function extendTimeout(timeout) {
    return (req, res, next) => {
      res.setTimeout(timeout, () => {
        console.log('Request has timed out.');
        res.send(408);
      });
      next();
    };
  }

  module.exports = function (app) {

    /*
     * Navigation
     */

    app.get("/", navigation.renderIndex);
    app.get('/login', navigation.renderLogin);
    app.get('/forgotpassword', navigation.renderForgotPass);
    
    /*
     * File uploads
     */

    app.post('/upload', extendTimeout(1000 * 60 * 60), fileParser.array('file'), upload.uploadFile);
    app.get('/upload/:id', upload.getFileData);
    app.delete('/upload/:id', upload.removeFile);


    /*
     * Forms
     */

    app.post('/formReply', form.postReply);
    app.put('/formReply/:id', authenticate(['manager', 'admin']), form.putReply);
    
    app.post('/reply', form.postReply);

    /*
     *  Admin
     */

    app.get('/admin', authenticate(['manager', 'admin']), admin.renderAdminView);
    app.get('/admin/users', authenticate(['admin']), admin.renderUserManagementView);
    app.get('/admin/replies/:id', authenticate(['manager', 'admin']), admin.getFormReply);
    app.get('/admin/fields', authenticate(['manager', 'admin']), admin.getFields);
    app.get('/admin/export/xlsx', authenticate(['manager', 'admin']), admin.createXlsx);
    
    /*
     * User
     */

    app.post('/login', user.login);
    app.post('/signup', authenticate(['admin']), user.create);
    app.get('/user/list', authenticate(['admin']), user.list);
    app.delete ('/user/:id', authenticate(['admin']), user.archieve);
    app.get('/logout', user.logout);
    app.post('/forgotpassword', user.forgotpassword);
    app.get('/resetpassword/:token', user.getResetpassword);
    app.post('/resetpassword/:token', user.postResetpassword);
    
    app.get('/changepass', authenticate(['manager', 'admin']), user.getChangePass);
    app.post('/changepass', authenticate(['manager', 'admin']), user.postChangePass);
    
    app.get('/user/get/:id', authenticate(['admin', 'manager']), user.get);
  };

}).call(this);
