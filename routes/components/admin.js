/*jshint esversion: 6 */
(function () {
  'use strict';

  const Form = require(__dirname + '/../../form');
  const FormReplyModel = Form.replyModel();
  const _ = require('underscore');
  const config = require('../../config');
  const xlsx = require('node-xlsx');
  const moment = require('moment');


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
            listFields: Form.reportListFields(),
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

  exports.createXlsx = function (req, res) {
    //    var query = {};
    //    if (typeof (req.query.state) !== 'undefined' && req.query.state !== '') {
    //      query.state = req.query.state;
    //    }
    //    if (typeof (req.query.primary) !== 'undefined' && req.query.primary !== '') {
    //      query.primaryRequest = req.query.primary;
    //    }
    //    if (typeof (req.query.secondary) !== 'undefined' && req.query.secondary !== '') {
    //      query.secondaryRequest = req.query.secondary;
    //    }
    //    if (typeof (req.query.department) !== 'undefined' && req.query.department !== '') {
    //      query.organizationalUnit = req.query.department;
    //    }
    //    Application.find(query)
    //      .sort({ added: 1 })
    //      .batchSize(2000)
    //      .exec(function(err, applications) {
    //        if (err) {
    //          res.status(404).send();
    //        } else {
    //          var rows = [];
    //          rows.push(['Sukunimi', 'Etunimi', 'Synt.aika', 'Osoite', 'Postinumero', 'Postitoimipaikka', 'Puhelin', 'Email', 'Aloituspvm', 'Lopetuspvm']);
    //          for(var i = 0; i < applications.length;i++){
    //            var application = applications[i];
    //            var startDate = typeof(application.startDate) === 'undefined' ? '-' : moment(application.startDate).format('D.M.YYYY');
    //            var endDate = typeof(application.endDate) === 'undefined' ? '-' : moment(application.endDate).format('D.M.YYYY');
    //            var row = [application.lastName, application.firstName, moment(application.birthday).format('D.M.YYYY'), application.address, application.zipcode, application.city, application.phone, application.email, startDate, endDate];
    //            rows.push(row);  
    //          }
    //          var buffer = xlsx.build([{name: 'Hakemukset', data: rows}]);
    //          res.setHeader('content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    //          res.send(buffer);
    //        }
    //      });
    req.status(501).send('not implemented yet');
  };


}).call(this);
