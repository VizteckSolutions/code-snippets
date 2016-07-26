'use strict';//NOSONAR
var promise = require('bluebird');
var StandardError = require('standard-error');
var User = require('mongoose').model('User');
var Vehicle = require('mongoose').model('Vehicle');
var Order = require('mongoose').model('Order');
var VehicleList = require('mongoose').model('VehicleList');
var Stripe = require('mongoose').model('Stripe');
var twilioHelper = require('./twilio.server.helper');
var generalHelper = require('./general.server.helper');
var services = require('./services.server.helper');
var stripeHelper = require('./stripe.server.helper');
var winston = require('winston');
var conf = require('../../config/config');
var _ = require('lodash');
var md5 = require('md5');
function signupAsync(req) {
    var user = new User();
    if (!req.body.latitude) {
        return promise.reject(
            new StandardError({msgInfo: 'Latitude is required'})
        );
    }
    if (!req.body.longitude) {
        return promise.reject(
            new StandardError({msgInfo: 'Longitude is required'})
        );
    }
    if (!req.body.fullName) {
        return promise.reject(
            new StandardError({msgInfo: 'Name is required'})
        );
    }
    if (!req.body.email) {
        return promise.reject(
            new StandardError({msgInfo: 'Email is required'}));
    }
    if (!req.body.password) {
        return promise.reject(
            new StandardError({msgInfo: 'Password is required'}));
    }
    if (!req.body.phone) {
        return promise.reject(
            new StandardError({msgInfo: 'Phone is required'}));
    }
    user.latitude = req.body.latitude;
    user.longitude = req.body.longitude;
    user.fullName = req.body.fullName.trim();
    user.email = req.body.email.trim();
    user.salt = user.generateSalt();

    user.password = user.hashPassword(req.body.password);
    user.phone = req.body.phone;
    user.role = 'customer';
    user.provider = 'local';
    user.referralCode = generalHelper.generateRandomCode();
    user.freeOrders = 1;

    var availability;
    return services.checkAvailabilityAsync(user.latitude, user.longitude)
        .then(function (responseData) {
            availability = responseData;
            return availability;
        }).then(function () {
            user.city = availability.city;
            user.postalCode = availability.postalCode;
            return user.save();
        }).then(function (userObj) {
            //login Here
            return new Promise(function (resolve, reject) {
                req.login(userObj, function (err) {
                    if (err) {
                        return reject(new StandardError(err));
                    }
                    return resolve(userObj);
                });
            });

        }).then(function (userObj) {
            return {
                user: userObj,
                availability: availability
            };
        }).catch(function (err) {
            return promise.reject(err);
        });

}
function createVehicle(req) {
    var _vehicle = new Vehicle(req.body);
    _vehicle.user = req.user;
    return _vehicle
        .save()
        .then(function (vehicleObject) {
            return vehicleObject;
        }).catch(function (err) {
            return err;
        });
}
function listVehicle(req) {
    return Vehicle
        .find({
            'user': req.user,
            isDeleted: false
        })
        .select('name model number year color')
        .then(function (vehicles) {
            if (!vehicles.length) {
                return promise.reject({msgInfo: 'There are no vehicles to view. Kindly, add a vehicle.'})
            }
            return vehicles;
        }).catch(function (err) {
            return err;
        });
}
function verifyPhone(req) {
    var code = generalHelper.generateRandomCode();
    var phoneNumber = req.body.phone;
    if (!phoneNumber) {
        return promise.reject(new StandardError({
            message: 'Phone Verify',
            msgInfo: 'Phone number is missing',
            msgCode: 'verify_phone_missing'
        }));

    }

    return twilioHelper
        .sendCodeAsync(phoneNumber, code, conf.register)
        .then(function (responseObject) {
            return responseObject;
        }).catch(function (err) {
            return promise.reject(new StandardError(err));
        });

}
function sendForgetCode(req) {
    var code = generalHelper.generateRandomFourDigits();
    var phoneNumber = req.body.phone;
    if (!phoneNumber) {
        return promise.reject(new StandardError({
            message: 'Forget Password',
            msgInfo: 'Phone number is missing.',
            msgCode: 'phone_is_missing'
        }));

    }
    return User
        .findOne({phone: phoneNumber})
        .then(function (userObject) {
            return userObject;
        }).then(function (userObject) {
            if (!userObject) {
                throw new StandardError({
                    message: 'Forget Password',
                    msgInfo: 'Invalid phone number.',
                    msgCode: 'user_not_found'
                });
            }
            userObject.forgetToken = code;
            return userObject.save();

        }).then(function () {
            return twilioHelper
                .sendCodeAsync(phoneNumber, code, conf.forgetPassword);
        }).then(function () {
            return md5(code);
        }).catch(function (err) {
            return new StandardError(err);
        });
}
function resetPassword(req) {
    var details = req.body;
    if (!details.code) {
        return new promise.reject(new StandardError({
            msgCode: 'code_is_required',
            message: 'Reset Password',
            msgInfo: 'code is Required'
        }));
    }
    if (!details.password) {
        return new promise.reject(new StandardError({
            msgCode: 'password_is_missing',
            message: 'Reset Password',
            msgInfo: 'Password is Missing'
        }));
    }
    if (!details.phone) {
        return new promise.reject(new StandardError({
            msgCode: 'phone_is_missing',
            message: 'Reset Password',
            msgInfo: 'Phone is Missing'
        }));
    }
    return User
        .findOne({phone: details.phone})
        .then(function (userObject) {
            if (!userObject) {
                return new promise.reject(new StandardError({
                    msgCode: 'user_not_found',
                    message: 'Reset Password',
                    msgInfo: 'User Not Found'
                }));

            }
            if (md5(userObject.forgetToken) !== details.code) {
                return new promise.reject(new StandardError({
                    msgCode: 'invalid_token',
                    message: 'Reset Password',
                    msgInfo: 'Token is invalid'
                }));
            }
            userObject.password = userObject.hashPassword(details.password);
            userObject.forgetToken = '';
            return userObject.save();
        }).then(function (userObj) {
            return userObj;
        }).catch(function (err) {
            return err;
        });


}
function findExistence(req) {
    var phone = req.body.phone ? req.body.phone.trim() : "";
    var email = req.body.email ? req.body.email.trim() : "";
    if (!phone && !email) {
        return promise.reject(new StandardError({
            msgInfo: 'phone and email both are missing',
            msgCode: 'phone_email_not_found'
        }));
    }
    var emailUsed = false;
    var phoneUsed = false;
    return User
        .find({$or: [{phone: phone}, {email: email}]})
        .select('phone email')
        .then(function (users) {
            if (!users.length) {
                return {
                    emailExist: emailUsed,
                    phoneExist: phoneUsed
                };
            }
            _.forEach(users, function (usr) {
                if (!emailUsed && email) {
                    emailUsed = usr.email === email;
                }
                if (!phoneUsed && phone) {
                    phoneUsed = usr.phone === phone;
                }
                if (emailUsed && phoneUsed) {
                    return false;
                }
            });
            if (emailUsed || phoneUsed) {
                if (emailUsed && phoneUsed) {
                    return promise.reject(new StandardError({
                        msgInfo: 'Phone and Email both are already in use',
                        msgCode: 'phone_email_not_available'
                    }));
                } else if (phoneUsed) {
                    return promise.reject(new StandardError({
                        msgInfo: 'Phone is already in use',
                        msgCode: 'phone_not_available'
                    }));
                } else if (emailUsed) {
                    return promise.reject(new StandardError({
                        msgInfo: 'Email is already in use',
                        msgCode: 'email_not_available'
                    }));
                }

            }
            return {
                emailExist: emailUsed,
                phoneExist: phoneUsed
            };

        }).catch(function (err) {
            return err;
        });
}
function addCardAsync(req) {
    var stripeToken = req.body;
    if (!stripeToken) {
        return promise.reject(new StandardError({
            msgInfo: 'Stripe token not found',
            msgCode: 'stripe_token_not_found'
        }));
    }
    var stripeCustomer = req.stripeCustomer || new Stripe();
    stripeCustomer.customer = req.user;
    stripeCustomer.tokenInfo = stripeToken;
    return stripeHelper
        .addCustomerAsync(stripeToken.id)
        .then(function (responseObject) {
            stripeCustomer.stripeCustomer = responseObject;
            return stripeCustomer.save();
        }).catch(function (err) {
            return promise.reject(new StandardError(err));
        });
}
function getNonCustomVehicleAsync(makeId) {
    return VehicleList
        .find({makeId: makeId})
        .then(function (vehicleList) {
            if (!vehicleList.length) {
                return promise.reject(
                    new StandardError({msgInfo: 'Make Id is invalid'})
                );
            }
            return vehicleList;
        }).catch(function (err) {
            return promise.reject(new StandardError(err));
        });
}
function fetchOrderHistoryAsync(req) {
    var page = req.query.page || 0;
    var size = req.query.pageSize ? Number(req.query.pageSize) : 10;
    var sort = req.query.sortBy || 'orderDate';
    return Order
        .find({'customer': req.user})
        .skip(page * size)
        .limit(size)
        .sort(sort)
        .populate('vehicle')
        .then(function (orderList) {
            if (!orderList.length) {
                return promise.reject(
                    new StandardError({msgInfo: 'No Records Found'})
                );
            }
            return orderList;
        }).then(function (orderList) {
            //reformat Order here
            orderList = formatOrder(orderList);
            return orderList;
        }).catch(function (err) {
            winston.warn('Error', err);
            return promise.reject(new StandardError(err));
        });
}
//this function collects info related to card and vehicle of user
function collectInfoAsync(user) {
    return Stripe
        .findOne({customer: user._id})
        .then(function (stripeCustomer) {
            user.haveCard = !!stripeCustomer;
            return Vehicle
                .findOne({user: user._id});
        }).then(function (vehicle) {
            user.haveVehicle = !!vehicle;

            return user;
        });

}

