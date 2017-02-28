/*jshint esversion: 6 */
(function() {
  'use strict';

  const FileData = require(__dirname + '/../model/filedata');

  function GridFsStorage () {
    // Constructor
  }

  GridFsStorage.prototype._handleFile = function _handleFile (req, file, callback) {
    FileData.write({filename:  file.originalname, contentType: file.mimetype }, file.stream, (err, savedFile) => {
      if (err) {
        callback(err);
      } else {
        callback(null, {
          id: savedFile._id
        }); 
      }
    });
  }

  GridFsStorage.prototype._removeFile = function _removeFile (req, file, callback) {
    callback(null);
  }

  module.exports = function (opts) {
    return new GridFsStorage(opts)
  }
  
}).call(this);