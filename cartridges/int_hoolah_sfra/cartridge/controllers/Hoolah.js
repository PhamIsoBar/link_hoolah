'use strict';

var server = require('server');
var Resource = require('dw/web/Resource');
var HoolahHelper = require('int_hoolah_core/cartridge/scripts/common/HoolahHelper');
var URLUtils = require('dw/web/URLUtils');

server.post('HandleCallback', function (req, res, next) {
    var params = request.httpParameterMap;// eslint-disable-line
    var responseData = JSON.parse(params.requestBodyAsString);
    var OrderMgr = require('dw/order/OrderMgr');
    var Transaction = require('dw/system/Transaction');
    var order = OrderMgr.searchOrder(
        'custom.orderContextToken={0}',
        responseData.order_context_token
    );
    if (responseData.order_status === 'SUCCESS') {
        // Order payment status change to paid
        Transaction.wrap(function () {
            HoolahHelper.placeOrder(order);
            order.setPaymentStatus(require('dw/order/Order').PAYMENT_STATUS_PAID);
            order.custom.cartId = responseData.cart_id;
            order.custom.orderHoolahUUID = responseData.order_uuid;
        });
    } else {
        // Fail order and save error information
        Transaction.wrap(function () {
            order.custom.failureCode = responseData.failure_code;
            order.custom.failureMessage = Resource.msg(responseData.failure_code, 'hoolah', null);
            OrderMgr.failOrder(order, true);
        });
        res.redirect(URLUtils.url('Checkout-Begin'));
        next();
    }
});

server.get('CloseUrl', function (req, res, next) {
    var orderID = req.querystring.orderID;
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
    res.redirect(URLUtils.url('Checkout-Begin'));
    next();
});

module.exports = server.exports();
