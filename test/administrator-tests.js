/*jshint: esversion:6*/
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
  
  describe('Administrator view tests', function() {
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
    
    it('Login test with correct credentials', () => {
      const email = 'admin@example.com';
      const password = 'admin';
      const expectedTitle = 'Hallintapaneeli';
      
      const result = expect(new Promise((resolve, reject) =>{
        config.file({file: 'test/text-field-config.json' });
        
        TestUtils.startServer('node', ['app.js', '--config=test/text-field-config.json']).then((server) => {
          app = server;
          
          driver = TestUtils.createDriver(browser);
          driver.get('http://localhost:3000/login');

          driver.wait(until.elementLocated(webdriver.By.name('email'))).then(() => {
            let emailField = driver.findElement(webdriver.By.name('email'));
            let passwordField = driver.findElement(webdriver.By.name('password'));
            
            emailField.sendKeys(email);
            passwordField.sendKeys(password);

            driver.findElement(webdriver.By.className('btn')).click(); 

            driver.wait(until.titleIs(expectedTitle)).then(() => {
              mongoose.connect('mongodb://' + config.get('database:host') + '/' + config.get('database:table'));
              driver.getTitle().then((title) => {
                TestUtils.removeReplies().then(() => {
                  TestUtils.removeUsers().then(() => {
                    resolve(title);
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
        .equal(expectedTitle);
    });
    
    it('Login test with wrong password', () => {
      const email = 'admin@example.com';
      const password = 'foofoo';
      const expectedTitle = 'Hallintapaneeli';
      
      const result = expect(new Promise((resolve, reject) =>{
        config.file({file: 'test/text-field-config.json' });
        
        TestUtils.startServer('node', ['app.js', '--config=test/text-field-config.json']).then((server) => {
          app = server;
          
          driver = TestUtils.createDriver(browser);
          driver.get('http://localhost:3000/login');

          driver.wait(until.elementLocated(webdriver.By.name('email'))).then(() => {
            let emailField = driver.findElement(webdriver.By.name('email'));
            let passwordField = driver.findElement(webdriver.By.name('password'));
            
            emailField.sendKeys(email);
            passwordField.sendKeys(password);

            driver.findElement(webdriver.By.className('btn')).click(); 

            driver.getTitle().then((title) => {
              mongoose.connect('mongodb://' + config.get('database:host') + '/' + config.get('database:table'));
              TestUtils.removeReplies().then(() => {
                TestUtils.removeUsers().then(() => {
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
        .not
        .equal(expectedTitle);
    });
    
    it('Login test with wrong email', () => {
      const email = 'foobar@example.com';
      const password = 'admin';
      const expectedTitle = 'Hallintapaneeli';
      
      const result = expect(new Promise((resolve, reject) =>{
        config.file({file: 'test/text-field-config.json' });
        
        TestUtils.startServer('node', ['app.js', '--config=test/text-field-config.json']).then((server) => {
          app = server;
          
          driver = TestUtils.createDriver(browser);
          driver.get('http://localhost:3000/login');

          driver.wait(until.elementLocated(webdriver.By.name('email'))).then(() => {
            let emailField = driver.findElement(webdriver.By.name('email'));
            let passwordField = driver.findElement(webdriver.By.name('password'));
            
            emailField.sendKeys(email);
            passwordField.sendKeys(password);

            driver.findElement(webdriver.By.className('btn')).click(); 

            driver.getTitle().then((title) => {
              mongoose.connect('mongodb://' + config.get('database:host') + '/' + config.get('database:table'));
              TestUtils.removeReplies().then(() => {
                TestUtils.removeUsers().then(() => {
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
        .not
        .equal(expectedTitle);
    });
    
    it('Create new reply, login and check if reply exists at management list', () => {
      const testText = "Test text";
      const email = 'admin@example.com';
      const password = 'admin';
      const expectedTitle = 'Hallintapaneeli';
      
      const result = expect(new Promise((resolve, reject) =>{
        config.file({file: 'test/text-field-config.json' });
        
        TestUtils.startServer('node', ['app.js', '--config=test/text-field-config.json']).then((server) => {
          app = server;
          
          driver = TestUtils.createDriver(browser);
          driver.get('http://localhost:3000/');
          
          driver.wait(until.elementLocated(webdriver.By.name('required-text'))).then(() => {
            let textField = driver.findElement(webdriver.By.name('required-text'));
            textField.sendKeys(testText);

            driver.findElement(webdriver.By.className('btn')).click(); 

            driver.wait(until.elementLocated(webdriver.By.className('alert-success'))).then(() => {
              driver.get('http://localhost:3000/login');
                          
              driver.wait(until.elementLocated(webdriver.By.name('email'))).then(() => {
                
                let emailField = driver.findElement(webdriver.By.name('email'));
                let passwordField = driver.findElement(webdriver.By.name('password'));

                emailField.sendKeys(email);
                passwordField.sendKeys(password);

                driver.findElement(webdriver.By.className('btn')).click();
                
                driver.wait(until.titleIs(expectedTitle)).then(() => {
                  mongoose.connect('mongodb://' + config.get('database:host') + '/' + config.get('database:table'));
                  let element = driver.findElement(webdriver.By.id('formsTable'));
                  
                  element.getText().then(function(text) {
                    TestUtils.removeReplies().then(() => {
                      TestUtils.removeUsers().then(() => {
                        resolve(text);
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
    
    it('Create new reply, login and check if reply exists at management', () => {
      const testText = "Test text";
      const email = 'admin@example.com';
      const password = 'admin';
      const expectedTitle = 'Hallintapaneeli';
      
      const result = expect(new Promise((resolve, reject) =>{
        config.file({file: 'test/text-field-config.json' });
        
        TestUtils.startServer('node', ['app.js', '--config=test/text-field-config.json']).then((server) => {
          app = server;
          
          driver = TestUtils.createDriver(browser);
          driver.get('http://localhost:3000/');
          
          driver.wait(until.elementLocated(webdriver.By.name('required-text'))).then(() => {
            let textField = driver.findElement(webdriver.By.name('required-text'));
            textField.sendKeys(testText);

            driver.findElement(webdriver.By.className('btn')).click(); 

            driver.wait(until.elementLocated(webdriver.By.className('alert-success'))).then(() => {
              driver.get('http://localhost:3000/login');
                          
              driver.wait(until.elementLocated(webdriver.By.name('email'))).then(() => {
                
                let emailField = driver.findElement(webdriver.By.name('email'));
                let passwordField = driver.findElement(webdriver.By.name('password'));

                emailField.sendKeys(email);
                passwordField.sendKeys(password);

                driver.findElement(webdriver.By.className('btn')).click();
                
                driver.wait(until.titleIs(expectedTitle)).then(() => {
                  driver.findElement(webdriver.By.linkText("Avaa")).then((link) => {
                    link.click();
                    
                    driver.wait(until.titleIs('Vastaus')).then(() => {
                      driver.findElement(webdriver.By.css('input[name="required-text"]')).then((element) => {
                        mongoose.connect('mongodb://' + config.get('database:host') + '/' + config.get('database:table'));
                        
                        element.getAttribute('value').then((text) => {
                          TestUtils.removeReplies().then(() => {
                            TestUtils.removeUsers().then(() => {
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
        config.file({file: 'test/text-field-config.json' });
        
        TestUtils.startServer('node', ['app.js', '--config=test/text-field-config.json']).then((server) => {
          app = server;
          
          driver = TestUtils.createDriver(browser);
          driver.get('http://localhost:3000/');
          
          driver.wait(until.elementLocated(webdriver.By.name('required-text'))).then(() => {
            let textField = driver.findElement(webdriver.By.name('required-text'));
            textField.sendKeys(testText);

            driver.findElement(webdriver.By.className('btn')).click();
          
            driver.wait(until.elementLocated(webdriver.By.className('alert-success'))).then(() => {
              driver.findElements(By.id('field-not-in-form')).then((element) => {
                if(element.length === 0) {
                  driver.get('http://localhost:3000/login');

                  driver.wait(until.elementLocated(webdriver.By.name('email'))).then(() => {      
                    let emailField = driver.findElement(webdriver.By.name('email'));
                    let passwordField = driver.findElement(webdriver.By.name('password'));

                    emailField.sendKeys(email);
                    passwordField.sendKeys(password);

                    driver.findElement(webdriver.By.className('btn')).click();

                    driver.wait(until.titleIs(expectedTitle)).then(() => {
                      driver.findElement(webdriver.By.tagName('thead')).getText().then((text) => {
                        if(!text.includes('Not in management list')) {
                          driver.findElement(webdriver.By.linkText("Avaa")).then((link) => {
                            link.click();

                            driver.wait(until.titleIs('Vastaus')).then(() => {
                              driver.findElements(By.id('field-not-in-management')).then((element) => {
                                if(element.length === 0) {
                                  mongoose.connect('mongodb://' + config.get('database:host') + '/' + config.get('database:table'));
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
