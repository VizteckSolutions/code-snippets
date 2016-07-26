'use strict';//NOSONAR
var conf = require('../../config/config');
var Promise = require('bluebird');
var StandardError = require('standard-error');
var stripe = require("stripe")(conf.stripeApiKey);

function addCustomerAsync(stripeToken) {
    return new Promise(function (resolve, reject) {
        stripe.customers.create({
            source: stripeToken
        }, function (err, customer) {
            // asynchronously called
            if (err) {
                return reject(new StandardError(err));
            }
            resolve(customer);
        });
    });
}
module.exports = {
    addCustomerAsync: addCustomerAsync
};