/*jshint esversion: 6 */
/*global __dirname*/

(function() {
  'use strict';

  const config = require('nconf');
  const chai = require('chai');
  const expect = chai.expect;
  const webdriver = require('selenium-webdriver');
  const By = webdriver.By;
  const until = webdriver.until;
  const Condition = webdriver.Condition;
  const Promise = require('bluebird');
  const TestUtils = require(__dirname + '/test-utils');
  const browser = process.env.METAFORM_BROWSER || 'chrome';
  
  process.on('unhandledRejection', function(error, promise) {
    console.error("UNHANDLED REJECTION", error.stack);
  });
  
  chai.use(require('chai-as-promised'));
  
  describe('Append function', function() {
    let app;
    let driver;
    
    this.timeout(60000);
    
    afterEach(function(done) {
      TestUtils.afterTest(this.currentTest, driver, app, done);
    });
    
    it('Testing if radio buttons appends more elements and testing textarea', () => { 
      const testText = "Test text";
      const result = expect(new Promise((resolve, reject) => {     
        config.file({file: 'test/append-function-config.json' });
        
        TestUtils.startServer('test/append-function-config.json').then((server) => {
          app = server;
          
          driver = TestUtils.createDriver(browser);
          driver.get('http://localhost:3000');
          
          driver.wait(until.titleIs('Test form')).then(() => {
            driver.wait(until.elementLocated(webdriver.By.css('input[value="healthcare"]'))).then((element) => {
              element.click();
              driver.wait(until.elementLocated(webdriver.By.css('input[value="health-center"]'))).then((element) => {
                TestUtils.waitAnimation(400).then(() => {
                  element.click();     
                    driver.wait(until.elementLocated(webdriver.By.css('input[value="center1"]'))).then((element) => {
                      TestUtils.waitAnimation(400).then(() => {
                        element.click();
                        driver.wait(until.elementLocated(webdriver.By.css('input[name="examination-results"]'))).then((element) => {
                          TestUtils.waitAnimation(400).then(() => {
                            element.click();
                            driver.wait(until.elementLocated(webdriver.By.css('textarea[name="examination-results-text"]'))).then((element) => {
                              TestUtils.waitAnimation(400).then(() => {
                                element.sendKeys(testText);
                                
                                driver.wait(until.elementLocated(webdriver.By.css('input[type="submit"]'))).then((element) => {
                                  element.click();
                                  driver.wait(until.elementLocated(webdriver.By.className('alert-success'))).then(() => {
                                    TestUtils.getReplies().then((value) => {
                                      if (value) {
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
                            });
                          });
                        });
                      });
                    }); 
                  });                   
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
        .property('[0].examination-results-text', testText);
    }); 
  });
})();