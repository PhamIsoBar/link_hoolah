'use strict';

/* API Includes */
var Cart = require('*/cartridge/scripts/models/CartModel');
var PaymentMgr = require('dw/order/PaymentMgr');
var Transaction = require('dw/system/Transaction');

/* Script Modules */

/**
 * Verifies a credit card against a valid card number and expiration date and possibly invalidates invalid form fields.
 * If the verification was successful a credit card payment instrument is created.
 * @param {Object} args param for handle order
 * @returns {Object} status of handle order
 */
function Handle(args) {
    var cart = Cart.get(args.Basket);
    Transaction.wrap(function () {
        var paymentInstruments = cart.getPaymentInstruments();

        for (var i = 0; i < paymentInstruments.length; i++) {
            cart.removePaymentInstrument(paymentInstruments[i]);
        }

        cart.createPaymentInstrument(
            'Hoolah', cart.getNonGiftCertificateAmount()
        );
    });

    return { success: true };
}

/**
 * Authorizes a payment using a credit card. The payment is authorized by using the BASIC_CREDIT processor
 * only and setting the order no as the transaction ID. Customizations may use other processors and custom
 * logic to authorize credit card payment.
 * @param {Object} args - Params for authorzie order
 * @returns {Object} status of authorize order
 */
function Authorize(args) {
    var orderNo = args.OrderNo;
    var createRequests = require('int_hoolah_core/cartridge/scripts/service/CreateRequests');
    var StringUtils = require('dw/util/StringUtils');
    var order = args.Order;
    var hoolahURL;
    if (order) {
        var countryCode = order.billingAddress.countryCode.value;
        var tokenResult = createRequests.createGetTokenRequest(countryCode);
        if (tokenResult.ok) {
            var token = createRequests.createGetTokenRequest(countryCode).object.token;
            var initOrderHoolahResult = createRequests.createInitOrderRequest(order, token);
            if (!initOrderHoolahResult.ok) {
                return { error: true, isHoolah: true };
            } else {
                var initOrderHoolah = createRequests.createInitOrderRequest(order, token).object;
                var orderContextToken = initOrderHoolah.orderContextToken;
                Transaction.wrap(function () {
                    order.custom.orderContextToken = orderContextToken;
                });
                if (countryCode === 'SG') {
                    hoolahURL = require('dw/system/Site').current.getCustomPreferenceValue('hoolahLandingPageSing');
                } else {
                    hoolahURL = require('dw/system/Site').current.getCustomPreferenceValue('hoolahLandingPageMalay');
                }
                hoolahURL = StringUtils.format(hoolahURL, orderContextToken);
            }
        } else {
            return { error: true, isHoolah: true };
        }
    }
    var paymentInstrument = args.PaymentInstrument;
    var paymentProcessor = PaymentMgr.getPaymentMethod(paymentInstrument.getPaymentMethod()).getPaymentProcessor();

    Transaction.wrap(function () {
        paymentInstrument.paymentTransaction.transactionID = orderNo;
        paymentInstrument.paymentTransaction.paymentProcessor = paymentProcessor;
    });

    return { authorized: true, redirectLink: hoolahURL, isHoolah: true };
}

/*
 * Module exports
 */

/*
 * Local methods
 */
exports.Handle = Handle;
exports.Authorize = Authorize;
