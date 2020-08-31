'use strict';

var collections = require('*/cartridge/scripts/util/collections');

var Resource = require('dw/web/Resource');
var Transaction = require('dw/system/Transaction');

/**
 * Creates a token. This should be replaced by utilizing a tokenization provider
 * @returns {string} a token
 */
function createToken() {
    return Math.random().toString(36).substr(2);
}

/**
 * Verifies that entered credit card information is a valid card. If the information is valid a
 * credit card payment instrument is created
 * @param {dw.order.Basket} basket Current users's basket
 * @param {Object} paymentInformation - the payment information
 * @param {string} paymentMethodID - paymentmethodID
 * @param {Object} req the request object
 * @return {Object} returns an error object
 */
function Handle(basket, paymentInformation, paymentMethodID, req) { //eslint-disable-line
    var result = false;
    if (paymentInformation.country === 'SG' || paymentInformation.country === 'MY') {
        var currentBasket = basket;
        Transaction.wrap(function () {
            var paymentInstruments = currentBasket.getPaymentInstruments();

            collections.forEach(paymentInstruments, function (item) {
                currentBasket.removePaymentInstrument(item);
            });

            currentBasket.createPaymentInstrument(
                'Hoolah', currentBasket.totalGrossPrice
            );
        });
        result = true;
    }
    return result;
}

/**
 * Authorizes a payment using a credit card. Customizations may use other processors and custom
 *      logic to authorize credit card payment.
 * @param {number} orderNumber - The current order's number
 * @param {dw.order.PaymentInstrument} paymentInstrument -  The payment instrument to authorize
 * @param {dw.order.PaymentProcessor} paymentProcessor -  The payment processor of the current
 *      payment method
 * @return {Object} returns an error object
 */
function Authorize(orderNumber, paymentInstrument, paymentProcessor) {
    // Call service init order here
    var createRequests = require('int_hoolah_core/cartridge/scripts/service/CreateRequests');
    var OrderMgr = require('dw/order/OrderMgr');
    var order = OrderMgr.getOrder(orderNumber);
    var hoolahURL;
    if (order) {
        var countryCode = order.billingAddress.countryCode.value;
        var token = createRequests.createGetTokenRequest(countryCode).object.token;
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
        hoolahURL += '?ORDER_CONTEXT_TOKEN=' + orderContextToken + '&platform=bespoke&version=1.0.1';
    }
    var serverErrors = [];
    var fieldErrors = {};
    var error = false;

    try {
        Transaction.wrap(function () {
            paymentInstrument.paymentTransaction.setTransactionID(orderNumber);
            paymentInstrument.paymentTransaction.setPaymentProcessor(paymentProcessor);
        });
    } catch (e) {
        error = true;
        serverErrors.push(
            Resource.msg('error.technical', 'checkout', null)
        );
    }

    return { fieldErrors: fieldErrors, serverErrors: serverErrors, error: error, redirectLink: hoolahURL, isHoolah: true };
}

exports.Handle = Handle;
exports.Authorize = Authorize;
exports.createToken = createToken;
