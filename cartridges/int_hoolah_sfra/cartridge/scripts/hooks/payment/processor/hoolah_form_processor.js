'use strict';

var COHelpers = require('*/cartridge/scripts/checkout/checkoutHelpers');

/**
 * Verifies the required information for billing form is provided.
 * @param {Object} req - The request object
 * @param {Object} paymentForm - the payment form
 * @param {Object} viewFormData - object contains billing form data
 * @returns {Object} an object that has error information or payment information
 */
function processForm(req, paymentForm, viewFormData) {

    var viewData = viewFormData;
    var creditCardErrors = {};

    if (!req.form.storedPaymentUUID && paymentForm.paymentMethod.value != 'Hoolah') {
        // verify credit card form data
        creditCardErrors = COHelpers.validateCreditCard(paymentForm);
    }

    if (Object.keys(creditCardErrors).length) {
        return {
            fieldErrors: creditCardErrors,
            error: true
        };
    }

    viewData.paymentMethod = {
        value: paymentForm.paymentMethod.value,
        htmlName: paymentForm.paymentMethod.value
    };

    viewData.paymentInformation = {
        country: viewFormData.address.countryCode.value
    };
    viewData.saveCard = paymentForm.creditCardFields.saveCard.checked;

    return {
        error: false,
        viewData: viewData
    };
}

/**
 * Save payment information
 * @param {Object} req - The request object
 * @param {dw.order.Basket} basket - The current basket
 * @param {Object} billingData - payment information
 */
function savePaymentInformation(req, basket, billingData) { // eslint-disable
    return true;
}

exports.processForm = processForm;
exports.savePaymentInformation = savePaymentInformation;
