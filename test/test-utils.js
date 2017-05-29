/*jshint esversion: 6 */
/*global __dirname*/
(function() {
  'use strict';
  
  const clearRequire = require('clear-require');
  const spawn = require('child_process').spawn;
  const Promise = require('bluebird');
  const http = require('http');
  const webdriver = require('selenium-webdriver');
  
  process.on('unhandledRejection', function(error, promise) {
    console.error("UNHANDLED REJECTION", error.stack);
  });
  
  class TestUtils {
    
    static startServerFork(command,options) {   
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
    
    static startServer(configPath) {
      const config = require('nconf');
      config.file({file: configPath });
      const app = require(__dirname + '/../index');
      
      return new Promise((resolve, reject) => {
        app.startServer(() => {
          resolve(app);
        });
      });
    }
    
    static createDriver(browser) {
      let driver;
      driver = new webdriver.Builder()
        .forBrowser(browser)
        .build();
        
      driver.manage().window().setSize(1600, 1224);
      
      return driver;
    }
    
    static waitAnimation(duration) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve();
        }, duration);
      });
    }
    
    static getReplies() {
      return new Promise((resolve, reject) => {
        TestUtils.getRepliesFromDb()
          .then((replies) => {
            if (replies && replies.length) {
              resolve(replies);
            } else {
              setTimeout(() => {
                return TestUtils.getReplies();
              }, 100);
            }
          })
          .catch(reject);
      });    
    }
    
    static getRepliesFromDb(callback) {
      const Form = require(__dirname + '/../form/index.js');
      return Promise.promisify(Form.listReplies)(null, true);
    }
    
    static removeReplies() {
      const Form = require(__dirname + '/../form/index.js');
      let formModel = Form.replyModel();
      return formModel.find({}).remove().exec();
    }
    
    static getRepliesLength() {
      return new Promise((resolve, reject) => {
        TestUtils.getRepliesFromDb()
          .then((replies) => {
            resolve(replies.length);
          })
          .catch(reject);
      });
    }
    
    static removeUsers() {
      const User = require('../model/user');
      return User.find({}).remove({}).exec();
    }

  }
  module.exports = TestUtils;
})();