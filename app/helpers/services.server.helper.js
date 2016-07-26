'use strict';//NOSONAR
var generalHelper = require('./general.server.helper'),
    StandardError = require('standard-error'),
    mongoose = require('mongoose'),
    Order = mongoose.model('Order'),
    Slot = mongoose.model('Slot'),
    Pricing = mongoose.model('Pricing'),
    Promise = require('bluebird'),
    _ = require('lodash'),
    moment = require('moment'),
    days = generalHelper.days,
    winston = require('winston');


function checkAvailability(lat, lng) {
    var latitude = lat;
    var longutitde = lng;
    if (!latitude || !longutitde) {
        return Promise.reject(new StandardError({
            msgInfo: 'Latitude or Longitude is missing',
            msgCode: 'invalid_location_coordinates'
        }));
    }
    // get location details
    return generalHelper
        .getLocation(latitude, longutitde)
        .then(function (placeDetails) {

            return placeDetails;
        }).then(processPlace).catch(function (err) {
            return new Promise(function (resolve, reject) {

                return reject(new StandardError(err));
            });
        });
}
function gasRequest(req) {

    var availability;//for service availability
    var _reverseCodedSlot = reverseCoding(req.body.day, req.slot);
    var vehicle = req.vehicle;
    var _order = new Order();
    var referredBy = req.refferedBy;
    var user = req.user;
    _order.status = 'new';
    _order.customer = req.user;
    _order.latitude = req.body.latitude;
    _order.longitude = req.body.longitude;
    _order.note = req.body.note;
    _order.refCode = req.body.refCode;
    _order.orderType = req.body.orderType;
    _order.slot = req.slot;
    _order.vehicle = vehicle;
    //1 fetch slot
    //2 fetch reverseCode Slot
    //3 fetch car
    _order.startDay = _reverseCodedSlot.startDay;
    _order.endDay = _reverseCodedSlot.endDay;
    _order.startTime = _reverseCodedSlot.startTime;
    _order.endTime = _reverseCodedSlot.endTime;

    return checkAvailability(_order.latitude, _order.longitude)
        .then(function (responseData) {
            availability = responseData;
            return availability;
        }).then(function () {
            _order.city = availability.city;
            _order.postalCode = availability.postalCode;
            _order.address = availability.address;

            if (req.user.freeOrders) {
                _order.isFree = true;
            }
            return _order.save();
        }).then(function () {
            //check if user was referred by someone free
            if (!!referredBy) {
                referredBy.freeOrders++;
                return referredBy.save();
            }
        }).then(function () {
            //check if order was free
            if (referredBy || _order.isFree) {
                user.freeOrders = _order.isFree ?
                user.freeOrders - 1 : user.freeOrders;
                if (!!referredBy) {
                    user.referredBy = referredBy;
                    return user.save();
                }

            }
        }).then(function () {
            return _order;
        }).catch(function (err) {
            return Promise.reject(new StandardError(err));
        });


}
function getScheduleAsync(_day) {
    var day = _day || 'Monday';
    var index = getDayIndex(day);
    if (index === -1) {
        return Promise
            .reject(new StandardError({
                msgInfo: day + ' is not a valid day',
                msgCode: 'day_is_invalid'
            }));
    }
    var today = days[index];
    var tomorrow = index < 6 ? days[index + 1] : days[0];
    var overmorrow = index < 5 ?
        days[index + 2] : (index === 5 ?
        days[0] : days[1]);
    var yesterday = index > 0 ?
        days[index - 1] : days[6];
    var _slots = [];
    var _slot;
    //select days which starts or ends with today tomorrow or day after tomorrow
    return Slot.find(
        {
            $or: [
                {
                    $or: [
                        {
                            "startDay": today
                        },
                        {
                            "startDay": tomorrow
                        }
                    ]
                },
                {
                    $or: [
                        {
                            "endDay": today
                        }, {
                            "endDay": tomorrow
                        }, {
                            "endDay": overmorrow
                        }
                    ]
                }
            ]
        }).then(function (slots) {
        _.forEach(slots, function (slot) {
            _slot = {};
            _slot.startDay = slot.startDay === yesterday ?
                'Yesterday' : (slot.startDay === today ?
                'Today' : (slot.startDay === tomorrow ?
                'Tomorrow' : 'Day after tomorrow'));
            _slot.endDay = slot.endDay === yesterday ?
                'Yesterday' : (slot.endDay === today ?
                'Today' : (slot.endDay === tomorrow ?
                'Tomorrow' : 'Day after tomorrow'));
            _slot.startTime = slot.startTime;
            _slot.endTime = slot.endTime;
            _slot.id = slot._id;
            _slot.serviceCharges = slot.serviceCharges;
            _slots.push(_slot);
        });
        return _slots;
    });

}
function getDayIndex(day) {
    return _.indexOf(days, day);
}
function getPricingAsync(lat, lng) {
    var availability;
    return checkAvailability(lat, lng)
        .then(function (responseData) {
            availability = responseData;
            return availability;
        }).then(function () {
            if (!availability.found) {
                return Promise
                    .reject(new StandardError({
                        msgInfo: 'We could not fetch details of your area.'
                    }));
            }
            return Pricing
                .findOne({
                    zip: availability.postalCode
                });
        }).then(function (pricing) {
            if (!pricing) {
                return Promise
                    .reject(
                        new StandardError({
                            msgInfo: 'Currently we do not provide service' +
                            ' in your area. We\'ll notify you once we are here.'
                        }));
            }
            return pricing;
        }).catch(function (err) {
            return Promise
                .reject(new StandardError(err));
        });
}

