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
  const browser = process.env.METAFORM_BROWSER || 'chrome';
  
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
        
        TestUtils.startServer('node', ['app.js', '--config=test/text-field-config.json']).then((server) => {
          app = server;
          
          driver = TestUtils.createDriver(browser);
          driver.get('http://localhost:3000');

          driver.wait(until.elementLocated(webdriver.By.name('required-text'))).then(() => {
            let textField = driver.findElement(webdriver.By.name('required-text'));
            textField.sendKeys(testText);

            driver.findElement(webdriver.By.className('btn')).click(); 

            driver.wait(until.elementLocated(webdriver.By.className('alert-success'))).then(() => {
              mongoose.connect('mongodb://' + config.get('database:host') + '/' + config.get('database:table'));

              TestUtils.getReplies().then((value) => {
                if(value) {
                  TestUtils.removeReplies().then(() => {
                    resolve(value);
                  });
                } else {
                  reject('Replies not found');
                }    
              });
            });                
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
        
        TestUtils.startServer('node', ['app.js', '--config=test/text-field-config.json']).then((server) => {
          app = server;
          
          driver = TestUtils.createDriver(browser);
          driver.get('http://localhost:3000');
          
          driver.wait(until.elementLocated(webdriver.By.name('required-text'))).then(() => {
            let textField = driver.findElement(webdriver.By.name('required-text'));
            textField.sendKeys(testText);

            driver.findElement(webdriver.By.className('btn')).click(); 

            driver.wait(until.elementLocated(webdriver.By.className('alert-success'))).then(() => {
              mongoose.connect('mongodb://' + config.get('database:host') + '/' + config.get('database:table'));

              TestUtils.getReplies().then((value) => {
                if(value) {
                  TestUtils.removeReplies().then(() => {
                    resolve(value);
                  });
                } else {
                  reject('Replies not found');
                }    
              });
            });                
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
        
        TestUtils.startServer('node', ['app.js', '--config=test/text-field-config.json']).then((server) => {
          app = server;

          driver = TestUtils.createDriver(browser);
          driver.get('http://localhost:3000');
          
          driver.wait(until.elementLocated(webdriver.By.name('required-text'))).then(() => {
            let textField = driver.findElement(webdriver.By.name('required-text'));
            textField.sendKeys(testText);

            driver.findElement(webdriver.By.className('btn')).click(); 

            driver.wait(until.elementLocated(webdriver.By.className('alert-success'))).then(() => {
              mongoose.connect('mongodb://' + config.get('database:host') + '/' + config.get('database:table'));

              TestUtils.getReplies().then((value) => {
                if(value) {
                  TestUtils.removeReplies().then(() => {
                    resolve(value);
                  });
                } else {
                  reject('Replies not found');
                }    
              });
            });                
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
        
        TestUtils.startServer('node', ['app.js', '--config=test/text-field-config.json']).then((server) => {
          app = server;

          driver = TestUtils.createDriver(browser);
          driver.get('http://localhost:3000');
          
          driver.wait(until.elementLocated(webdriver.By.name('required-text'))).then(() => {
            let textField = driver.findElement(webdriver.By.name('required-text'));
            textField.sendKeys(testText);

            driver.findElement(webdriver.By.className('btn')).click(); 

            driver.wait(until.elementLocated(webdriver.By.className('alert-success'))).then(() => {
              mongoose.connect('mongodb://' + config.get('database:host') + '/' + config.get('database:table'));

              TestUtils.getReplies().then((value) => {
                if(value) {
                  TestUtils.removeReplies().then(() => {
                    resolve(value);
                  });
                } else {
                  reject('Replies not found');
                }    
              });
            });                
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
    
    it('Test for required fields', () => { 
      const testText = "";
      const result = expect(new Promise((resolve, reject) => {     
        config.file({file: 'test/text-field-config.json' });
        
        TestUtils.startServer('node', ['app.js', '--config=test/text-field-config.json']).then((server) => {
          app = server;

          driver = TestUtils.createDriver(browser);
          driver.get('http://localhost:3000');
          
          driver.wait(until.elementLocated(webdriver.By.name('required-text'))).then(() => {
            let textField = driver.findElement(webdriver.By.name('required-text'));
            textField.sendKeys(testText);

            driver.findElement(webdriver.By.className('btn')).click();

            driver.wait(driver.findElement(webdriver.By.css("input:invalid")), 30 * 1000).then(() => {
              mongoose.connect('mongodb://' + config.get('database:host') + '/' + config.get('database:table'));

              TestUtils.getRepliesLength().then((count) => {
                if(count === 0) {
                  resolve(count);
                } else {
                  reject('Found replies when should not find.');
                }    
              });
            });
          });  
        });
      }));
           
      return result
        .to
        .eventually
        .equal(0);
    });
  });
})();