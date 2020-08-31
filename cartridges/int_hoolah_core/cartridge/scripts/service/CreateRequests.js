/* eslint-disable no-undef */
/** *******************************************************************************
*
* Description: Contains the functions to construct the request object for the
* various Hoolah requests.
*
*
/*********************************************************************************/
var Logger = require('dw/system/Logger');
var HoolahConstants = require('*/cartridge/scripts/common/HoolahConstants');
var initServices = require('int_hoolah_core/cartridge/scripts/service/init/httpServices');
var Resource = require('dw/web/Resource');
var HoolahHelper = require('int_hoolah_core/cartridge/scripts/common/HoolahHelper');

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

function createInitOrderRequest(order, token) {
    var orderData = HoolahHelper.getOrderJSON(order);
    return initServices.callInitOrderService(HoolahConstants.INIT_ORDER_SERVICE, orderData, token);
}

/** Exported functions **/
module.exports = {
    createGetTokenRequest: createGetTokenRequest,
    createInitOrderRequest: createInitOrderRequest
}