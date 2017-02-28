/*jshint esversion: 6 */
(function () {
  'use strict';
    
  const FileMeta = require(__dirname + '/../../model/filemeta');
  const FileData = require(__dirname + '/../../model/filedata');
  const async = require('async');
  
  exports.getFileData = (req, res) => {
    var id = req.params.id;
    FileData.findById(id, function (err, fileData) {
      if (err || !fileData) {
        res.status(404).send();
      } else {
        res.set('Content-Type', fileData.contentType);
        FileData.readById(id).pipe(res);
      }
    });
  };
  
  exports.uploadFile = (req, res, next) => {
    var savedFiles = [];
    async.each(req.files, (fileData, callback) => {
      var fileMeta = new FileMeta();
      fileMeta.originalname = fileData.originalname;
      fileMeta.filename = fileData.originalname;
      fileMeta.fileData = fileData.id;
      fileMeta.save().then((fileMeta) => {
        savedFiles.push(fileMeta);
        callback();
      }).catch((err) => {
        callback(err);
      });
    }, (err) => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.send(savedFiles);
      }
    });
  };
  
  exports.removeFile = (req, res) => {
    var id = req.params.id;
    FileMeta.findById(id, function (err, fileMeta) {
      if (err || !fileMeta) {
        res.status(404).send();
      } else {
        FileData.unlinkById(fileMeta.fileData, () => {
          FileMeta.findByIdAndRemove(id, function () {
            res.send({ status: 'removed' });
          });
        });
      }
    });
  };

}).call(this);