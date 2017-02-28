/*jshint esversion: 6 */
(function() {
  'use strict';

  const gridfs = require('mongoose-gridfs')({
    collection:'attachments',
    model:'FileData'
  });
  
  module.exports = gridfs.model;
  
}).call(this);