function updateVehicleAsync(req) {
    var vehicle = req.vehicle;
    vehicle.model = req.body.model || "";
    vehicle.year = req.body.year || "";
    vehicle.number = req.body.year || "";
    vehicle.color = req.body.color || "";
    vehicle.name = req.body.name || "";
    return vehicle.save().then(function (vehicle) {
        return vehicle;
    }).catch(function (err) {
        return promise.reject(new StandardError(err));
    });

}
function deleteVehicleAsync(req) {
    var vehicle = req.vehicle;
    vehicle.isDeleted = true;
    return vehicle
        .save()
        .then(function (vehicle) {
            return vehicle;
        }).catch(function (err) {
            return promise.reject(new StandardError(err));
        });
}
function formatOrder(orderList) {
    var formattedOrderList = [];
    var _order;
    _.forEach(orderList, function (order) {
        _order = {};
        _order._id = order._id;
        if (order.status === 'finished') {
            _order.status = 'DELIVERED';
            _order.carInfo = order.vehicle.model +
                ' ' + order.vehicle.year;
            _order.timeInfo = order.deliveryTime;
            _order.address = order.address;
            _order.fuel =
                (order.orderType === 1 ? "Regular" : "Premium") +
                ", " + order.consumedFuel;
            _order.priceInfo = order.chargedAmount;
            _order.feedbackStars = order.feedBackStars;
        } else if (order.status === 'rejected') {
            _order.status = 'REJECTED';
            _order.carInfo = order.vehicle.model +
                ' ' + order.vehicle.year;
            _order.timeInfo = order.orderDate;
            _order.address = order.address;
        } else {
            _order.status = 'PENDING';
            _order.carInfo = order.vehicle.model + ' ' + order.vehicle.year;
            _order.timeInfo =
                order.startDay === order.endDay ?
                order.startDay + ' at ' + order.startTime +
                ' to ' + order.endTime :
                order.startDay + ' at ' + order.startTime + ' to ' +
                order.endDay + ' at ' + order.endTime;
            _order.address = order.address;
            _order.fuel = (order.orderType === 1 ? "Regular" : "Premium");
        }
        formattedOrderList.push(_order);
    });

    return formattedOrderList;
}
module.exports = {
    signupAsync: signupAsync,
    createVehicleAsync: createVehicle,
    listVehicleAsync: listVehicle,
    verifyPhoneAsync: verifyPhone,
    sendForgetCodeAsnc: sendForgetCode,
    resetPasswordAsync: resetPassword,
    findExistenceAsync: findExistence,
    addCardAsync: addCardAsync,
    getNonCustomVehicleAsync: getNonCustomVehicleAsync,
    fetchOrderHistoryAsync: fetchOrderHistoryAsync,
    collectInfoAsync: collectInfoAsync,
    updateVehicleAsync: updateVehicleAsync,
    deleteVehicleAsync: deleteVehicleAsync
};
