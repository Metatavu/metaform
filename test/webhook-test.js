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
  const browser = process.env.METAFORM_BROWSER || 'chrome';
  
  chai.use(require('chai-as-promised'));
  
  describe('Testing Webhooks', function() {
    let app;
    let driver;
    let webhookResponse;
    
    this.timeout(60000);
    
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
    
    it('Webhook test', () => {
      const result = expect(new Promise((resolve, reject) => {
        TestUtils.startServer('test/webhook-config.json').then((server) => {
          app = server;
          
          driver = TestUtils.createDriver(browser);
          driver.get('http://localhost:3000');
          
          driver.wait(until.titleIs('webhooks')).then(() => {

            var webhook = nock('http://metaformtests.com')
              .get('/?id=staticText&message=test')
              .reply(200, 'Domain found');

            driver.wait(until.elementLocated(webdriver.By.name('required-text'))).then(() => {
              let textField = driver.findElement(webdriver.By.name('required-text'));
              textField.sendKeys("test");

              driver.findElement(webdriver.By.className('btn')).click();

              driver.wait(until.elementLocated(webdriver.By.className('alert-success'))).then(() => {
                TestUtils.removeReplies().then(() => {
                  resolve(webhook.isDone());
                });
              });
            });
          });
        });
      }));

      return result
        .to
        .eventually
        .eql(true);  
    });
  });
})();
