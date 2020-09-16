'use strict';

/**
 * Controller that manages the order history of a registered user.
 *
 * @module controllers/Hoolah
 */

var guard = require('*/cartridge/scripts/guard');
var URLUtils = require('dw/web/URLUtils');
var Resource = require('dw/web/Resource');
/**
 * Attempts handle call back from Hoolah
 */
function handleCallBack() {
    var params = request.httpParameterMap;// eslint-disable-line
    var responseData = JSON.parse(params.requestBodyAsString);
    var OrderMgr = require('dw/order/OrderMgr');
    var Transaction = require('dw/system/Transaction');
    var HoolahHelper = require('int_hoolah_core/cartridge/scripts/common/HoolahHelper');
    var order = OrderMgr.searchOrder(
        'custom.hoolahOrderToken={0}',
        responseData.order_context_token
    );
    if (responseData.order_status === 'SUCCESS') {
        // Order payment status change to paid
        Transaction.wrap(function () {
            HoolahHelper.placeOrder(order);
            order.setPaymentStatus(require('dw/order/Order').PAYMENT_STATUS_PAID);
            order.custom.cartId = responseData.cart_id;
            order.custom.hoolahOrderUUID = responseData.order_uuid;
        });
    } else {
        // Fail order and save error information
        Transaction.wrap(function () {
            order.custom.failureCode = responseData.failure_code;
            order.custom.failureMessage = Resource.msg(responseData.failure_code, 'hoolah', null);
            OrderMgr.failOrder(order, true);
        });
        response.redirect(URLUtils.url('COShipping-Start'));
    }
}

/**
 * Attempts to handle close browser or redirect back when
 * processing order
 */
function closeUrl() {
    var orderID = request.httpParameterMap.orderID.stringValue;
    var OrderMgr = require('dw/order/OrderMgr');
    var Transaction = require('dw/system/Transaction');
    var order = OrderMgr.searchOrder(
        'orderNo={0}',
        orderID
    );
    // Fail order and save error information
    Transaction.wrap(function () {
        OrderMgr.failOrder(order, true);
    });
    response.redirect(URLUtils.url('COShipping-Start'));
}


/** Handle order result from Hoolah
 * @see module:controllers/Hoolah~handleCallBack */
exports.HandleCallback = guard.ensure(['post'], handleCallBack);

/** Handle fail order
 * @see module:controllers/Order~closeUrl */
exports.CloseUrl = guard.ensure(['get', 'https'], closeUrl);
