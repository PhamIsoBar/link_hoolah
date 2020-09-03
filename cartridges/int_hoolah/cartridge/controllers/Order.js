'use strict';

/**
 * Controller that manages the order history of a registered user.
 *
 * @module controllers/Order
 */

/* API Includes */
var OrderMgr = require('dw/order/OrderMgr');

/* Script Modules */
var guard = require('*/cartridge/scripts/guard');
var OrderBase = require('app_storefront_controllers/cartridge/controllers/Order');
var COSummary = require('*/cartridge/controllers/COSummary');

function confirm() {
    var order = OrderMgr.getOrder(request.httpParameterMap.ID);
    COSummary.ShowConfirmation(order);
}
/*
 * Module exports
 */

/*
 * Web exposed methods
 */
/** Renders a page with the order history of the current logged in customer.
 * @see module:controllers/Order~history */
exports.History = OrderBase.History;
/** Renders the order detail page.
 * @see module:controllers/Order~orders */
exports.Orders = OrderBase.Orders;
/** Renders a page with details of a single order.
 * @see module:controllers/Order~track */
exports.Track = OrderBase.Track;
/** Renders order complete page
 * @see module:controllers/Order~track */
exports.Confirm = guard.ensure(['get', 'https'], confirm);
