var WayForPay = require('wayforpay');

var wayforpay = new WayForPay(merchant_account, merchant_password);

var params = {
    'merchantDomainName': 'app.wepster.com',
    'merchantTransactionSecureType': 'AUTO',
    'serviceUrl': 'http://app.wepster.com/wfp/return',
    'orderReference': 'orderid001',
    'orderDate': '14898322',
    'amount': '1.00',
    'currency': 'USD',
    'productName': 'product name',
    'productPrice': orderDatasGet.price,
    'productCount': "1",
    'language': "ru",
};

var generatePurchaseUrl = wayforpay.generatePurchaseUrl(params);

