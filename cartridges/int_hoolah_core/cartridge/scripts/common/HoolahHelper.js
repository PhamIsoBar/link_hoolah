/**
 * This script provides functions shared across other
 * related scripts. Reused script components for request creation,
 * while this script is imported into the
 * requiring script.
 */
var HoolahConstants = require('int_hoolah_core/cartridge/scripts/common/HoolahConstants');
var URLUtils = require('dw/web/URLUtils');

/**
 * Get JSON string of order
 * @param {dw.order.Order} order - The order object to be placed
 * @param {Object} fraudDetectionStatus - an Object returned by the fraud detection hook
 * @returns {Object} an error object
 */
function getOrderJSON(order) {
    var orderData = new Object();
    var shippingAddress = new Object();
    var billingAddress = new Object();
    var items = [];

    shippingAddress.line1 = order.shipments[0].shippingAddress.address1;
    shippingAddress.line2 = order.shipments[0].shippingAddress.address2;
    shippingAddress.suburb = order.shipments[0].shippingAddress.city;
    shippingAddress.postcode = order.shipments[0].shippingAddress.postalCode;
    shippingAddress.countryCode = order.shipments[0].shippingAddress.countryCode.value;

    billingAddress.line1 = order.billingAddress.address1;
    billingAddress.line2 = order.billingAddress.address2;
    billingAddress.suburb = order.billingAddress.city;
    billingAddress.postcode = order.billingAddress.postalCode;
    billingAddress.countryCode = order.billingAddress.countryCode.value;

    var productLineItems = order.productLineItems;
    for (var i = 0; i < productLineItems.length; i++) {
        var lineItem = new Object();
        lineItem.name = productLineItems[i].productName;
        lineItem.description = productLineItems[i].lineItemText;
        lineItem.sku = productLineItems[i].productID;
        lineItem.ean = productLineItems[i].product.EAN;
        lineItem.quantity = productLineItems[i].quantityValue;
        lineItem.originalPrice = productLineItems[i].adjustedGrossPrice.value;
        lineItem.price = productLineItems[i].adjustedNetPrice.value;
        lineItem.taxAmount = order.productLineItems[i].tax.value;
        lineItem.detailDescription = order.productLineItems[i].tax.value;
        var images = [];
        var productImages = productLineItems[i].product.getImages('small');
        var firstImage = productImages[0];
        if (firstImage) {
            images.push({
                imageLocation: firstImage.absURL.toString()
            });
        }
        lineItem.images = images;
        items.push(lineItem);
    }
    orderData.consumerEmail = order.customerEmail;
    orderData.consumerFirstName = order.billingAddress.firstName;
    orderData.consumerMiddleName = '';
    orderData.consumerLastName = order.billingAddress.lastName;
    orderData.consumerTitle = '';
    orderData.consumerPhoneNumber = order.billingAddress.phone;
    orderData.consumerPhoneNumberExtension = (order.billingAddress.countryCode.value === 'SG') ? HoolahConstants.PHONE_EXT_SING : HoolahConstants.PHONE_EXT_MALAY;
    orderData.cartId = order.orderNo;
    orderData.totalAmount = order.totalGrossPrice.value;
    orderData.originalAmount = order.adjustedMerchandizeTotalNetPrice.value;
    orderData.orderType = HoolahConstants.ORDER_TYPE;
    orderData.currency = order.currencyCode;
    orderData.taxAmount = order.totalTax.value;
    orderData.shippingMethod = order.shipments[0].shippingMethod.displayName;
    var couponLineItems = order.couponLineItems;
    var voucherCode = '';
    if (couponLineItems.length > 0) {
        for (var j = 0; j < couponLineItems.length; j++) {
            voucherCode += couponLineItems[j].couponCode;
        }
    }
    orderData.voucherCode = voucherCode;
    orderData.shippingAmount = order.shippingTotalNetPrice.value;
    orderData.callbackUrl = URLUtils.https('Hoolah-HandleCallback').toString();
    orderData.closeUrl = URLUtils.https('Hoolah-CloseUrl', 'orderID', order.orderNo).toString();
    orderData.returnToShopUrl = URLUtils.https('Order-Confirm', 'ID', order.orderNo, 'token', order.orderToken).toString();
    orderData.shippingAddress = shippingAddress;
    orderData.billingAddress = billingAddress;
    orderData.items = items;

    return orderData;
}

/**
 * Attempts to place the order
 * @param {dw.order.Order} order - The order object to be placed
 * @param {Object} fraudDetectionStatus - an Object returned by the fraud detection hook
 * @returns {Object} an error object
 */
function placeOrder(order) {
    var result = { error: false };
    var Transaction = require('dw/system/Transaction');
    var Status = require('dw/system/Status');
    var OrderMgr = require('dw/order/OrderMgr');
    var Order = require('dw/order/Order');

    try {
        Transaction.begin();
        var placeOrderStatus = OrderMgr.placeOrder(order);
        if (placeOrderStatus === Status.ERROR) {
            throw new Error();
        }

        order.setConfirmationStatus(Order.CONFIRMATION_STATUS_CONFIRMED);

        order.setExportStatus(Order.EXPORT_STATUS_READY);
        Transaction.commit();
    } catch (e) {
        Transaction.wrap(function () { OrderMgr.failOrder(order, true); });
        result.error = true;
    }

    return result;
}

/** Exported functions **/
module.exports = {
    getOrderJSON: getOrderJSON,
    placeOrder: placeOrder
};
