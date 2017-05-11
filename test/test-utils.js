/*jshint esversion: 6 */
/*global __dirname*/
(function() {
  'use strict';
  const spawn = require('child_process').spawn;
  const Promise = require('bluebird');
  const webdriver = require('selenium-webdriver');
  const Form = require(__dirname + '/../form/index.js');
  const User = require('../model/user');
  
  class TestUtils {
    
    static startServer(command,options) {   
      let app;
      return new Promise((resolve, reject) => {
        app = spawn(command, options, {cwd: __dirname + '/../'});
        app.stdout.pipe(process.stdout);
        app.stderr.pipe(process.stderr); 

        app.stdout.on('data', (data) => {
          if(data) {
            resolve(app);
          }
        });
      });  
    }
    
    static createDriver(browser) {
      let driver;
      driver = new webdriver.Builder()
        .forBrowser(browser)
        .build();

      return driver;
    }
    
    static getReplies() {
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
    
    static getRepliesLength() {
      return new Promise((resolve, reject) => {
        TestUtils.getReplies()
          .then((replies) => {
            resolve(replies.length);
          })
          .catch(reject);
      });
    }
    
    static removeUsers() {
      return User.find({}).remove({}).exec();
    }
  }
  module.exports = TestUtils;
})();