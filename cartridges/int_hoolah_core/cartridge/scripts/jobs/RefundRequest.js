'use strict';
var OrderMgr = require('dw/order/OrderMgr');
var CustomObjectMgr = require('dw/object/CustomObjectMgr');
var Transaction = require('dw/system/Transaction');
var Status = require('dw/system/Status');
var Order = require('dw/order/Order');
var createRequests = require('int_hoolah_core/cartridge/scripts/service/CreateRequests');

/**
 * Attempts to place the order
 * @param {Object} refundRequest - The refund request need to be done
 * @param {Object} order - an Object of order to be refunded
 * @param {boolean} jobStatus - status of job
 */
function processingRefundRequest(refundRequest, order, jobStatus) { //eslint-disable-line
    var token = createRequests.createGetTokenRequest(order.billingAddress.countryCode.value).object.token.trim();
    var refundResult;
    var isFullRefund = true;
    var requestIDs = [];
    if (order.custom.hoolahOrderRefundRequestID.length > 0) {
        var existedRequestID = order.custom.hoolahOrderRefundRequestID;
        for (var i = 0; i < existedRequestID.length; i++) {
            requestIDs.push(existedRequestID[i]);
        }
    }

    if (refundRequest.custom.orderRefundAmount > 0) {
        isFullRefund = false;
        refundResult = createRequests.createPartialRefundRequest(refundRequest, token);
    } else {
        refundResult = createRequests.createFullRefundRequest(refundRequest, token);
    }
    Transaction.wrap(function () {
        if (refundResult.object) {
            if (isFullRefund) {
                order.custom.hoolahOrderRefundStatus = refundResult.object.status;
            } else {
                order.custom.hoolahOrderPartialRefundStatus = refundResult.object.status;
                order.custom.hoolahPartialRefundAmount = refundRequest.custom.orderRefundAmount;
            }
            if (refundResult.object.status === 'ACCEPTED') {
                requestIDs.push(refundResult.object.requestId);
                order.custom.hoolahOrderRefundRequestID = requestIDs;
                CustomObjectMgr.remove(refundRequest);
            } else {
                refundRequest.isError = true;
                jobStatus = false;
            }
        } else {
            refundRequest.custom.isError = true;
            jobStatus = false;
        }
    });
}

/**
 * Attempts to place the order
 * @param {Object} args - The parameter of job
 * @return {Object} Job status
 */
function execute(args) {
    try {
        var allRefundRequest = CustomObjectMgr.queryCustomObjects('HoolahRefundRequest', 'custom.isError != true', null);
        var limitRefundCall = args.limitRefundCall > allRefundRequest.count ? allRefundRequest.count : args.limitRefundCall;
        var jobStatus = true;
        var count = 0;
        while (allRefundRequest.hasNext() && count < limitRefundCall) {
            var refundRequest = allRefundRequest.next();
            var hoolahOrderUUID = refundRequest.custom.orderUUID;
            var orderRefund = OrderMgr.searchOrder(
                'custom.hoolahOrderUUID={0}',
                hoolahOrderUUID
            );
            if (orderRefund && (orderRefund.status.value === Order.ORDER_STATUS_OPEN || orderRefund.status.value === Order.ORDER_STATUS_NEW)) {
                processingRefundRequest(refundRequest, orderRefund, jobStatus);
            }
            count++;
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
