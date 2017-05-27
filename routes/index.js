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
  
  function authenticate(allowedRoles, keycloak) {
    if (keycloak) {
      return keycloak.protect((token, req) => {
        for (let i = 0; i < allowedRoles.length; i++) {
          if (token.hasRole(allowedRoles[i])) {
            return true;
          }
        }
        
        return false;
      });
    } else {
      return (req, res, next) => {
        if (req.isAuthenticated()) {
          const role = req.user.role;
          if (allowedRoles.indexOf(role) !== -1) {
            next();
          } else {
            res.status(403).send('Go away!');
          }
        } else {
          res.redirect('/login');
        }
      };
    }
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

  module.exports = function (app, keycloak) {

    /*
     * Navigation
     */

    app.get("/", navigation.renderIndex);
    
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
    app.put('/formReply/:id', authenticate(['manager', 'admin'], keycloak), form.putReply);
    
    app.post('/reply', form.postReply);

    /*
     *  Admin
     */

    app.get('/admin', authenticate(['manager', 'admin'], keycloak), admin.renderAdminView);
    app.get('/admin/users', authenticate(['admin'], keycloak), admin.renderUserManagementView);
    app.get('/admin/replies/:id', authenticate(['manager', 'admin'], keycloak), admin.getFormReply);
    app.get('/admin/fields', authenticate(['manager', 'admin'], keycloak), admin.getFields);
    app.get('/admin/export/xlsx', authenticate(['manager', 'admin'], keycloak), admin.createXlsx);
    
    /*
     * User
     */

    if (!keycloak) {
      app.get('/login', navigation.renderLogin);
      app.post('/login', user.login);
      app.get('/forgotpassword', navigation.renderForgotPass);
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
    }
  };

}).call(this);
