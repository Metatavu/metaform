/*jshint esversion: 6 */
/*global __dirname*/
(function() {
  'use strict';
  
  const clearRequire = require('clear-require');
  const spawn = require('child_process').spawn;
  const Promise = require('bluebird');
  const http = require('http');
  const webdriver = require('selenium-webdriver');
  const fs = require('fs');
  const path = require('path');
  const util = require('util');
  const mongoose = require('mongoose');
  
  process.on('unhandledRejection', function(error, promise) {
    console.error("UNHANDLED REJECTION", error.stack);
  });
  
  class TestUtils {
    
    static afterTest(test, driver, server, done) {
      if (test.state === 'failed') {
        TestUtils.takeScreenshot(driver)
          .then((screenshot) => {
            TestUtils.cleanUp(driver, server, done);
          })
          .catch((err) => {
            console.error("Error taking screenshot", err);
            TestUtils.cleanUp(driver, server, done);
          });
      } else {
        TestUtils.cleanUp(driver, server, done);
      }
    }
    
    static cleanUp(driver, server, callback) {
      if (driver) {
        driver.quit();
        driver = null;
      }
      
      server.close(() => {
        mongoose.disconnect();
        clearRequire.all();
        callback();
      });
    }
    
    static ensureDirectoryExistence(filePath) {
      var dirname = path.dirname(filePath);
      if (fs.existsSync(dirname)) {
        return true;
      }
      TestUtils.ensureDirectoryExistence(dirname);
      fs.mkdirSync(dirname);
    }
    
    static takeScreenshot(driver) {
      return new Promise((resolve, reject) => {
        driver.takeScreenshot().then((data) => {
          const filepath = util.format('/tmp/metaform/build/%s%s', new Date().getTime(), '.png');
          TestUtils.ensureDirectoryExistence(filepath);
          fs.writeFile(filepath, data.replace(/^data:image\/png;base64,/,''), 'base64', (scErr) => {
            if(scErr) {
              reject(scErr);
            } else {
              resolve(filepath);
            }
          });
        });
      });
    }
    
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