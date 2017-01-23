/*jshint esversion: 6 */
(function () {
  'use strict';

  const form = require(__dirname + '/components/form');
  const admin = require(__dirname + '/components/admin');
  const user = require(__dirname + '/components/user');
  const navigation = require(__dirname + '/components/navigation');
  const upload = require(__dirname + '/components/upload');
  const multer = require('multer');
  const fileParser = multer({ storage: multer.memoryStorage() });
  const config = require(__dirname + '/../config');
  
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

    app.get("/", navigation.renderIndex);
    app.get('/login', navigation.renderLogin);
    app.get('/forgotpassword', navigation.renderForgotPass);
    
    /*
     * File uploads
     */

    app.post('/upload', fileParser.array('file'), upload.uploadFile);
    app.get('/upload/:id', upload.getFileData);
    app.delete('/upload/:id', upload.removeFile);


    /*
     * Forms
     */

    app.post('/formReply', form.postReply);
    // app.post('/update', authenticate(['manager', 'admin']), form.updateForm);
    
    app.post('/reply', form.postReply);

    /*
     *  Admin
     */

    app.get('/admin', authenticate(['manager', 'admin']), admin.renderAdminView);
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
    app.get('/resetpassword/:token', user.getResetpassword);
    app.post('/resetpassword/:token', user.postResetpassword);
    
    app.get('/changepass', authenticate(['manager', 'admin']), user.getChangePass);
    app.post('/changepass', authenticate(['manager', 'admin']), user.postChangePass);
    
    app.get('/user/get/:id', authenticate(['admin', 'manager']), user.get);
  };

}).call(this);
