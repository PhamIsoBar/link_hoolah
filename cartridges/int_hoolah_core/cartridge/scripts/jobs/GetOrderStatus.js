'use strict';
var OrderMgr = require('dw/order/OrderMgr');
var Transaction = require('dw/system/Transaction');
var Status = require('dw/system/Status');
var createRequests = require('int_hoolah_core/cartridge/scripts/service/CreateRequests');

/**
 * Attempts to place the order
 * @param {Object} order - an Object of order to be refunded
 * @param {string} orderStatusType - Order status type for query
 * @param {boolean} jobStatus - status of job
 */
function processingGetInfoRequest(order, orderStatusType, jobStatus) { //eslint-disable-line
    var token = createRequests.createGetTokenRequest(order.billingAddress.countryCode.value).object.token;
    var orderInfo;
    var requestID = order.custom.hoolahOrderRefundRequestID[0];
    Transaction.wrap(function () {
        if (orderStatusType === 'Order') {
            var hoolahOrderUUID = order.custom.hoolahOrderUUID;
            orderInfo = createRequests.getOrderInfoRequest(hoolahOrderUUID, token).object;
            if (orderInfo && order.custom.hoolahOrderStatus !== orderInfo.status) {
                order.custom.hoolahOrderStatus = orderInfo.status;
            }
        } else if (orderStatusType === 'OrderRefund') {
            orderInfo = createRequests.getFullRefundInfoRequest(token, requestID).object;
            if (orderInfo && order.custom.hoolahOrderRefundStatus !== orderInfo.status) {
                order.custom.hoolahOrderRefundStatus = orderInfo.status;
            }
        } else {
            orderInfo = createRequests.getPartialRefundInfoRequest(token, requestID).object;
            if (orderInfo && order.custom.hoolahOrderPartialRefundStatus !== orderInfo.status) {
                order.custom.hoolahOrderPartialRefundStatus = orderInfo.status;
            }
        }
    });
    if (!orderInfo) {
        jobStatus = false;
    }
}

/**
 * Attempts to place the order
 * @param {Object} args - The parameter of job
 * @return {Object} Job status
 */
function execute(args) {
    try {
        var orderStatusType = args.orderStatusType;
        var queryStatus = args.queryStatus;
        var jobStatus = true;
        var orderList;
        if (orderStatusType === 'Order') {
            orderList = OrderMgr.queryOrders('custom.hoolahOrderStatus = {0}', queryStatus);
        } else if (orderStatusType === 'OrderRefund') {
            orderList = OrderMgr.queryOrders('custom.hoolahOrderRefundStatus = {0}', queryStatus);
        } else {
            orderList = OrderMgr.queryOrders('custom.hoolahOrderPartialRefundStatus = {0}', queryStatus);
        }
        while (orderList.hasNext()) {
            var order = orderList.next();
            processingGetInfoRequest(order, orderStatusType, jobStatus);
        }
        return jobStatus ? new Status(Status.OK, 'OK') : new Status(Status.ERROR, 'ERROR');
    } catch (error) {
        // Logger.error('error occured during get order iterator: ' + error.message);
        return new Status(Status.ERROR, 'ERROR');
    }
}

/*
 * Job exposed methods
 */
exports.execute = execute;
