/*jshint esversion: 6 */
(function () {
  'use strict';

  const Form = require(__dirname + '/../../form');
  const FormReplyModel = Form.replyModel();

  exports.renderAdminView = function (req, res) {
    FormReplyModel.find()
      .sort({ added: 1 })
      .batchSize(2000)
      .exec(function(err, replies) {
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
