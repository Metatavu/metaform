var config = require(__dirname + '/../../config');

exports.renderIndex = (req, res) => {
  res.render('form', { positions: config.positions, root: config.server_root });
}

exports.renderLogin = (req, res) => {
  res.render('login', {
    message: req.flash('loginMessage'),
    root: config.server_root
  });
}

exports.renderForgotPass = (req, res) => {
  res.render('forgotpassword', { root: config.server_root });
}

exports.renderChangePass = (req, res) => {
  res.render('setpassword', { root: config.server_root });
}