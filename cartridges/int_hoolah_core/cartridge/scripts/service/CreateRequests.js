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
var isJobProcess = (Site.current.ID === 'Sites-Site') || false;
var hoolahEndPointURL = isJobProcess ? '' : Site.current.getCustomPreferenceValue('hoolahEndPointURL');

/**
 * Call service to get token from Hoolah
 * @param {string} countryCode - The country code of billing address
 * @returns {Object} result - an result object
 */
function createGetTokenRequest(countryCode) {
    var urlPath = StringUtils.format('{0}/{1}', hoolahEndPointURL, initServices.servicePaths.auth);

    return initServices.callGetTokenService(initServices.serviceIDs.id, countryCode, urlPath, isJobProcess);
}

/**
 * Call service to init order from Hoolah
 * @param {Object} order - Order object
 * @param {string} token - Token to init order in Hoolah
 * @returns {Object} - result - an result object
 */
function createInitOrderRequest(order, token) {
    var orderData = HoolahHelper.getOrderJSON(order);
    var urlPath = StringUtils.format('{0}/{1}', hoolahEndPointURL, initServices.servicePaths.order.initOrder);
    return initServices.handleOrderService(initServices.serviceIDs.id, token, urlPath, orderData, isJobProcess);
}

/**
 * Call service to init order from Hoolah
 * @param {Object} requestObject - Order object
 * @param {double} amount - Amount to refund
 * @param {string} token - Token to send request
 * @param {string} orderUUID - orderUUID to send request
 * @returns {Object} - result - an result object
 */
function createRefundRequest(requestObject, amount, token, orderUUID) {
    var items = [];
    var requestData = {
        description: requestObject.custom.orderResource,
        amount: amount
    };
    if (requestObject.custom.orderRefundItems.length > 0) {
        var itemRefund = requestObject.custom.orderRefundItems;
        for (var i = 0; i < itemRefund.length; i++) {
            items.push({
                sku: itemRefund[i]
            });
        }
    }
    if (items.length > 0) {
        requestData.items = items;
    }
    var urlPath = StringUtils.format('{0}/{1}', hoolahEndPointURL, StringUtils.format(initServices.servicePaths.order.refund, orderUUID));
    return initServices.handleOrderService(initServices.serviceIDs.id, token, urlPath, requestData, isJobProcess);
}

/**
 * Call service to get order information from Hoolah
 * @param {string} orderUUID - Order Hoolah UUID
 * @param {string} token - Token to send request
 * @returns {Object} - result - an result object
 */
function getOrderInfoRequest(orderUUID, token) {
    var urlPath = StringUtils.format('{0}/{1}', hoolahEndPointURL, StringUtils.format(initServices.servicePaths.order.orderInfo, orderUUID));
    return initServices.handleOrderService(initServices.serviceIDs.id, token, urlPath, {}, isJobProcess, true);
}

/**
 * Call service to get full refund information from Hoolah
 * @param {string} token - Token to send request
 * @param {string} requestID - Request ID
 * @returns {Object} - result - an result object
 */
function getRefundInfoRequest(token, requestID) {
    var urlPath = StringUtils.format('{0}/{1}', hoolahEndPointURL, StringUtils.format(initServices.servicePaths.order.orderRefundInfo, requestID));
    return initServices.handleOrderService(initServices.serviceIDs.id, token, {}, urlPath, isJobProcess, true);
}

/** Exported functions **/
module.exports = {
    createGetTokenRequest: createGetTokenRequest,
    createInitOrderRequest: createInitOrderRequest,
    createRefundRequest: createRefundRequest,
    getOrderInfoRequest: getOrderInfoRequest,
    getRefundInfoRequest: getRefundInfoRequest
};
