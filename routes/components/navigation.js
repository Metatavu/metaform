/*jshint esversion: 6 */
/* global __dirname */

(function () {
  'use strict';

  const Form = require(__dirname + '/../../form');
  
  exports.renderIndex = (req, res) => {
    res.render('form', { viewModel: Form.viewModel() });
  };
  
  exports.renderLogin = (req, res) => {
    res.render('login', {
      message: req.flash('loginMessage')
    });
  };
  
  exports.renderForgotPass = (req, res) => {
    res.render('forgotpassword', { });
  };
  
}).call(this);