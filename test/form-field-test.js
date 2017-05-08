/*jshint esversion: 6 */
/*global __dirname*/

(function() {
  'use strict';
  
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
  
  chai.use(require('chai-as-promised'));
  
  describe('Form field tests', function() {
    let app;
    let driver;
    
    this.timeout(600000);
    
    afterEach(() =>{
      if (app) {
        app.kill(); 
      } 
      
      if (driver) {
        driver.quit();
      } 
    }); 
    
    it('Test text field', () => { 
      const testText = "Test text";
      const result = expect(new Promise((resolve, reject) => {     
        config.file({file: 'test/text-field-config.json' });
        mongoose.connect('mongodb://' + config.get('database:host') + '/' + config.get('database:table'));
        app = TestUtils.startServer('node', ['app.js', '--config=test/text-field-config.json']);

        driver = new webdriver.Builder()
          .withCapabilities(webdriver.Capabilities.chrome())
          .build();

        driver.get('http://localhost:3000');
        driver.wait(until.elementLocated(webdriver.By.name('required-text')));

        let textField = driver.findElement(webdriver.By.name('required-text'));
        textField.sendKeys(testText);
        
        driver.findElement(webdriver.By.className('btn')).click().then(function(){        
          driver.wait(until.elementLocated(webdriver.By.className('success')));
        
          TestUtils.getReplyCount().then((value) => {
            if(value) {
              resolve(value);
              TestUtils.removeReplies();
            } else {
              reject('Replies not found');
            }    
          });        
        });       
      }));
           
      return result
        .to
        .eventually
        .have
        .deep
        .property('[0].required-text', testText);
    });    
  });
})();