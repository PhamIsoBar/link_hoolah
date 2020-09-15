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
    var token = createRequests.createGetTokenRequest(order.billingAddress.countryCode.value).object.token;
    var refundResult;
    if (refundRequest.custom.amount > 0) {
        refundResult = createRequests.createPartialRefundRequest(refundRequest, token).object;
    } else {
        refundResult = createRequests.createFullRefundRequest(refundRequest, token).object;
    }
    Transaction.wrap(function () {
        order.custom.refundRequestId = refundResult.requestId;
        order.custom.refundCode = refundResult.code;
        order.custom.refundStatus = refundResult.status;
        if (refundResult.status === 'ACCEPTED') {
            CustomObjectMgr.remove(refundRequest);
        } else {
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
        var allRefundRequest = CustomObjectMgr.getAllCustomObjects('HoolahRefundRequest');
        var limitRefundCall = args.limitRefundCall > allRefundRequest.count ? allRefundRequest.count : args.limitRefundCall;
        var jobStatus = true;
        var count = 0;
        while (allRefundRequest.hasNext() && count < limitRefundCall) {
            var refundRequest = allRefundRequest.next();
            var hoolahOrderUUID = refundRequest.custom['order-uuid'];
            var orderRefund = OrderMgr.searchOrder(
                'custom.orderHoolahUUID={0}',
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
