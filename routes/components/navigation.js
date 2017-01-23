/*jshint esversion: 6 */
(function () {
  'use strict';

  const config = require(__dirname + '/../../config');
  const Form = require(__dirname + '/../../form');
  
  exports.renderIndex = (req, res) => {
    res.render('form', { viewModel: Form.viewModel(), root: config.server_root });
  }
  
  exports.renderLogin = (req, res) => {
    res.render('login', {
      message: req.flash('loginMessage')
    });
  }
  
  exports.renderForgotPass = (req, res) => {
    res.render('forgotpassword', { root: config.server_root });
  }
  
  exports.renderChangePass = (req, res) => {
    res.render('setpassword', { root: config.server_root });
  }
}).call(this);