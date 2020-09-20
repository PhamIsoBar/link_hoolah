/* eslint-disable no-undef */
/** *******************************************************************************
*
* Description: Contains the functions to construct the request object for the
* various Hoolah requests.
*
*
/*********************************************************************************/
var Site = require('dw/system/Site');
var StringUtils = require('dw/util/StringUtils');
var initServices = require('int_hoolah_core/cartridge/scripts/service/init/httpServices');
var HoolahHelper = require('int_hoolah_core/cartridge/scripts/common/HoolahHelper');
var hoolahEndPointURL = Site.current.getCustomPreferenceValue('hoolahEndPointURL');

/**
 * Call service to get token from Hoolah
 * @param {string} countryCode - The country code of billing address
 * @returns {Object} result - an result object
 */
function createGetTokenRequest(countryCode) {
    var urlPath = StringUtils.format('{0}/{1}', hoolahEndPointURL, initServices.servicePaths.auth);

    return initServices.callGetTokenService(initServices.serviceIDs.auth, countryCode, urlPath);
}

/**
 * Call service to init order from Hoolah
 * @param {Object} order - Order object
 * @param {string} token - Token to init order in Hoolah
 * @returns {Object} - result - an result object
 */
function createInitOrderRequest(order, token) {
    var orderData = HoolahHelper.getOrderJSON(order);
    var urlPath = StringUtils.format('{0}/{1}', hoolahEndPointURL, initServices.servicePaths.post.initOrder);
    return initServices.orderPostService(initServices.serviceIDs.order, orderData, token, urlPath);
}

/**
 * Call service to init order from Hoolah
 * @param {Object} requestObject - Order object
 * @param {string} token - Token to send request
 * @returns {Object} - result - an result object
 */
function createFullRefundRequest(requestObject, token) {
    var orderUUID = requestObject.custom['order-uuid'];
    var requestData = {
        description: requestObject.custom.description
    };
    var urlPath = StringUtils.format('{0}/{1}', hoolahEndPointURL, StringUtils.format(initServices.servicePaths.post.refundFull, orderUUID));
    return initServices.callRefundService(initServices.serviceIDs.order, requestData, token, urlPath);
}

/**
 * Call service to init order from Hoolah
 * @param {Object} requestObject - Order object
 * @param {string} token - Token to send request
 * @returns {Object} - result - an result object
 */
function createPartialRefundRequest(requestObject, token) {
    var orderUUID = requestObject.custom['order-uuid'];
    var items = [];
    var requestData = {
        description: requestObject.custom.description,
        amount: requestObject.custom.amount
    };
    if (requestObject.custom.items.length > 0) {
        var itemRefund = requestObject.custom.items;
        for (var i = 0; i < itemRefund.length; i++) {
            items.push({
                sku: itemRefund[i]
            });
        }
    }
    if (items.length > 0) {
        requestData.items = items;
    }
    var urlPath = StringUtils.format('{0}/{1}', hoolahEndPointURL, StringUtils.format(initServices.servicePaths.post.refundPartial, orderUUID));
    return initServices.callRefundService(initServices.serviceIDs.order, requestData, token, urlPath);
}

/** Exported functions **/
module.exports = {
    createGetTokenRequest: createGetTokenRequest,
    createInitOrderRequest: createInitOrderRequest,
    createFullRefundRequest: createFullRefundRequest,
    createPartialRefundRequest: createPartialRefundRequest
};
