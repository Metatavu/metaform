/*jshint esversion: 6*/
/*global __dirname*/

(function() {
  'use strict';
  
  const clearRequire = require('clear-require');
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
  
  describe('Administrator view tests', function() {
    let app;
    let driver;
    
    this.timeout(60000);
      
    afterEach((done) => {
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
    
    it('Login test with correct credentials', () => {
      const email = 'admin@example.com';
      const password = 'admin';
      const expectedTitle = 'Hallintapaneeli';
      
      const result = expect(new Promise((resolve, reject) =>{
        TestUtils.startServer('test/text-field-config.json').then((server) => {
          app = server;
          
          driver = TestUtils.createDriver(browser);
          driver.get('http://localhost:3000/login');

          driver.wait(until.elementLocated(webdriver.By.name('email'))).then(() => {
            const emailField = driver.findElement(webdriver.By.name('email'));
            const passwordField = driver.findElement(webdriver.By.name('password'));
            
            emailField.sendKeys(email);
            passwordField.sendKeys(password);

            driver.findElement(webdriver.By.className('btn')).click(); 

            driver.wait(until.titleIs(expectedTitle)).then(() => {
               
              driver.getTitle().then((title) => {
                TestUtils.removeReplies().then(() => {
                    resolve(title);
                  });
              });         
            });                
          });
        });
      }));
      
      return result
        .to
        .eventually
        .equal(expectedTitle);
    });
    
    it('Login test with wrong password', () => {
      const email = 'admin@example.com';
      const password = 'foofoo';
      const expectedTitle = 'Hallintapaneeli';
      
      const result = expect(new Promise((resolve, reject) =>{
        TestUtils.startServer('test/text-field-config.json').then((server) => {
          app = server;
          
          driver = TestUtils.createDriver(browser);
          driver.get('http://localhost:3000/login');

          driver.wait(until.elementLocated(webdriver.By.name('email'))).then(() => {
            const emailField = driver.findElement(webdriver.By.name('email'));
            const passwordField = driver.findElement(webdriver.By.name('password'));
            
            emailField.sendKeys(email);
            passwordField.sendKeys(password);

            driver.findElement(webdriver.By.className('btn')).click(); 

            driver.getTitle().then((title) => {
               
              TestUtils.removeReplies().then(() => {
                resolve(title);
              });        
            });                
          });
        });
      }));
      
      return result
        .to
        .eventually
        .not
        .equal(expectedTitle);
    });
    
    it('Login test with wrong email', () => {
      const email = 'foobar@example.com';
      const password = 'admin';
      const expectedTitle = 'Hallintapaneeli';
      
      const result = expect(new Promise((resolve, reject) =>{
        TestUtils.startServer('test/text-field-config.json').then((server) => {
          app = server;
          
          driver = TestUtils.createDriver(browser);
          driver.get('http://localhost:3000/login');

          driver.wait(until.elementLocated(webdriver.By.name('email'))).then(() => {
            const emailField = driver.findElement(webdriver.By.name('email'));
            const passwordField = driver.findElement(webdriver.By.name('password'));
            
            emailField.sendKeys(email);
            passwordField.sendKeys(password);

            driver.findElement(webdriver.By.className('btn')).click(); 

            driver.getTitle().then((title) => {
               
              TestUtils.removeReplies().then(() => {
                resolve(title);
              });
            });             
          });
        });
      }));
      
      return result
        .to
        .eventually
        .not
        .equal(expectedTitle);
    });
    
    it('Create new reply, login and check if reply exists at management list', () => {
      const testText = "Test text";
      const email = 'admin@example.com';
      const password = 'admin';
      const expectedTitle = 'Hallintapaneeli';
      
      const result = expect(new Promise((resolve, reject) =>{
        TestUtils.startServer('test/text-field-config.json').then((server) => {
          app = server;
          
          driver = TestUtils.createDriver(browser);
          driver.get('http://localhost:3000/');
          
          driver.wait(until.elementLocated(webdriver.By.name('required-text'))).then(() => {
            const textField = driver.findElement(webdriver.By.name('required-text'));
            textField.sendKeys(testText);

            driver.findElement(webdriver.By.className('btn')).click(); 

            driver.wait(until.elementLocated(webdriver.By.className('alert-success'))).then(() => {
              driver.get('http://localhost:3000/login');
                          
              driver.wait(until.elementLocated(webdriver.By.name('email'))).then(() => {
                
                const emailField = driver.findElement(webdriver.By.name('email'));
                const passwordField = driver.findElement(webdriver.By.name('password'));

                emailField.sendKeys(email);
                passwordField.sendKeys(password);

                driver.findElement(webdriver.By.className('btn')).click();
                
                driver.wait(until.titleIs(expectedTitle)).then(() => {
                   
                  const element = driver.findElement(webdriver.By.id('formsTable'));
                  
                  element.getText().then((text) => {
                    TestUtils.removeReplies().then(() => {
                      resolve(text);
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
        .include(testText);
    });
    
    it('Create new reply, login and check if reply exists at management', () => {
      const testText = "Test text";
      const email = 'admin@example.com';
      const password = 'admin';
      const expectedTitle = 'Hallintapaneeli';
      
      const result = expect(new Promise((resolve, reject) =>{
        TestUtils.startServer('test/text-field-config.json').then((server) => {
          app = server;
          
          driver = TestUtils.createDriver(browser);
          driver.get('http://localhost:3000/');
          
          driver.wait(until.elementLocated(webdriver.By.name('required-text'))).then(() => {
            const textField = driver.findElement(webdriver.By.name('required-text'));
            textField.sendKeys(testText);

            driver.findElement(webdriver.By.className('btn')).click(); 

            driver.wait(until.elementLocated(webdriver.By.className('alert-success'))).then(() => {
              driver.get('http://localhost:3000/login');
                          
              driver.wait(until.elementLocated(webdriver.By.name('email'))).then(() => {
                
                const emailField = driver.findElement(webdriver.By.name('email'));
                const passwordField = driver.findElement(webdriver.By.name('password'));

                emailField.sendKeys(email);
                passwordField.sendKeys(password);

                driver.findElement(webdriver.By.className('btn')).click();
                
                driver.wait(until.titleIs(expectedTitle)).then(() => {
                  driver.findElement(webdriver.By.linkText("Avaa")).then((link) => {
                    link.click();
                    
                    driver.wait(until.titleIs('Vastaus')).then(() => {
                      driver.findElement(webdriver.By.css('input[name="required-text"]')).then((element) => {
                         
                        
                        element.getAttribute('value').then((text) => {
                          TestUtils.removeReplies().then(() => {
                            resolve(text);
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
        .include(testText);
    });
    
    it('Test for field contexts', () => {
      const testText = "Test text";
      const email = 'admin@example.com';
      const password = 'admin';
      const expectedTitle = 'Hallintapaneeli';
      
      const result = expect(new Promise((resolve, reject) =>{
        TestUtils.startServer('test/text-field-config.json').then((server) => {
          app = server;
          
          driver = TestUtils.createDriver(browser);
          driver.get('http://localhost:3000/');
          
          driver.wait(until.elementLocated(webdriver.By.name('required-text'))).then(() => {
            const textField = driver.findElement(webdriver.By.name('required-text'));
            textField.sendKeys(testText);

            driver.findElement(webdriver.By.className('btn')).click();
          
            driver.wait(until.elementLocated(webdriver.By.className('alert-success'))).then(() => {
              driver.findElements(By.id('field-not-in-form')).then((element) => {
                if(element.length === 0) {
                  driver.get('http://localhost:3000/login');

                  driver.wait(until.elementLocated(webdriver.By.name('email'))).then(() => {      
                    const emailField = driver.findElement(webdriver.By.name('email'));
                    const passwordField = driver.findElement(webdriver.By.name('password'));

                    emailField.sendKeys(email);
                    passwordField.sendKeys(password);

                    driver.findElement(webdriver.By.className('btn')).click();

                    driver.wait(until.titleIs(expectedTitle)).then(() => {
                      driver.findElement(webdriver.By.tagName('thead')).getText().then((text) => {
                        if (!text.includes('Not in management list')) {
                          driver.findElement(webdriver.By.linkText("Avaa")).then((link) => {
                            link.click();

                            driver.wait(until.titleIs('Vastaus')).then(() => {
                              driver.findElements(By.id('field-not-in-management')).then((element) => {
                                if (element.length === 0) {
                                  TestUtils.removeReplies().then(() => {
                                    TestUtils.removeUsers().then(() => {
                                      resolve(0);
                                    });
                                  });
                                } else {
                                  resolve(1);
                                }
                              });
                            });
                          });
                        } else {
                          resolve(1);
                        }
                      });    
                    });
                  });
                } else {
                  resolve(1);
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
