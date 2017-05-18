/*jshint esversion: 6 */
/*global __dirname*/

(function() {
  'use strict';
  
  const clearRequire = require('clear-require');
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
  
  process.on('unhandledRejection', function(error, promise) {
      console.error("UNHANDLED REJECTION", error.stack);
  });
  
  chai.use(require('chai-as-promised'));
  
  describe('Datepicker', function() {
    let app;
    let driver;
    let skipThis = false;
    
    this.timeout(60000);
    
    beforeEach(() => {
      if(process.env.METAFORM_BROWSER) {
        skipThis = true;
      }
    });
    
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
    
    if (skipThis) {
      it('Testing datepicker', () => {
        const result = expect(new Promise((resolve, reject) => {     
          config.file({file: 'test/append-function-config.json' });

          TestUtils.startServer('test/datepicker-config.json').then((server) => {
            app = server;
            driver = TestUtils.createDriver(browser);
            driver.get('http://localhost:3000');

            driver.wait(until.titleIs('Test form')).then(() => {
              driver.wait(until.elementLocated(webdriver.By.css('input[type="text"]'))).then((element) => {
                driver.findElements(By.className('flatpickr-day')).then((days) => {
                  let daysArray = [];
                  let wantedIndex = 0;

                  for(var i = 0; i < days.length; i++) {
                    daysArray.push(days[i].getText());
                  }

                  Promise.all(daysArray).then((dayTexts) => {
                    for(var i = 0; i < dayTexts.length; i++) {
                      if(dayTexts[i] === '15') {
                        wantedIndex = i;
                      }
                    }

                    TestUtils.waitAnimation(400).then(() => {
                      days[wantedIndex].click();

                      driver.wait(until.elementLocated(webdriver.By.css('input[type="submit"]'))).then((element) => {
                        element.click().then(() => 
                          driver.wait(until.elementLocated(webdriver.By.className('alert-success'))).then(() => {

                            TestUtils.getReplies().then((value) => {
                              if (value) {
                                let string = value.toString();
                                console.log(string);
                                TestUtils.removeReplies().then(() => {
                                  resolve(string);
                                });
                              } else {
                                reject('Replies not found');
                              }    
                            });
                          }));    
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
          .includes('-15T00:00:00.000Z');
      });
    }
    
    if (skipThis) {
      it('Testing time pick', () => {
        const result = expect(new Promise((resolve, reject) => {     
          config.file({file: 'test/append-function-config.json' });

          TestUtils.startServer('test/timepicker-config.json').then((server) => {
            app = server;

            driver = TestUtils.createDriver(browser);
            driver.get('http://localhost:3000');

            driver.wait(until.titleIs('Test form')).then(() => {
              driver.wait(until.elementLocated(webdriver.By.name('time'))).then((element) => {
                element.click();

                TestUtils.waitAnimation(2000).then(() => {
                  driver.wait(until.elementLocated(webdriver.By.className('arrowUp'))).then((element) => {
                  element.click();

                  TestUtils.waitAnimation(2000).then(() => {
                    driver.wait(until.elementLocated(webdriver.By.css('input[type="submit"]'))).then((element) => {
                        element.click().then(() => {
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
        }));

        return result
          .to
          .eventually
          .have
          .deep
          .property('[0].time', '13:00');
      });
    }
    
    if (skipThis) {
      it('Testing table input', () => {
        const result = expect(new Promise((resolve, reject) => {     
          config.file({file: 'test/append-function-config.json' });

          TestUtils.startServer('test/table-config.json').then((server) => {
            app = server;

            driver = TestUtils.createDriver(browser);
            driver.get('http://localhost:3000');

            driver.wait(until.titleIs('Test form')).then(() => {
              driver.wait(until.elementLocated(webdriver.By.linkText('Lisää rivi'))).then((button) => {
                driver.findElements(webdriver.By.css('input[type="text"]')).then((elements) => {
                  elements[0].sendKeys("test");
                  button.click();
                  TestUtils.waitAnimation(400).then(() => {
                    driver.findElements(webdriver.By.css('input[type="text"]')).then((elements) => {
                      elements[3].sendKeys("test");
                        driver.wait(until.elementLocated(webdriver.By.css('input[type="submit"]'))).then((element) => {
                        element.click().then(() => {
                          driver.wait(until.elementLocated(webdriver.By.className('alert-success'))).then(() => {

                            TestUtils.getReplies().then((value) => {
                              if (value) {
                                TestUtils.removeReplies().then(() => {
                                  resolve(value[0]['prefered-contact-datetimes'].length);
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
        }));

        return result
          .to
          .eventually
          .eql(2);
      });
    }
  });
})();
