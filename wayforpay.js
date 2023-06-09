'use strict';
/**
 WayForPay api for JavaScript

 Copyright (c) 2016 Dmytro Fedorchuk

 URL: https://github.com/fducom

 Licensed under the MIT license:
 http://www.opensource.org/licenses/mit-license.php

 WayForPay payment system aggregator https://wayforpay.com/

 */
var request = require('request');
var crypto = require('crypto');
var _ = require('lodash');
var utf8 = require('utf8');

/**
 * Constructor.
 *
 * @param string $merchant_account
 * @param string $merchant_password
 *
 * @throws InvalidArgumentException
 */
module.exports = function (merchant_account, merchant_password) {

    // API host

    const PURCHASE_URL = 'https://secure.wayforpay.com/pay';
    const API_URL = 'https://api.wayforpay.com/api';
    const WIDGET_URL = 'https://secure.wayforpay.com/server/pay-widget.js';
    const FIELDS_DELIMITER = ';';
    const API_VERSION = 1;
    const DEFAULT_CHARSET = 'utf8';
    const MODE_PURCHASE = 'PURCHASE';
    const MODE_SETTLE = 'SETTLE';
    const MODE_CHARGE = 'CHARGE';
    const MODE_REFUND = 'REFUND';
    const MODE_CHECK_STATUS = 'CHECK_STATUS';
    const MODE_P2P_CREDIT = 'P2P_CREDIT';
    const MODE_CREATE_INVOICE = 'CREATE_INVOICE';
    const MODE_P2_PHONE = 'P2_PHONE';
    const COMPLETE_3DS = 'COMPLETE_3DS';
    this._action;
    this._fields;
    this._charset;

    /**
     * Call API
     *
     * @param Object fields
     *
     * @return Object
     */
    this._query = function (call) {

        console.log('_query');

        let data = JSON.stringify(this._fields);

        request.put({
                url: API_URL,
                body: data,
                headers: {'Content-Type': 'application/json; charset=utf-8'}
            }, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    call(body);
                } else {
                    call(body);

                }
            }
        );
    };

    /**
     * Return signature hash
     *
     * @param action
     * @param fields
     * @return mixed
     */
    this.createSignature = function (action, fields) {

        this._prepare(action, fields);
        return this._buildSignature();
    };

    this._prepare = function (action, fields) {
        console.log('_prepare');

        this._action = action;
        if (_.isEmpty(fields)) {
            throw new Error('Arguments must be not empty');
        }
        this._fields = fields;

        this._fields.transactionType = action;
        this._fields.merchantAccount = merchant_account;
        this._fields.merchantSignature = this._buildSignature();

        if (this._action !== MODE_PURCHASE) this._fields.apiVersion = API_VERSION;
        this._checkFields();
    };

    /**
     * MODE_SETTLE
     *
     * @param fields
     * @return mixed
     */
    this.settle = function (fields, cb) {
        this._prepare(MODE_SETTLE, fields);
        return this._query(cb);
    };

    /**
     * MODE_CHARGE
     *
     * @param fields
     * @return mixed
     */
    this.charge = function (fields, cb) {
        this._prepare(MODE_CHARGE, fields);

        return this._query(cb);
    };

    /**
     * MODE_REFUND
     *
     * @param fields
     * @return mixed
     */
    this.refund = function (fields, cb) {
        this._prepare(MODE_REFUND, fields);
        return this._query(cb);
    };

    /**    "wayforpay": "0.0.1"

     * MODE_CHECK_STATUS
     *
     * @param fields
     * @return mixed
     */
    this.checkStatus = function (fields, cb) {
        this._prepare(MODE_CHECK_STATUS, fields);
        return this._query(cb);
    };

    /**
     * COMPLETE_3DS
     *
     * @param fields
     * @return mixed
     */
    this.complete3ds = function (fields, cb) {
        this._prepare(COMPLETE_3DS, fields);
        return this._query(cb);
    };

    /**
     * MODE_P2P_CREDIT
     *
     * @param fields
     * @return mixed
     */
    this.account2card = function (fields, cb) {
        this._prepare(MODE_P2P_CREDIT, fields);
        return this._query(cb);
    };

    /**
     * MODE_P2P_CREDIT
     *
     * @param fields
     * @return mixed
     */
    this.createInvoice = function (fields, cb) {
        this._prepare(MODE_CREATE_INVOICE, fields);
        return this._query(cb);
    };

    /**
     * MODE_P2P_CREDIT
     *
     * @param fields
     * @return mixed
     */
    this.account2phone = function (fields, cb) {
        this._prepare(MODE_P2_PHONE, fields);
        return this._query(cb);
    };
    /**
     * MODE_PURCHASE
     * Generate html form
     *
     * @param fields
     * @return string
     */
    this.buildForm = function (fields) {
        this._prepare(MODE_PURCHASE, fields);
        var form = '<form method="POST" action="' + PURCHASE_URL + '" accept-charset="utf-8">';
        _.each(fields, function (value, key) {
            if (_.isArray(key)) {
                _.each(key, function (fild) {
                    form += '<input type="hidden" name="' + key + '[]" value="' + fild + '" />';
                });
            } else {
                form += '<input type="hidden" name="' + key + '" value="' + value + '" />';
            }
        });
        form += '<input type="submit" value="Submit purchase form"></form>';
        return form;
    };
    /**
     * MODE_PURCHASE
     * If GET redirect is used to redirect to purchase form, i.e.
     * https://secure.wayforpay.com/pay/get?merchantAccount=test_merch_n1&merchantDomainName=domain.ua&merchantSignature=c6d08855677ec6beca68e292b2c3c6ae&orderReference=RG3656-1430373125&orderDate=1430373125&amount=0.16&currency=UAH&productName=Saturn%20BUE%201.2&productPrice=0.16&productCount=1&language=RU
     *
     * @param fields
     * @return string
     */
    this.generatePurchaseUrl = function (fields) {
        this._prepare(MODE_PURCHASE, fields);
        return PURCHASE_URL + '/get?' + serialize(fields);
    };


    this._getFieldsNameForSignature = function () {
        console.log('_getFieldsNameForSignature');

        const purchaseFieldsAlias = [
            'merchantAccount',
            'merchantDomainName',
            'orderReference',
            'orderDate',
            'amount',
            'currency',
            'productName',
            'productCount',
            'productPrice'
        ];
        switch (this._action) {
            case 'COMPLETE_3DS':
                return [
                    'transactionType',
                    'authorization_ticket',
                    'd3ds_pares'
                ];
                break;
            case 'ACCEPT':
                return [
                    'orderReference',
                    'status',
                    'time',
                ];
                break;

            case 'PURCHASE':
                return purchaseFieldsAlias;
                break;
            case 'REFUND':
                return [
                    'merchantAccount',
                    'orderReference',
                    'amount',
                    'currency'
                ];
            case 'CHECK_STATUS':
                return [
                    'merchantAccount',
                    'orderReference'
                ];
                break;
            case 'CHARGE':
                return purchaseFieldsAlias;
                break;
            case 'SETTLE':
                return [
                    'merchantAccount',
                    'orderReference',
                    'amount',
                    'currency'
                ];
                break;
            case MODE_P2P_CREDIT:
                return [
                    'merchantAccount',
                    'orderReference',
                    'amount',
                    'currency',
                    'cardBeneficiary',
                    'rec2Token',
                ];
                break;
            case MODE_CREATE_INVOICE:
                return purchaseFieldsAlias;
                break;
            case MODE_P2_PHONE:
                return [
                    'merchantAccount',
                    'orderReference',
                    'amount',
                    'currency',
                    'phone',
                ];
                break;
            default:
                throw new Error('Unknown transaction type: ' + this._action);
        }
    };


    /**
     * _checkFields
     *
     * @param Object fields
     *
     * @return status
     *
     * @throws InvalidArgumentException
     */
    this._checkFields = function () {
        console.log('_checkFields');
        let required = this._getRequiredFields;
        let error = [];
        let parameters = this._fields;
        _(required).forEach(function (item) {
            if (array_key_exists(item, parameters)) {
                if (!(parameters[item])) {
                    error.push(item);
                }
            } else {
                error.push(item);
            }
        });

        if (!_.isEmpty(error)) { //!_.isEmpty
            throw new Error('Missed required field(s): ' + JSON.stringify(error));
        }

        return true;

    };


    /**
     * _buildSignature
     *
     * @param Object fields
     *
     * @return string
     */
    this._buildSignature = function () {
        console.log('_buildSignature');

        let signFields = this._getFieldsNameForSignature();
        let data = [];
        let error = [];
        let parameters = this._fields;

        _(signFields).forEach(function (item) {
            if (array_key_exists(item, parameters)) {
                let value = parameters[item];
                if (_.isArray(value)) {
                    let arrParam = _.values(value);
                    const str = arrParam.join(FIELDS_DELIMITER);
                    data.push(str + "");
                } else {
                    data.push(value + "");
                }
            } else {
                error.push(item);
            }
        });

        if (!_.isEmpty(error)) {
            throw new Error('Missed signature field(s): ' + JSON.stringify(error));
        }
        let arrParam = _.values(data);
        let secret = arrParam.join(FIELDS_DELIMITER);

        const hash = crypto.createHmac('md5', merchant_password)
            .update(secret)
            .digest('hex');

        return hash;

    };


    this._getRequiredFields = function () {
        switch (this._action) {
            case 'PURCHASE':
                return [
                    'merchantAccount',
                    'merchantDomainName',
                    'merchantTransactionSecureType',
                    'orderReference',
                    'orderDate',
                    'amount',
                    'currency',
                    'productName',
                    'productCount',
                    'productPrice'
                ];
            case 'SETTLE':
                return [
                    'transactionType',
                    'merchantAccount',
                    'orderReference',
                    'amount',
                    'currency',
                    'apiVersion'
                ];
            case 'ACCEPT':
                return [
                    'orderReference',
                    'status',
                    'time',
                ];
            case 'CHARGE':
                var required = [
                    'transactionType',
                    'merchantAccount',
                    'merchantDomainName',
                    'orderReference',
                    'apiVersion',
                    'orderDate',
                    'amount',
                    'currency',
                    'productName',
                    'productCount',
                    'productPrice'
                ];
                let additional = (this._fields['recToken']) ?
                    ['recToken'] :
                    ['card', 'expMonth', 'expYear', 'cardCvv', 'cardHolder'];
                return required.concat(additional).unique();
            case 'REFUND':
                return [
                    'transactionType',
                    'merchantAccount',
                    'orderReference',
                    'amount',
                    'currency',
                    'comment',
                    'apiVersion'
                ];
            case 'CHECK_STATUS':
                return [
                    'transactionType',
                    'merchantAccount',
                    'orderReference',
                    'apiVersion'
                ];
            case 'COMPLETE_3DS':
                return [
                    'transactionType',
                    'authorization_ticket',
                    'd3ds_pares'
                ];
            case MODE_P2P_CREDIT:
                return [
                    'transactionType',
                    'merchantAccount',
                    'orderReference',
                    'amount',
                    'currency',
                    'cardBeneficiary',
                    'merchantSignature'
                ];
            case MODE_CREATE_INVOICE:
                return [
                    'transactionType',
                    'merchantAccount',
                    'merchantDomainName',
                    'orderReference',
                    'amount',
                    'currency',
                    'productName',
                    'productCount',
                    'productPrice'
                ];
            case MODE_P2_PHONE:
                return [
                    'merchantAccount',
                    'orderReference',
                    'orderDate',
                    'currency',
                    'amount',
                    'phone',
                    'apiVersion'
                ];
                break;
            default:
                throw new Error('Unknown transaction type');
        }
    };


    this.buildWidgetButton = function (fields, callback = null) {
        this._prepare(MODE_PURCHASE, fields);
        let button = '<script id="widget-wfp-script" language="javascript" type="text/javascript" src="' + WIDGET_URL + '"></script>';
        button += '<script type="text/javascript">';
        button += 'var wayforpay = new Wayforpay();';
        button += 'var pay = function () {';
        button += '    wayforpay.run(' + JSON.stringify(this._fields) + ');';
        button += '}';
        button += 'window.addEventListener("message", ' + (callback ? callback : "receiveMessage") + ');';
        button += 'function receiveMessage(event)';
        button += '{';
        button += '    if(';
        button += '        event.data == "WfpWidgetEventClose" ||      //при закрытии виджета пользователем';
        button += '        event.data == "WfpWidgetEventApproved" ||   //при успешном завершении операции';
        button += '        event.data == "WfpWidgetEventDeclined" ||   //при неуспешном завершении';
        button += '        event.data == "WfpWidgetEventPending")      // транзакция на обработке';
        button += '    {';
        button += '        console.log(event.data);';
        button += '    }';
        button += '}';
        button += '</script>';
        button += '<button type="button" onclick="pay();">Оплатить</button>';
        return button;
    };


    ////refact

    var serialize = function (obj) {
        let str = [];
        for (var p in obj)
            if (obj.hasOwnProperty(p)) {
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
            }
        return str.join("&");
    };

    var array_key_exists = function (key, search) {

        if (!search || (search.constructor !== Array && search.constructor !== Object)) {
            return false;
        }

        return search[key] !== undefined;
    };
    ////refactend

    return this;
};
