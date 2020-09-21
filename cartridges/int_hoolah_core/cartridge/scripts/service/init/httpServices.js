/* eslint-env es6 */
/**
 * This script provides functions init many requests call to Hoolah
 */

var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');
var Site = require('dw/system/Site');

const serviceIDs = {
    id: Site.current.ID !== 'Sites-Site' ? 'hoolah.http.payment' : Site.current.getCustomPreferenceValue('hoolahServicePrefix')
};

const servicePaths = {
    auth: 'auth/login',
    order: {
        initOrder: 'order/initiate',
        refundFull: 'order/{0}/full-refund',
        refundPartial: 'order/{0}/partial-refund',
        orderInfo: 'order/{0}',
        orderFullRefundInfo: 'order/full-refund/{0}',
        orderPartialRefundInfo: 'order/full-refund/{0}'
    }
};
/**
 * Call service to get token from Hoolah
 * @param {Object} svc - The service
 * @param {string} countryCode - The countryCode
 * @returns {boolean} an result for set credential ID
 */
function setCredentialID(svc, countryCode) {
    var hoolahCredentialPrefix = Site.current.ID === 'Sites-Site' ? 'hoolah-auth-cre-' : Site.current.getCustomPreferenceValue('hoolahCredentialPrefix');
    var credentialID = hoolahCredentialPrefix + countryCode;
    try {
        svc.setCredentialID(credentialID);
        return true;
    } catch (error) {
        return false;
    }
}
/**
 * Call service to get token from Hoolah
 * @param {string} serviceID - The service ID
 * @param {string} countryCode - The countryCode
 * @param {string} urlPath - The urlPath for service
 * @returns {Object} an result object
 */
function callGetTokenService(serviceID, countryCode, urlPath) {
    var service;
    var result;
    try {
        service = LocalServiceRegistry.createService(serviceID, {
            createRequest: function (svc) {
                svc.setRequestMethod('POST');
                svc.addHeader('Content-Type', 'application/json');
                svc.addHeader('Accept', 'application/json');
                setCredentialID(svc, countryCode);
                var data = {
                    username: '',
                    password: ''
                };
                data.username = svc.configuration.credential.user;
                data.password = svc.configuration.credential.password;
                svc.setURL(urlPath);
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
 * @param {string} token - Token when init order
 * @param {string} urlPath - urlPath of service
 * @param {Object} data - Data of order
 * @returns {Object} an result object
 */
function handleOrderService(serviceID, token, urlPath, data) {
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
                svc.setURL(urlPath);
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
    serviceIDs: serviceIDs,
    servicePaths: servicePaths,
    callGetTokenService: callGetTokenService,
    handleOrderService: handleOrderService
};
