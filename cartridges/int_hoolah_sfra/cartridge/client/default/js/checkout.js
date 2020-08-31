'use strict';

var processInclude = require('base/util');
var sfraBilling = require('sfra/checkout/billing');

/**
 * Initialize events
 */
function initializeEvents() {
    processInclude(require('sfra/checkout/checkout'));
    $('.nav-link.hoolah-tab').on('click', function () {
        if (!$(this).hasClass('active')) {
            $('.credit-card-selection-new #credit-card-content').detach();
            if ($('.credit-card-selection-new #hoolah-content').length > 0) {
                $('.credit-card-selection-new #hoolah-content').show();
            } else {
                var hoolahContent = $('.card-content-hidden #hoolah-content').clone();
                $('.credit-card-selection-new .tab-content').append(hoolahContent.show());
            }
        }
    });
    $('.nav-link.credit-card-tab').on('click', function () {
        if (!$(this).hasClass('active')) {
            $('.credit-card-selection-new #hoolah-content').remove();
            if ($('.credit-card-selection-new #credit-card-content').length > 0) {
                $('.credit-card-selection-new #credit-card-content').show();
            } else {
                var creditCardContent = $('.card-content-hidden #credit-card-content').clone();
                $('.credit-card-selection-new .tab-content').append(creditCardContent.show());
                sfraBilling.handleCreditCardNumber();
            }
        }
    });
    // processInclude(require('./checkout/billing'));
    if ($('.nav-item#CREDIT_CARD').length > 0) { // eslint-disable-line
        $('.cardNumber').data('cleave').properties.creditCardStrictMode = true; // eslint-disable-line
    }
}

$(document).ready(function () {// eslint-disable-line
    initializeEvents();
});
