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
 * @param {string} token - Token to send request
 * @returns {Object} - result - an result object
 */
function createFullRefundRequest(requestObject, token) {
    var orderUUID = requestObject.custom.orderUUID;
    var requestData = {
        description: requestObject.custom.orderResource
    };
    var urlPath = StringUtils.format('{0}/{1}', hoolahEndPointURL, StringUtils.format(initServices.servicePaths.order.refundFull, orderUUID));
    return initServices.handleOrderService(initServices.serviceIDs.id, token, urlPath, requestData, isJobProcess);
}

/**
 * Call service to init order from Hoolah
 * @param {Object} requestObject - Order object
 * @param {string} token - Token to send request
 * @returns {Object} - result - an result object
 */
function createPartialRefundRequest(requestObject, token) {
    var orderUUID = requestObject.custom.orderUUID;
    var items = [];
    var requestData = {
        description: requestObject.custom.orderResource,
        amount: requestObject.custom.orderRefundAmount
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
    var urlPath = StringUtils.format('{0}/{1}', hoolahEndPointURL, StringUtils.format(initServices.servicePaths.order.refundPartial, orderUUID));
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
    return initServices.handleOrderService(initServices.serviceIDs.id, token, urlPath, isJobProcess);
}

/**
 * Call service to get full refund information from Hoolah
 * @param {string} token - Token to send request
 * @param {string} requestID - Request ID
 * @returns {Object} - result - an result object
 */
function getFullRefundInfoRequest(token, requestID) {
    var urlPath = StringUtils.format('{0}/{1}', hoolahEndPointURL, StringUtils.format(initServices.servicePaths.order.orderFullRefundInfo, requestID));
    return initServices.handleOrderService(initServices.serviceIDs.id, token, urlPath, isJobProcess);
}

/**
 * Call service to get full refund information from Hoolah
 * @param {string} token - Token to send request
 * @param {string} requestID - request ID to get info
 * @returns {Object} - result - an result object
 */
function getPartialRefundInfoRequest(token, requestID) {
    var urlPath = StringUtils.format('{0}/{1}', hoolahEndPointURL, StringUtils.format(initServices.servicePaths.order.orderPartialRefundInfo, requestID));
    return initServices.handleOrderService(initServices.serviceIDs.id, token, urlPath, isJobProcess);
}

/** Exported functions **/
module.exports = {
    createGetTokenRequest: createGetTokenRequest,
    createInitOrderRequest: createInitOrderRequest,
    createFullRefundRequest: createFullRefundRequest,
    createPartialRefundRequest: createPartialRefundRequest,
    getOrderInfoRequest: getOrderInfoRequest,
    getFullRefundInfoRequest: getFullRefundInfoRequest,
    getPartialRefundInfoRequest: getPartialRefundInfoRequest
};
