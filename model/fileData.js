var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  contentType: String,
  data: Buffer
});

module.exports = mongoose.model('FileData', schema);