var form = require(__dirname + '');
var admin = require(__dirname + '/components/admin');
var user = require(__dirname + '/components/user');
var navigation = require(__dirname + '/components/navigation');
var upload = require(__dirname + '/components/upload');
var multer = require('multer');
var fileParser = multer({ storage: multer.memoryStorage() });
var config = require(__dirname + '/../config');
var async = require('async');
var path = require('path');
var fs = require('fs');

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
  app.delete(config.server_root + '/upload/:id', upload.deleteFile);


  /*
   * Forms
   */

  app.post(config.server_root + '/application', application.createApplication);
  app.post(config.server_root + '/update', authenticate(['manager', 'admin']), application.updateApplication);
  app.get(config.server_root + '/application/:id', authenticate(['manager', 'admin']), application.getApplication);

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