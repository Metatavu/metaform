/*jshint esversion: 6 */

(function() {
  'use strict';
  
  const chai = require('chai');
  const expect = chai.expect;
  const webdriver = require('selenium-webdriver');
  const By = webdriver.By;
  const until = webdriver.until;
  const Promise = require('bluebird');
  
  chai.use(require('chai-as-promised'));
  
  
  describe('System test', function() {
      this.timeout(60000);

    
    it('Sanity test, should indicate that testing environment is working properly', () => {
      expect(true).to.equal(true);
    });
    
    it('Test webdriver', () =>{
      var driver = new webdriver.Builder().
        withCapabilities(webdriver.Capabilities.chrome()).
        build();
      
      driver.get('http://www.google.com');
      
      var searchBox = driver.findElement(webdriver.By.name('q'));
      searchBox.sendKeys('simple programmer');
      
      return expect(Promise.resolve(searchBox.getAttribute('value')))
        .to.eventually.eql('simple programmer');
      });
  });
  
})();