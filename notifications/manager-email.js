/*jshint esversion: 6 */
/* global __dirname, Promise */

(() => {
  'use strict';
  
  const Form = require(__dirname + '/../form');
  const pug = require('pug');
  const mailer = require(__dirname + '/../services/mailer');
  const util = require('util');
  const User = require(__dirname + '/../model/user');
  const config = require('nconf');
  const KeycloakAdminClient = require('keycloak-admin-client');
  const _ = require('underscore');
  
  class ManagerEmail {
    static _hasRole(role, user) {
      const metaformClientMappings = user.roleMappings.clientMappings[config.get('keycloak:client')];
      if (!metaformClientMappings) {
        return false;
      }
      
      for (let i = 0; i < metaformClientMappings.mappings.length; i++) {
        if (metaformClientMappings.mappings[i].name === role) {
          return true;
        }
      }
      return false;
    }
    
    static _getRelevantEmails(reply) {
      if (config.get('authProvider') === 'keycloak') {
        return new Promise((resolve, reject) => {
          KeycloakAdminClient(config.get('keycloak:admin'))
            .then((keycloakAdminClient) => {
              keycloakAdminClient.users.find(config.get('keycloak:realm'))
                .then((users) => {
                  const userRoleLoads = [];
                  for (let i = 0; i < users.length; i++) {
                    userRoleLoads.push(keycloakAdminClient.users.roleMappings.find(config.get('keycloak:realm'), users[i].id));
                  }
                  Promise.all(userRoleLoads)
                    .then((roleMappings) => {
                      for (let i = 0; i < users.length; i++) {
                        users[i].roleMappings = roleMappings[i];
                      } 
                      const targetingFields = Form.listTargetingFields();
                      for (let j = 0; j < targetingFields.length; j++){
                        let targetingField = targetingFields[j];
                        if (!reply[targetingField.name]) {
                          continue;
                        }
                        
                        let fieldValue = reply[targetingField.name];
                        users = _.filter(users, (user) => { return ManagerEmail._hasRole(fieldValue, user) });
                      }
                      
                      resolve(users.map((user) => {
                        return user.email;
                      }));
                    })
                    .catch(reject);
                })
                .catch(reject);
            })
            .catch(reject);
        }); 
      } else {
        return new Promise((resolve, reject)=> {
          User.find({
            archived: false
          }, (findErr, users) => {
            if (findErr) {
              reject(findErr);
            } else {
              resolve(users.map((user) => {
                return user.email;
              }));
            }
          });
        });
      }
    }
    
    static notify(settings, reply) {
      
      try {
        var viewModel = Form.viewModel();
        var emailContent = pug.renderFile(util.format('%s/../views/mails/received-manager.pug', __dirname), { 
          viewModel: viewModel
        });

        ManagerEmail._getRelevantEmails(reply)
          .then((emails) => {
            for (let i = 0; i < emails.length; i++) {
              mailer.sendMail(emails[i], util.format('Uusi vastaus lomakkeessa %s', viewModel.title), emailContent);
            }
          })
          .catch((emailFetchErr) => {
            console.error("Error finding relevant emails", emailFetchErr);
          });

      } catch(renderEx){
        console.error("Error rendering manager email notification", renderEx);
      }  
    }
  }
  
  module.exports = ManagerEmail;
  
})();