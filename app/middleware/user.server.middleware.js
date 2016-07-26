/**
 * Created by waqas_noor on 09/06/2016.
 */
'use strict';//NOSONAR
var users = require('mongoose').model('User');
function requiresLogin(req, res, next) {
    if (!req.isAuthenticated()) {
        return res.status(200).send({
            status: "error",
            message: 'user authentication',
            msgInfo: 'User is not authenticated',
            msgCode: 'user_authentication_error'
        });
    }
    next();
}
function isCustomer(req, res, next) {
    if (req.user.role.toLowerCase() !== 'customer') {
        return res.status(200).send({
            status: "error",
            message: 'user authorization',
            msgInfo: 'user is not authorized to perform this action',
            msgCode: 'user_authorization_error'
        });
    }
    next();
}
//functionalty for referral code service

function referredOrder(req, res, next) {
    if (!req.body.refCode) {
        return next();
    }
    if (req.body.refCode === req.user.referralCode) {
        return res.status(200).send({
            status: "error",
            message: 'Gas Request',
            msgInfo: 'You cannot use your referral code.',
            msgCode: 'user_order_referral_code_already_used'
        });
    }
    //user is already referred
    if (req.user.referredBy) {
        return res.status(200).send({
            status: "error",
            message: 'Gas Request',
            msgInfo: 'You have already availed referral service',
            msgCode: 'user_order_referral_code_already_used'
        });
    }
    //user isn't referred so check he do have valid referral code
    users
        .findOne({referralCode: req.body.refCode})
        .then(function (user) {
            if (user) {
                req.refferedBy = user;
                return next();
            }
            return res.send({
                status: "error",
                message: 'Gas Request',
                msgInfo: 'Referral Code is invalid.'
            });
        });
}
function validCordinates(req, res, next) {
    if (!req.body.latitude) {
        return sendErrorResponse(res, 'Latitude is required');
    } else if (!req.body.longitude) {
        return sendErrorResponse(res, 'Longitude is required');
    }
    next();
}
function validOrder(req, res, next) {

    if (!req.body.vehicle) {
        return sendErrorResponse(res, 'vehicle is required');
    }
    if (!req.body.slot) {
        return sendErrorResponse(res, 'slot is required');

    }
    if (!req.body.day) {
        return sendErrorResponse(res, 'day is required');

    }
    if (!req.body.orderType) {
        return sendErrorResponse(res, 'orderType is required');
    }
    next();
}
function sendErrorResponse(res, msgInfo) {
    res.send({
        status: 'error',
        msgInfo: msgInfo
    });
}
module.exports = {
    requiresLogin: requiresLogin,
    requiresCustomer: isCustomer,
    referredOrder: referredOrder,
    validOrder: validOrder,
    validCordinates: validCordinates
};