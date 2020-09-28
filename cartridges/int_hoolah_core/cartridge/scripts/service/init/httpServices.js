/* eslint-env es6 */
/**
 * This script provides functions init many requests call to Hoolah
 */

var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');
var Site = require('dw/system/Site');
var HoolahConstants = require('int_hoolah_core/cartridge/scripts/common/HoolahConstants');

const serviceIDs = {
    id: Site.current.ID === 'Sites-Site' ? HoolahConstants.SERVICE_ID_DEFAULT_PREFIX : Site.current.getCustomPreferenceValue('hoolahServicePrefix')
};

const servicePaths = {
    auth: 'auth/login',
    order: {
        initOrder: 'order/initiate',
        refund: 'order/{0}/partial-refund',
        orderInfo: 'order/{0}',
        orderRefundInfo: 'order/full-refund/{0}'
    }
};
/**
 * Call service to get token from Hoolah
 * @param {Object} svc - The service
 * @param {string} countryCode - The countryCode
 * @returns {boolean} an result for set credential ID
 */
function setCredentialID(svc, countryCode) {
    var hoolahCredentialPrefix = Site.current.ID === 'Sites-Site' ? HoolahConstants.SERVICE_CRED_DEFAULT_PREFIX : Site.current.getCustomPreferenceValue('hoolahCredentialPrefix');
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
 * @param {boolean} isJobProcess - Check if API all in job
 * @returns {Object} an result object
 */
function callGetTokenService(serviceID, countryCode, urlPath, isJobProcess) {
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
                if (isJobProcess) {
                    urlPath = svc.configuration.credential.URL + urlPath;
                }
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
 * @param {boolean} isJobProcess - Check if API all in job
 * @param {boolean} isGetMethod - Check if use GET method for API
 * @returns {Object} an result object
 */
function handleOrderService(serviceID, token, urlPath, data, isJobProcess, isGetMethod) {
    var service;
    var result;
    try {
        service = LocalServiceRegistry.createService(serviceID, {
            createRequest: function (svc, data) { //eslint-disable-line
                if (isGetMethod) {
                    svc.setRequestMethod('GET');
                }
                svc.setAuthentication('NONE');
                svc.addHeader('Content-Type', 'application/json');
                svc.addHeader('Accept', 'application/json');
                svc.addHeader('Authorization', 'Bearer ' + token);
                if (isJobProcess) {
                    urlPath = svc.configuration.credential.URL + urlPath;
                }
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
