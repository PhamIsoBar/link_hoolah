/**
 * This script provides functions init many requests call to Hoolah
 */

var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');

/**
 * Call service to get token from Hoolah
 * @param {string} serviceID - The service ID
 * @returns {Object} an result object
 */
function callGetTokenService(serviceID) {
    var service;
    var result;
    try {
        service = LocalServiceRegistry.createService(serviceID, {
            createRequest: function (svc) {
                svc.setRequestMethod('POST');
                svc.addHeader('Content-Type', 'application/json');
                svc.addHeader('Accept', 'application/json');
                var data = {
                    username: '',
                    password: ''
                };
                data.username = svc.configuration.credential.user;
                data.password = svc.configuration.credential.password;
                return JSON.stringify(data);
            },
            parseResponse: function (svc, client) {
                return JSON.parse(client.text);
            }
        });
        // Make the service call here
        result = service.call();
        return result;
    } catch (ex) {
        // logger here
        return null;
    }
}


/**
 * Call service to get token from Hoolah
 * @param {string} serviceID - The service ID
 * @param {Object} data - Data of order
 * @param {string} token - Token when init order
 * @returns {Object} an result object
 */
function callInitOrderService(serviceID, data, token) {
    var service;
    var result;
    try {
        service = LocalServiceRegistry.createService(serviceID, {
            createRequest: function (svc, data) { //eslint-disable-line
                svc.setRequestMethod('POST');
                svc.setAuthentication('NONE');
                svc.addHeader('Content-Type', 'application/json');
                svc.addHeader('Accept', 'application/json');
                svc.addHeader('Authorization', 'Bearer ' + token);
                return JSON.stringify(data);
            },
            parseResponse: function (svc, client) { // eslint-disable-line
                return JSON.parse(client.text);
            }
        });
        // Make the service call here
        result = service.call(data);
        return result;
    } catch (ex) {
        // logger here
        return null;
    }
}

/** Exported functions **/
module.exports = {
    callGetTokenService: callGetTokenService,
    callInitOrderService: callInitOrderService
};
