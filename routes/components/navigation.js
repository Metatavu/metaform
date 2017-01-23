/*jshint esversion: 6 */
(function () {
  'use strict';

  const config = require(__dirname + '/../../config');
  const Form = require(__dirname + '/../../form');
  
  exports.renderIndex = (req, res) => {
    res.render('form', { viewModel: Form.viewModel() });
  }
  
  exports.renderLogin = (req, res) => {
    res.render('login', {
      message: req.flash('loginMessage')
    });
  }
  
  exports.renderForgotPass = (req, res) => {
    res.render('forgotpassword', { });
  }
  
  exports.renderChangePass = (req, res) => {
    res.render('setpassword', { });
  }
}).call(this);