'use strict';

var HookMgr = require('dw/system/HookMgr');
var OrderMgr = require('dw/order/OrderMgr');
var PaymentMgr = require('dw/order/PaymentMgr');
var Transaction = require('dw/system/Transaction');
var checkoutHelperBase = require('app_storefront_base/cartridge/scripts/checkout/checkoutHelpers');

/**
 * handles the payment authorization for each payment instrument
 * @param {dw.order.Order} order - the order object
 * @param {string} orderNumber - The order number for the order
 * @returns {Object} an error object
 */
function handlePayments(order, orderNumber) {
    var result = {};

    if (order.totalNetPrice !== 0.00) {
        var paymentInstruments = order.paymentInstruments;

        if (paymentInstruments.length === 0) {
            Transaction.wrap(function () { OrderMgr.failOrder(order, true); });
            result.error = true;
        }

        if (!result.error) {
            for (var i = 0; i < paymentInstruments.length; i++) {
                var paymentInstrument = paymentInstruments[i];
                var paymentProcessor = PaymentMgr
                    .getPaymentMethod(paymentInstrument.paymentMethod)
                    .paymentProcessor;
                var authorizationResult;
                if (paymentProcessor === null) {
                    Transaction.begin();
                    paymentInstrument.paymentTransaction.setTransactionID(orderNumber);
                    Transaction.commit();
                } else {
                    if (HookMgr.hasHook('app.payment.processor.' +
                            paymentProcessor.ID.toLowerCase())) {
                        authorizationResult = HookMgr.callHook(
                            'app.payment.processor.' + paymentProcessor.ID.toLowerCase(),
                            'Authorize',
                            orderNumber,
                            paymentInstrument,
                            paymentProcessor
                        );
                    } else {
                        authorizationResult = HookMgr.callHook(
                            'app.payment.processor.default',
                            'Authorize'
                        );
                    }

                    if (authorizationResult.error) {
                        Transaction.wrap(function () { OrderMgr.failOrder(order, true); });
                        result.error = true;
                        if (authorizationResult.isHoolah) {
                            result.isHoolah = true;
                            result.errorMessage = authorizationResult.serverErrors;
                        }
                        break;
                    } else if (authorizationResult.isHoolah) {
                        result.isHoolah = true;
                        result.redirectLink = authorizationResult.redirectLink;
                    }
                }
            }
        }
    }

    return result;
}

/**
 * Handle paymentInstrusment before add or edit paymentIntrusment
 * @param {dw.order.Basket} currentBasket - Current basket
 * @param {string} paymentMethodSelected - payment method
 */
function handlePaymentInstrusment(currentBasket, paymentMethodSelected) {
    var allPaymentInstruments = currentBasket.getPaymentInstruments().iterator();
    var paymentInstruments = currentBasket.getPaymentInstruments(
        paymentMethodSelected
    );
    Transaction.wrap(function () {
        if (paymentInstruments.length > 0) {
            while (allPaymentInstruments.hasNext()) {
                var instrusment = allPaymentInstruments.next();
                if (instrusment.paymentMethod !== paymentMethodSelected) {
                    currentBasket.removePaymentInstrument(instrusment);
                }
            }
        } else {
            currentBasket.removeAllPaymentInstruments();
        }
    });
}


module.exports = {
    getFirstNonDefaultShipmentWithProductLineItems: checkoutHelperBase.getFirstNonDefaultShipmentWithProductLineItems,
    ensureNoEmptyShipments: checkoutHelperBase.ensureNoEmptyShipments,
    getProductLineItem: checkoutHelperBase.getProductLineItem,
    isShippingAddressInitialized: checkoutHelperBase.isShippingAddressInitialized,
    prepareShippingForm: checkoutHelperBase.prepareShippingForm,
    prepareBillingForm: checkoutHelperBase.prepareBillingForm,
    copyCustomerAddressToShipment: checkoutHelperBase.copyCustomerAddressToShipment,
    copyCustomerAddressToBilling: checkoutHelperBase.copyCustomerAddressToBilling,
    copyShippingAddressToShipment: checkoutHelperBase.copyShippingAddressToShipment,
    copyBillingAddressToBasket: checkoutHelperBase.copyBillingAddressToBasket,
    validateFields: checkoutHelperBase.validateFields,
    validateShippingForm: checkoutHelperBase.validateShippingForm,
    validateBillingForm: checkoutHelperBase.validateBillingForm,
    validatePayment: checkoutHelperBase.validatePayment,
    validateCreditCard: checkoutHelperBase.validateCreditCard,
    calculatePaymentTransaction: checkoutHelperBase.calculatePaymentTransaction,
    recalculateBasket: checkoutHelperBase.recalculateBasket,
    handlePayments: handlePayments,
    createOrder: checkoutHelperBase.createOrder,
    placeOrder: checkoutHelperBase.placeOrder,
    savePaymentInstrumentToWallet: checkoutHelperBase.savePaymentInstrumentToWallet,
    getRenderedPaymentInstruments: checkoutHelperBase.getRenderedPaymentInstruments,
    sendConfirmationEmail: checkoutHelperBase.sendConfirmationEmail,
    ensureValidShipments: checkoutHelperBase.ensureValidShipments,
    setGift: checkoutHelperBase.setGift,
    handlePaymentInstrusment: handlePaymentInstrusment
};
