'use strict';//NOSONAR
var mongoose = require('mongoose'),
    vehicleModel = mongoose.model('Vehicle'),
    userModel = mongoose.model('User'),
    orderModel = mongoose.model('Order'),
    pricingModel = mongoose.model('Pricing'),
    vehiclesListModel = mongoose.model('VehicleList'),
    StripeModel = require('mongoose').model('Stripe'),
    slotModel = mongoose.model('Slot'),
    _ = require('lodash');

function fetchOrderById(req, res, next) {
    orderModel.findById(req.orderId).then(function (order) {
        if (!order) {
            return sendErrorResponse(res, 'Order not found');
        }
        req.order = order;
        next();
    }).catch(function (err) {
        return sendErrorResponse(res, 'Order not found', err);
    });
}
function fetchOrderByParam(req, res, next, _id) {
    req.orderId = _id;
    fetchOrderById(req, res, next);
}

function fetchPricingById(req, res, next) {
    pricingModel.findById(req.body.pricing).then(function (pricing) {
        if (!pricing) {
            return sendErrorResponse(res, 'Pricing not Found');
        }
        req.pricing = pricing;
        next();
    }).catch(function (err) {
        return sendErrorResponse(res, 'Pricing not found', err);
    });
}
function fetchPricingByParam(req, res, next, _id) {
    req.body.pricing = _id;
    fetchOrderById(req, res, next);
}
function fetchSlotByParam(req, res, next, _id) {
    req.body.slot = _id;
    fetchSlotById(res, res, next);
}

function fetchSlotById(req, res, next) {
    slotModel.findById(req.body.slot).then(function (slot) {
        if (!slot) {
            return sendErrorResponse(res, 'Slot not found');
        }
        req.slot = slot;
        next();
    }).catch(function (err) {
        return sendErrorResponse(res, 'Slot not found', err);
    });
}
function fetchVehicleByParam(req, res, next, _id) {

    req.body.vehicle = _id;
    fetchVehicleById(req, res, next);

}
function fetchVehicleById(req, res, next) {

    var id = req.body.vehicle;
    vehicleModel.findOne({_id: id}).then(function (vehicle) {
        if (!vehicle) {
            return sendErrorResponse(res, 'Vehicle not found');
        }
        req.vehicle = vehicle;
        next();
    }).catch(function (err) {
        return sendErrorResponse(res, 'Vehicle not found', err);
    });

}

function fetchVehicleListByMake(req, res, next, _id) {

    vehiclesListModel.findOne({makeId: _id}).then(function (veh) {
        if (!veh) {
            return sendErrorResponse(res, 'Vehicle List not found');
        }
        req.vehicle = veh;
        next();
    }).catch(function (err) {
        return sendErrorResponse(res, 'Vehicle List not found', err);
    });
}
function fetchUserCard(req, res, next) {
    StripeModel.findOne({customer: req.user}).then(function (stripeCustomer) {
        req.stripeCustomer = stripeCustomer;
        next();
    });
}
function sortOrderTypes(req, res, next) {
    req.start = Number(req.query.start) || 0;
    req.number = Number(req.query.number) || 10;
    var all = allOrdersSelected(req.query);

    if (all) {
        req.orderTypes = [
            'new', 'assigned', 'unassigned',
            'in-progress', 'finished', 'rejected'];
        return next();
    }

    req.orderTypes = [];
    if (req.query.assigned === 'true') {
        req.orderTypes.push('assigned');
    }
    if (req.query.rejected === 'true') {
        req.orderTypes.push('rejected');
    }
    if (req.query.unassigned === 'true') {
        req.orderTypes.push('unassigned');
    }
    if (req.query.new === 'true') {
        req.orderTypes.push('new');
    }
    if (req.query.finished === 'true') {
        req.orderTypes.push('finished');
    }
    if (req.query.inprogress === 'true') {
        req.orderTypes.push('inprogress');
    }
    return next();
}

function allOrdersSelected(query) {
    var all = true;
    _.forEach(query, function (item, key) {
        if (key === 'all' && item === 'true') {
            all = true;
            return false;
        } else if (key !== 'start' &&
            key !== 'number' &&
            key !== 'all' &&
            item === 'true') {
            all = false;
            return false;
        }
    });
    return all;
}
function fetchDriverByParam(req, res, next, _id) {
    req.driverId = _id;
    fetchDriverById(req, res, next);
}
function fetchDriverById(req, res, next) {
    userModel.findOne({
        _id: req.driverId,
        role: 'driver'
    }).then(function (driver) {
        if (!driver) {
            return sendErrorResponse(res, 'Driver not found.');
        }
        req.driver = driver;
        next();
    }).catch(function (err) {
        return sendErrorResponse(res, 'Something went wrong.', err);
    });
}


function sendErrorResponse(res, errMsg, orginalEror) {
    return res.send({
        status: 'error',
        msgInfo: errMsg,
        orginalError: orginalEror

    });
}
module.exports = {
    fetchOrderById: fetchOrderById,
    fetchOrderByParam: fetchOrderByParam,
    fetchPricingById: fetchPricingById,
    fetchSlotById: fetchSlotById,
    fetchSlotByParam: fetchSlotByParam,
    fetchPricingByParam: fetchPricingByParam,
    fetchVehicleById: fetchVehicleById,
    fetchVehicleByParam: fetchVehicleByParam,
    fetchVehicleListByMake: fetchVehicleListByMake,
    fetchUserCard: fetchUserCard,
    sortOrderTypes: sortOrderTypes,
    fetchDriverByParam: fetchDriverByParam,
    fetchDriverById: fetchDriverById
};
