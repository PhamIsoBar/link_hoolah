'use strict';

var baseBilling = require('base/checkout/billing');

/**
 * Updates the payment information in checkout, based on the supplied order model
 * @param {Object} order - checkout model to use as basis of new truth
 */
function updatePaymentInformation(order) {
    // update payment details
    var $paymentSummary = $('.payment-details'); // eslint-disable-line
    var htmlToAppend = '';

    if (order.billing.payment && order.billing.payment.selectedPaymentInstruments
        && order.billing.payment.selectedPaymentInstruments.length > 0) {
        if (order.billing.payment.selectedPaymentInstruments[0].paymentMethod === 'CREDIT_CARD') {
            htmlToAppend += '<span>' + order.resources.cardType + ' '
                        + order.billing.payment.selectedPaymentInstruments[0].type
                        + '</span><div>'
                        + order.billing.payment.selectedPaymentInstruments[0].maskedCreditCardNumber
                        + '</div><div><span>'
                        + order.resources.cardEnding + ' '
                        + order.billing.payment.selectedPaymentInstruments[0].expirationMonth
                        + '/' + order.billing.payment.selectedPaymentInstruments[0].expirationYear
                        + '</span></div>';
        } else if (order.billing.payment.selectedPaymentInstruments[0].paymentMethod === 'Hoolah') {
            htmlToAppend += order.billing.payment.selectedPaymentInstruments[0].paymentMethod;
        } else {
            htmlToAppend = '';
        }
    }
    $paymentSummary.empty().append(htmlToAppend);
}

module.exports = {
    methods: {
        updateBillingAddressSelector: baseBilling.methods.updateBillingAddressSelector,
        updateBillingAddressFormValues: baseBilling.methods.updateBillingAddressFormValues,
        clearBillingAddressFormValues: baseBilling.methods.clearBillingAddressFormValues,
        updateBillingInformation: baseBilling.methods.updateBillingInformation,
        updatePaymentInformation: updatePaymentInformation,
        clearCreditCardForm: baseBilling.methods.clearCreditCardForm
    },
    showBillingDetails: baseBilling.showBillingDetails,
    hideBillingDetails: baseBilling.hideBillingDetails,
    selectBillingAddress: baseBilling.selectBillingAddress,
    handleCreditCardNumber: baseBilling.handleCreditCardNumber,
    santitizeForm: baseBilling.santitizeForm,
    selectSavedPaymentInstrument: baseBilling.selectSavedPaymentInstrument,
    addNewPaymentInstrument: baseBilling.addNewPaymentInstrument,
    cancelNewPayment: baseBilling.cancelNewPayment,
    clearBillingForm: baseBilling.clearBillingForm,

    paymentTabs: function () {
        $('.payment-options .nav-item').on('click', function (e) {
            e.preventDefault();
            var methodID = $(this).data('method-id');
            $('.payment-information').data('payment-method-id', methodID);
            var methodClass;
            if (methodID === 'Hoolah') {
                methodClass = 'hoolah-content';
            } else if (methodID === 'CREDIT_CARD') {
                methodClass = 'credit-card-content';
            }
            var methodsContent = $('.tab-pane');
            for (var i = 0; i < methodsContent.length; i++) {
                if ($(methodsContent[i]).hasClass(methodClass)) {
                    $(methodsContent[i]).addClass('active');
                } else {
                    $(methodsContent[i]).removeClass('active');
                }
            }
        });
    }
};
