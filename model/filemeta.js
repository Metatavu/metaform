var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  originalname: String,
  filename: String,
  fileData: mongoose.Schema.Types.ObjectId
});

module.exports = mongoose.model('FileMeta', schema);