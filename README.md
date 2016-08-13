var WayForPay = require('wayforpay');
<br>
var wayforpay = new WayForPay(merchant_account, merchant_password);<br>
<br>
var params = {<br>
    'merchantDomainName': 'app.wepster.com',<br>
    'merchantTransactionSecureType': 'AUTO',<br>
    'serviceUrl': 'http://app.wepster.com/wfp/return',<br>
    'orderReference': 'orderid001',<br>
    'orderDate': '14898322',<br>
    'amount': '1.00',<br>
    'currency': 'USD',<br>
    'productName': 'product name',<br>
    'productPrice': '2.00',<br>
    'productCount': "2",<br>
    'language': "ru",<br>
    };<br>
<br>
var generatePurchaseUrl = wayforpay.generatePurchaseUrl(params);

