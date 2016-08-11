var WayForPay = require('wayforpay');
var wayforpay = new WayForPay(merchant_account, merchant_password);
var generatePurchaseUrl = wayforpay.generatePurchaseUrl({
'action'         : 'pay',
'amount'         : '1',
'currency'       : 'USD',
'description'    : 'description text',
'order_id'       : 'order_id_1'
});