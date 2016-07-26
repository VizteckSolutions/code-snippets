'use strict';//NOSONAR
var _ = require('lodash');

function getError(err) {
    var errors = [];

    if (err.code === 11000) {
        if (err.message.indexOf('email') > -1) {
            return "Email is already in use";
        }
        else if (err.message.indexOf('phone') > -1) {
            return 'Phone number is already in use.';
        } else if (err.message.indexOf('zip') > -1) {
            return 'Pricing for this area already exists';
        }
    }


    _.forEach(err.errors, function (error) {
        errors.push(error.message);
    });
    return errors[0];

}

module.exports = {
    getError: getError
};