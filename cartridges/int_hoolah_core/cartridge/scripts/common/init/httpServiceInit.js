var service = require('dw/svc');
var HoolahConstants = require('*/cartridge/scripts/common/HoolahConstants');

service.LocalServiceRegistry.createService(HoolahConstants.SERVICE_ID, {
    createRequest: function (svc, args) {
        if (args) {
            svc.addHeader('Content-Type', 'text/xml');
            return args.toString();
        }
        return null;
    },
    parseResponse: function (svc, client) {
        var responseObject = {};
        if (client.statusCode.valueOf() === 200) {
            var responseHeader = client.getResponseHeader('Set-Cookie');
            responseObject.resonseStr = client.text;
            responseObject.responseHeader = responseHeader;
            return responseObject;
        }
        return null;
    }
});