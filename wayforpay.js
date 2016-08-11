'use strict';
/**
 WayForPay api for JavaScript

 Copyright (c) 2016 Dmitry Fedorchuk

 URL: https://github.com/fducom

 Licensed under the MIT license:
 http://www.opensource.org/licenses/mit-license.php

 WayForPay payment system aggregator https://wayforpay.com/

 */
var request = require('request');
var crypto  = require('crypto');
var http_build_query = require('locutus/php/url/http_build_query'); //npm install locutus
//var http_build_query = require('qhttp/http_build_query'); //  var qhttp = require('qhttp'); var http_build_query = require('qhttp/http_build_query'); //  var qhttp = require('qhttp');



/**
 * Constructor.
 *
 * @param string $merchant_account
 * @param string $merchant_password
 *
 * @throws InvalidArgumentException
 */
module.exports = function(merchant_account, merchant_password) {

    // API host

    const PURCHASE_URL = 'https://secure.wayforpay.com/pay';
    const API_URL = 'https://api.wayforpay.com/api';
    const MODE_PURCHASE = 'PURCHASE';
    const API_VERSION = 1;
    /**
     * Call API
     *
     * @param Object $params
     * @param function $callback
     *
     * @return Object
     */
    this.api = function( params, callback, callbackerr){


        params.merchant_account = merchant_account;
        var data = JSON.stringify(params);
        request.post(API_URL , data, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    callback( JSON.parse(body) ) 
                }else{
                    callbackerr(error, response);
                }
            }
        );
    };


    this._prepare = function(action, params)
    {
        this._action = action;
        if (!params || 0 === params.length) {
            throw new Error('Arguments must be not empty');
        }
        this._params = params;
        this._params.transactionType = action;
        this._params.merchantAccount = merchant_account;
        this._params.merchantSignature = $this._buildSignature(params);

        if(this._action !== MODE_PURCHASE) this._params.apiVersion = API_VERSION;
        this._params = this._checkFields(this._params);
    }

    this.generatePurchaseUrl = function(params)
    {
        this._prepare(MODE_PURCHASE, params);
        //dd($this->_params);
        return PURCHASE_URL . '/get?' + http_build_query($this._params);
    }


    /**
     * _checkFields
     *
     * @param Object $params
     *
     * @return status
     *
     * @throws InvalidArgumentException
     */
    this._checkFields = function(params){

        params.merchant_account = merchant_account;

        if(!params.merchantAccount)
            throw new Error('version is null');
        if(!params.merchantDomainName)
            throw new Error('amount is null');
        if(!params.orderReference)
            throw new Error('currency is null');
        if(!params.orderDate)
            throw new Error('description is null');
        if(!params.amount)
            throw new Error('description is null');
        if(!params.currency)
            throw new Error('description is null');
        if(!params.productName)
            throw new Error('description is null');
        if(!params.productCount)
            throw new Error('description is null');
        if(!params.productPrice)
            throw new Error('description is null');
        //if(!params.merchantSignature)
        //    throw new Error('description is null');

        return true;

    };


    /**
     * _buildSignature
     *
     * @param Object params
     *
     * @return string
     */
    this._buildSignature = function(params){

        const secret = params.join(';');
        const hash = crypto.createHmac('md5', secret)
            .update(merchant_password)
            .digest('hex');

        return hash;

    };

    return this;
};