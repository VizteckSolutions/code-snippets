/**
 * Created by waqas_noor on 15/06/2016.
 */
'use strict';//NOSONAR
var servicesHelper = require('../helpers/services.server.helper'),
    errorHelper = require('../helpers/error.server.helper.js');

function checkServiceAvailability(req, res) {

    servicesHelper
        .checkAvailabilityAsync(req, res)
        .then(function (responseObject) {
            return sendResponse(null, res, {
                msgInfo: 'info retrieved successfully',
                data: {
                    availability: responseObject
                }
            });
        }).catch(function (err) {
        return sendResponse(err, res);
    });
}
function gasRequest(req, res) {
    servicesHelper
        .gasRequestAsync(req, res)
        .then(function (responseData) {
            return sendResponse(null, res, {
                msgInfo: 'Gas Requested Successfully',
                data: {
                    order: responseData
                }
            });

        }).catch(function (err) {
        return sendResponse(err, res);
    });
}

function getSchedule(req, res) {
    servicesHelper
        .getScheduleAsync(req.query.day)
        .then(function (responseObject) {
            return sendResponse(null, res, {
                msgInfo: 'Schedule Fetching Success',
                data: {
                    schedule: responseObject
                }
            });

        }).catch(function (err) {
        return sendResponse(err, res);
    });
}

function getPricing(req, res) {
    var lat = req.body.latitude;
    var lon = req.body.longitude;
    servicesHelper
        .getPricingAsync(lat, lon)
        .then(function (responseObject) {
            return sendResponse(null, res, {
                msgInfo: 'Pricing Fetch Success',
                data: {
                    pricing: responseObject
                }
            });

        }).catch(function (err) {
        return sendResponse(err, res);
    });
}

function sendResponse(err, res, success) {
    if (err) {
        return res.send({
            status: 'error',
            msgInfo: err.msgInfo ||
            errorHelper.getError(err) ||
            err.msgInfo ||
            'something went wrong'
        });
    }
    return res.send({
        status: 'success',
        msgInfo: success.msgInfo,
        data: success.data
    });
}

module.exports = {
    checkServiceAvailability: checkServiceAvailability,
    gasRequest: gasRequest,
    getSchedule: getSchedule,
    getPricing: getPricing
};