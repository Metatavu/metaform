/*jshint esversion: 6 */
/*global __dirname*/
(function() {
  'use strict';
  const spawn = require('child_process').spawn;
  const Promise = require('bluebird');
  const Form = require(__dirname + '/../form/index.js');
  
  class TestUtils {
    
    static startServer(command,options) {
      let app;
      
      app = spawn(command, options, {cwd: __dirname + '/../'});
      app.stdout.pipe(process.stdout);
      app.stderr.pipe(process.stderr);
      
      return app;
    }
    
    static getReplyCount() {
      return new Promise((resolve, reject) => {
        TestUtils.getReplies()
          .then((replies) => {
            if (replies && replies.length) {
              resolve(replies);
            } else {
              setTimeout(() => {
                return TestUtils.getReplyCount();
              }, 100);
            }
          })
          .catch(reject);
      });
        
    }
    
    static getReplies(callback) {
      return Promise.promisify(Form.listReplies)(true);
    }
    
    static removeReplies() {
      let formModel = Form.replyModel();
      return formModel.find({}).remove().exec();
    }
  }
  module.exports = TestUtils;
})();