/* eslint-disable no-undef */
/** *******************************************************************************
*
* Description: Contains the functions to construct the request object for the
* various Hoolah requests.
*
*
/*********************************************************************************/
var HoolahConstants = require('int_hoolah_core/cartridge/scripts/common/HoolahConstants');
var initServices = require('int_hoolah_core/cartridge/scripts/service/init/httpServices');
var HoolahHelper = require('int_hoolah_core/cartridge/scripts/common/HoolahHelper');


/**
 * Call service to get token from Hoolah
 * @param {string} countryCode - The country code of billing address
 * @returns {Object} result - an result object
 */
function createGetTokenRequest(countryCode) {
    var result;
    if (countryCode === 'SG') {
        result = initServices.callGetTokenService(HoolahConstants.SING_AUTH_SERVICE);
    } else if (countryCode === 'MY') {
        result = initServices.callGetTokenService(HoolahConstants.MALAY_AUTH_SERVICE);
    } else {
        result.error = true;
        result.message = 'Payment not support for this country';
    }
    return result;
}

/**
 * Call service to init order from Hoolah
 * @param {Object} order - Order object
 * @param {string} token - Token to init order in Hoolah
 * @returns {Object} - result - an result object
 */
function createInitOrderRequest(order, token) {
    var orderData = HoolahHelper.getOrderJSON(order);
    return initServices.callInitOrderService(HoolahConstants.INIT_ORDER_SERVICE, orderData, token);
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
    return initServices.callRefundService(HoolahConstants.FULL_REFUND_SERVICE, requestData, token, orderUUID);
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
    return initServices.callRefundService(HoolahConstants.PARTIAL_REFUND_SERVICE, requestData, token, orderUUID);
}

/** Exported functions **/
module.exports = {
    createGetTokenRequest: createGetTokenRequest,
    createInitOrderRequest: createInitOrderRequest,
    createFullRefundRequest: createFullRefundRequest,
    createPartialRefundRequest: createPartialRefundRequest
};
