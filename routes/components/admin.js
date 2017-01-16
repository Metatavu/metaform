var Application = require('../../model/application');
var _ = require('underscore');
var config = require('../../config');
var xlsx = require('node-xlsx');
var moment = require('moment');

exports.convertPhoneNumbers = function(req, res){
    Application.find({})
    .batchSize(2000)
    .exec(function(err, applications) {
      if (err) {
        res.status(404).send();
      } else {
        res.send('ok');
        for(var i = 0; i < applications.length;i++){
          var application = applications[i];
          /*var fixedPhone = application.phone;
          fixedPhone = fixedPhone.toString();
          if(!fixedPhone.startsWith('358') && !fixedPhone.startsWith('0')){
            fixedPhone = '0'+fixedPhone;
          }*/
          var phoneNumber = '';
          for(var key in application.phone){
            phoneNumber += key;
            phoneNumber += application.phone[key];
          }
          application.phone = phoneNumber;
          application.save(function(err, application){
            if(err){
              console.log(err);
            }else{
              console.log('Fixed phone number for application');
            }
          });
        }
      }
    });
};

exports.renderAdminView = function(req, res) {
  var query = {};
  if (typeof (req.query.state) !== 'undefined' && req.query.state !== '') {
    query.state = req.query.state;
  }
  if (typeof (req.query.primary) !== 'undefined' && req.query.primary !== '') {
    query.primaryRequest = req.query.primary;
  }
  if (typeof (req.query.secondary) !== 'undefined' && req.query.secondary !== '') {
    query.secondaryRequest = req.query.secondary;
  }
  if (typeof (req.query.department) !== 'undefined' && req.query.department !== '') {
    query.organizationalUnit = req.query.department;
  }
  Application.find(query)
    .sort({ added: 1 })
    .batchSize(2000)
    .exec(function(err, applications) {
      if (err) {
        res.status(404).send();
      } else {
        res.render('admin', { user: req.user, applications: applications, state: 'Hakemukset', positions: config.positions, query: query, root: config.server_root });
      }
    });
};

exports.createXlsx = function(req, res) {
  var query = {};
  if (typeof (req.query.state) !== 'undefined' && req.query.state !== '') {
    query.state = req.query.state;
  }
  if (typeof (req.query.primary) !== 'undefined' && req.query.primary !== '') {
    query.primaryRequest = req.query.primary;
  }
  if (typeof (req.query.secondary) !== 'undefined' && req.query.secondary !== '') {
    query.secondaryRequest = req.query.secondary;
  }
  if (typeof (req.query.department) !== 'undefined' && req.query.department !== '') {
    query.organizationalUnit = req.query.department;
  }
  Application.find(query)
    .sort({ added: 1 })
    .batchSize(2000)
    .exec(function(err, applications) {
      if (err) {
        res.status(404).send();
      } else {
        var rows = [];
        rows.push(['Sukunimi', 'Etunimi', 'Synt.aika', 'Osoite', 'Postinumero', 'Postitoimipaikka', 'Puhelin', 'Email', 'Aloituspvm', 'Lopetuspvm']);
        for(var i = 0; i < applications.length;i++){
          var application = applications[i];
          var startDate = typeof(application.startDate) === 'undefined' ? '-' : moment(application.startDate).format('D.M.YYYY');
          var endDate = typeof(application.endDate) === 'undefined' ? '-' : moment(application.endDate).format('D.M.YYYY');
          var row = [application.lastName, application.firstName, moment(application.birthday).format('D.M.YYYY'), application.address, application.zipcode, application.city, application.phone, application.email, startDate, endDate];
          rows.push(row);  
        }
        var buffer = xlsx.build([{name: 'Hakemukset', data: rows}]);
        res.setHeader('content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buffer);
      }
    });
};