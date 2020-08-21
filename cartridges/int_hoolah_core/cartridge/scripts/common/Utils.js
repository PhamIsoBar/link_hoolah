/**
 * This script provides functions shared across other
 * related scripts. Reused script components for request creation,
 * while this script is imported into the
 * requiring script.
 */
var Logger = require('dw/system/Logger');

function serviceCall() {
    var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');
    var service;
    var result;
    try {
        service = LocalServiceRegistry.createService('hoolah_auth_sing', {
            createRequest: function (svc) {
                svc.setRequestMethod('POST');
                svc.addHeader('Content-Type', 'application/json');
                svc.addHeader('Accept', 'application/json');
                var data = new Object;
                data.username = svc.configuration.credential.user;
                data.password = svc.configuration.credential.password;
                var abc = JSON.stringify(data);
                return JSON.stringify(data);
            },
            parseResponse: function (svc, client) {
                var a = client;
                return client;
            }
        });
        // Make the service call here
        result = service.call();
        var a = result.object.text;
        return result;
    } catch (ex) {
        var a = ex;
        var b = 0;
        return null;
    }
}

/** Exported functions **/
module.exports = {
    serviceCall: serviceCall
}