function reverseCoding(today, slot) {
    var _today = getDayIndex(today);
    var _yesterday = _today === 0 ? 6 : _today - 1;
    var _tomorrow = _today === 6 ? 0 : _today + 1;
    var _overmorrow = _today === 5 ? 0 : (_today === 6 ? 1 : _today + 2);
//
//Assuming today of server and today of client is same.
// if bug occurs then we need to fix it here
//
    var momentToday = moment();
    var momentTomorrow = moment().add(1, 'day');
    var momentOvermorrow = moment().add(2, 'day');
    var momentYesterday = moment().subtract(1, 'day');


    var _slotObject = {};

    if (slot.startDay === days[_yesterday]) {
        _slotObject.startDay = days[_yesterday] +
            ',' + momentYesterday.format('DD MMMM');
    } else if (slot.startDay === days[_today]) {
        _slotObject.startDay = days[_today] +
            ',' + momentToday.format('DD MMMM');
    } else if (slot.startDay === days[_tomorrow]) {
        _slotObject.startDay = days[_tomorrow] +
            ',' + momentTomorrow.format('DD MMMM');
    } else if (slot.startDay === days[_overmorrow]) {
        _slotObject.startDay = days[_overmorrow] +
            ',' + momentOvermorrow.format('DD MMMM');
    } else {
        winston.warn('some other day');
        winston.warn(slot.startDay);
    }

    if (slot.endDay === days[_yesterday]) {
        _slotObject.endDay = days[_yesterday] +
            ',' + momentYesterday.format('DD MMMM');
    } else if (slot.endDay === days[_today]) {
        _slotObject.endDay = days[_today] +
            ',' + momentToday.format('DD MMMM');
    } else if (slot.endDay === days[_tomorrow]) {
        _slotObject.endDay = days[_tomorrow] +
            ',' + momentTomorrow.format('DD MMMM');
    } else if (slot.endDay === days[_overmorrow]) {
        _slotObject.endDay = days[_overmorrow] +
            ',' + momentOvermorrow.format('DD MMMM');
    } else {
        winston.warn('some other day');
        winston.warn(slot.endDay);
    }
    _slotObject.startTime = slot.startTime;
    _slotObject.endTime = slot.endTime;
    return _slotObject;

}
function processPlace(places //jshint ignore:line
) {

    var data;

    //jshint ignore:start

    if (places) {
        var place = _.find(places.address_components, function (o) {
            return o.types[0] === 'locality';
        });
        var postalCode = _.find(places.address_components, function (o) {
            return o.types[0] === 'postal_code';
        });

        if (!postalCode) {
            return new Promise(function (resolve, reject) {
                return reject(new StandardError({
                    msgInfo: 'We could not fetch details of your area.',
                    msgCode: 'no_results_found'
                }));
            });
        }
        var pCode = _.toNumber(postalCode.long_name);

        if (_.isNaN(pCode)) {
            return new Promise(function (resolve, reject) {
                return reject(new StandardError({
                    msgInfo: 'We could not fetch details of your area.',
                    msgCode: 'no_results_found'
                }));
            });
        }

        data = {
            city: place.long_name,
            postalCode: postalCode.long_name,
            address: places.formatted_address,
            found: true

        };


        data.available = place.long_name.toLowerCase() === 'boston';

    } else {
        data = {
            city: 'N/A',
            postalCode: 'N/A',
            found: false

        };
        data.available = false;
    }

    //jshint ignore:end
    return data;
}
module.exports = {
    checkAvailabilityAsync: checkAvailability,
    gasRequestAsync: gasRequest,
    getScheduleAsync: getScheduleAsync,
    getPricingAsync: getPricingAsync
};
