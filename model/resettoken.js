var mongoose = require('mongoose');
var crypto = require('crypto');

var resetTokenSchema = mongoose.Schema({
  user_id : String,
  expires: Number,
  token: String
});

resetTokenSchema.methods.isValid = function(token){
  return (this.token === token && new Date().getTime() < this.expires) ? true : false;
};

resetTokenSchema.methods.generateToken = function(){
  return crypto.randomBytes(48).toString('base64');
};

module.exports = mongoose.model('ResetToken', resetTokenSchema);