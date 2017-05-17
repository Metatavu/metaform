/*jshint esversion: 6 */
/*global __dirname*/

(function() {
  'use strict';
  
  const clearRequire = require('clear-require');
  const nock = require('nock');
  const config = require('nconf');
  const mongoose = require('mongoose');
  const chai = require('chai');
  const expect = chai.expect;
  const webdriver = require('selenium-webdriver');
  const By = webdriver.By;
  const until = webdriver.until;
  const Condition = webdriver.Condition;
  const Promise = require('bluebird');
  const TestUtils = require(__dirname + '/test-utils');
  const Form = require(__dirname + '/../form/index.js');
  const browser = process.env.METAFORM_BROWSER || 'chrome';
  
  chai.use(require('chai-as-promised'));
  
  describe('Email tests', function() {
    let app;
    let driver;
    let emailResponse;
    
    this.timeout(30000);
    
    afterEach(function(done){
      if (driver) {
        driver.close();
        driver = null;
      }

      app.close(() => {
        mongoose.disconnect();
        clearRequire.all();
        done();
      });
    });
    
    it('Send email', () => {
      const result = expect(new Promise((resolve, reject) => {
        TestUtils.startServer('test/email-config.json').then((server) => {
          app = server;
            
          nock('https://api.mailgun.net')
          .post('/v3/api.mailgun.net/messages', (body) => {
            emailResponse = body;
          })
          .reply(200, {
            message: 'Queued. Thank you.',
            id: 'test_id'
          });
            
          driver = TestUtils.createDriver(browser);
          driver.get('http://localhost:3000');
          
          driver.wait(until.elementLocated(webdriver.By.name('required-text'))).then(() => {
            let textField = driver.findElement(webdriver.By.name('required-text'));
            textField.sendKeys("test");

            driver.findElement(webdriver.By.className('btn')).click();
            
            driver.wait(until.elementLocated(webdriver.By.className('alert-success'))).then(() => {
              TestUtils.removeReplies().then(() => {
                  resolve(emailResponse.to);
              });
            });
          });
        });
      }));

      return result
        .to
        .eventually
        .eql('test@example.com');  
    });
  });
})();