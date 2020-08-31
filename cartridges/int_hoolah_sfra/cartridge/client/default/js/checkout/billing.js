'use strict';

var baseBilling = require('base/checkout/billing');

/**
 * Updates the payment information in checkout, based on the supplied order model
 * @param {Object} order - checkout model to use as basis of new truth
 */
function updatePaymentInformation(order) {
    // update payment details
    var $paymentSummary = $('.payment-details');
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
    paymentTabs: baseBilling.paymentTabs
};
