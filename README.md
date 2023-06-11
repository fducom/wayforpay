var WayForPay = require('wayforpay');
<br>
var wayforpay = new WayForPay(merchant_account, merchant_password);<br>
<br>
var params = {<br>
    'merchantDomainName': 'wepster.com',<br>
    'merchantTransactionSecureType': 'AUTO',<br>
    'serviceUrl': 'http://yourdomain.com/wfp/return',<br>
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







Thanks me:
https://send.monobank.ua/jar/5FSYADyifF



Support:
Wepster.com - Сервіс автоматизації маркетингу, інтеграції месенджерів з crm і побудова чатботів на конструкторі
