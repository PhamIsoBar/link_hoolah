/**
 * This script provides functions init many requests call to Hoolah
 */

var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');


function callGetTokenService(serviceID) {
    var service;
    var result;
    try {
        service = LocalServiceRegistry.createService(serviceID, {
            createRequest: function (svc) {
                svc.setRequestMethod('POST');
                svc.addHeader('Content-Type', 'application/json');
                svc.addHeader('Accept', 'application/json');
                var data = new Object;
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
        var abc = ex;
        //logger here
        return null;
    }
}

function callInitOrderService(serviceID, data, token) {
    var service;
    var result;
    try {
        service = LocalServiceRegistry.createService(serviceID, {
            createRequest: function (svc, data) {
                svc.setRequestMethod('POST');
                svc.setAuthentication('NONE');
                svc.addHeader('Content-Type', 'application/json');
                svc.addHeader('Accept', 'application/json');
                svc.addHeader('Authorization', 'Bearer ' + token);
                var abc = JSON.stringify(data);
                return JSON.stringify(data);
            },
            parseResponse: function (svc, client) {
                return JSON.parse(client.text);
            }
        });
        // Make the service call here
        result = service.call(data);
        return result;
    } catch (ex) {
        //logger here
        var a = ex;
        return null;
    }
}

/** Exported functions **/
module.exports = {
    callGetTokenService: callGetTokenService,
    callInitOrderService: callInitOrderService
}