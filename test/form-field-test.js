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
      delete mongoose.models.Reply;
      delete mongoose.modelSchemas.Reply;
      mongoose.connection.close();
      
      if(driver) {
        driver.close();
        driver = null;
      }
      
      if(app) {
        app.kill();
      }
    }); 
    
    it('Test text field by English', () => { 
      const testText = "Test text";
      const result = expect(new Promise((resolve, reject) => {     
        config.file({file: 'test/text-field-config.json' });
        
        app = TestUtils.startServer('node', ['app.js', '--config=test/text-field-config.json']);

        driver = new webdriver.Builder()
          .withCapabilities(webdriver.Capabilities.chrome())
          .build();
  
        driver.get('http://localhost:3000');
        driver.wait(until.elementLocated(webdriver.By.name('required-text')));

        let textField = driver.findElement(webdriver.By.name('required-text'));
        textField.sendKeys(testText);
        
        driver.findElement(webdriver.By.className('btn')).click(); 
        
        driver.wait(until.elementLocated(webdriver.By.className('alert-success'))).then(() => {
          mongoose.connect('mongodb://' + config.get('database:host') + '/' + config.get('database:table'));

          TestUtils.getReplyCount().then((value) => {
            if(value) {
              TestUtils.removeReplies().then(() => {
                resolve(value);
              });
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
    
    it('Test text field by Chinese', () => { 
      const testText = "測試文本";
      const result = expect(new Promise((resolve, reject) => {     
        config.file({file: 'test/text-field-config.json' });
        
        app = TestUtils.startServer('node', ['app.js', '--config=test/text-field-config.json']);

        driver = new webdriver.Builder()
          .withCapabilities(webdriver.Capabilities.chrome())
          .build();

        driver.get('http://localhost:3000');
        driver.wait(until.elementLocated(webdriver.By.name('required-text')));

        let textField = driver.findElement(webdriver.By.name('required-text'));
        textField.sendKeys(testText);
        
        driver.findElement(webdriver.By.className('btn')).click();
        
        driver.wait(until.elementLocated(webdriver.By.className('alert-success'))).then(() => {
          mongoose.connect('mongodb://' + config.get('database:host') + '/' + config.get('database:table'));

          TestUtils.getReplyCount().then((value) => {
            if(value) {
              TestUtils.removeReplies().then(() => {
                resolve(value);
              });
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
    
    it('Test text field by Finnish', () => { 
      const testText = "Ääkkösiä";
      const result = expect(new Promise((resolve, reject) => {     
        config.file({file: 'test/text-field-config.json' });
        
        app = TestUtils.startServer('node', ['app.js', '--config=test/text-field-config.json']);

        driver = new webdriver.Builder()
          .withCapabilities(webdriver.Capabilities.chrome())
          .build();

        driver.get('http://localhost:3000');
        driver.wait(until.elementLocated(webdriver.By.name('required-text')));

        let textField = driver.findElement(webdriver.By.name('required-text'));
        textField.sendKeys(testText);
        
        driver.findElement(webdriver.By.className('btn')).click(); 
        
        driver.wait(until.elementLocated(webdriver.By.className('alert-success'))).then(() => {
          mongoose.connect('mongodb://' + config.get('database:host') + '/' + config.get('database:table'));

          TestUtils.getReplyCount().then((value) => {
            if(value) {
              TestUtils.removeReplies().then(() => {
                resolve(value);
              });
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
    
    it('Test text field by Russian', () => { 
      const testText = "Тестовый текст";
      const result = expect(new Promise((resolve, reject) => {     
        config.file({file: 'test/text-field-config.json' });
        
        app = TestUtils.startServer('node', ['app.js', '--config=test/text-field-config.json']);

        driver = new webdriver.Builder()
          .withCapabilities(webdriver.Capabilities.chrome())
          .build();

        driver.get('http://localhost:3000');
        driver.wait(until.elementLocated(webdriver.By.name('required-text')));

        let textField = driver.findElement(webdriver.By.name('required-text'));
        textField.sendKeys(testText);
        
        driver.findElement(webdriver.By.className('btn')).click();
        
        driver.wait(until.elementLocated(webdriver.By.className('alert-success'))).then(() => {
          mongoose.connect('mongodb://' + config.get('database:host') + '/' + config.get('database:table'));

          TestUtils.getReplyCount().then((value) => {
            if(value) {
              TestUtils.removeReplies().then(() => {
                resolve(value);
              });
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