var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  originalname: String,
  mimetype: String,
  filename: String
});

module.exports = mongoose.model('Appendix', schema);