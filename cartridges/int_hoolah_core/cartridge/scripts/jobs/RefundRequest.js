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
 * @return {boolean} jobStatus - jobStatus for refund request
 */
function processingRefundRequest(refundRequest, order) { //eslint-disable-line
    var token = createRequests.createGetTokenRequest(order.billingAddress.countryCode.value).object.token.trim();
    var refundResult;
    var jobStatus = true;
    var refundableAmount = Math.round((order.totalGrossPrice.value - order.custom.hoolahRefundedAmount) * 100) / 100;
    var isFullRefund = (refundRequest.custom.orderRefundAmount === refundableAmount || !refundRequest.custom.orderRefundAmount) || false;
    var refundAmount = isFullRefund ? refundableAmount : refundRequest.custom.orderRefundAmount;
    var requestIDs = [];
    if (order.custom.hoolahOrderRefundRequestID.length > 0) {
        var existedRequestID = order.custom.hoolahOrderRefundRequestID;
        for (var i = 0; i < existedRequestID.length; i++) {
            requestIDs.push(existedRequestID[i]);
        }
    }
    refundResult = createRequests.createRefundRequest(refundRequest, refundAmount, token, order.custom.hoolahOrderUUID);
    Transaction.wrap(function () {
        if (refundResult.object) {
            if (isFullRefund) {
                order.custom.hoolahOrderRefundStatus = refundResult.object.status;
                order.custom.hoolahOrderPartialRefundStatus = null;
            } else {
                order.custom.hoolahOrderPartialRefundStatus = refundResult.object.status;
            }
            if (refundResult.object.status === 'ACCEPTED') {
                if (!isFullRefund) {
                    var totalPartialRefundAmount = order.custom.hoolahRefundedAmount + refundRequest.custom.orderRefundAmount;
                    order.custom.hoolahRefundedAmount = totalPartialRefundAmount;
                } else {
                    order.custom.hoolahRefundedAmount = order.totalGrossPrice.value;
                    order.setPaymentStatus(require('dw/order/Order').PAYMENT_STATUS_NOTPAID);
                }
                requestIDs.push(refundResult.object.requestId);
                order.custom.hoolahOrderRefundRequestID = requestIDs;
                CustomObjectMgr.remove(refundRequest);
                order.custom.hoolahOrderRefundErrorMessage = null;
            } else {
                order.custom.hoolahOrderRefundErrorMessage = refundResult.object.message;
                refundRequest.isError = true;
                jobStatus = false;
            }
        } else {
            refundRequest.custom.isError = true;
            var errorMessage = JSON.parse(refundResult.errorMessage);
            order.custom.hoolahOrderRefundErrorMessage = errorMessage.message;
            if (isFullRefund) {
                order.custom.hoolahOrderRefundStatus = errorMessage.status;
            } else {
                order.custom.hoolahOrderPartialRefundStatus = errorMessage.status;
            }
            jobStatus = false;
        }
    });
    return jobStatus;
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
            var orderNo = refundRequest.custom.orderNo;
            var orderRefund = OrderMgr.searchOrder(
                'orderNo={0}',
                orderNo
            );
            if (orderRefund && (orderRefund.status.value === Order.ORDER_STATUS_OPEN || orderRefund.status.value === Order.ORDER_STATUS_NEW)) {
                var result = processingRefundRequest(refundRequest, orderRefund);
                if (jobStatus) {
                    jobStatus = result;
                }
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
