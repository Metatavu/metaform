/*jshint esversion: 6 */
(function () {
  'use strict';

  const Form = require(__dirname + '/../../form');
  
  exports.renderAdminView = function (req, res) {
    var includeFiltered = req.query.includeFiltered||false;
    Form.listReplies(includeFiltered, (err, replies) => {
      if (err) {
        res.status(500).send();
      } else {
        res.render('admin', { 
          user: req.user,
          viewModel: Form.viewModel(),
          fields: Form.contextFields('MANAGEMENT_LIST'),
          replies: replies
        });
      }
    });
  };

  exports.renderUserManagementView = function(req, res){
    res.render('usermanagement', { 
      user: req.user,
      viewModel: Form.viewModel()
    });
  };
  
  exports.getFormReply = (req, res) => {
    var id = req.params.id;
    
    Form.loadReply(id, (err, formReply) => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.render('form-reply', {
          user: req.user,
          viewModel: Form.viewModel(),
          formReply: formReply
        });
      }
    });
  };


}).call(this);
