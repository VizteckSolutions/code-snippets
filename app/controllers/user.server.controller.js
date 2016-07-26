'use strict';//NOSONAR
var userHelper = require('../helpers/user.server.helper.js'),
    StandardError = require('standard-error'),
    errorHelper = require('../helpers/error.server.helper.js'),
    md5 = require('md5');


//user signup function
function signup(req, res) {
    userHelper
        .signupAsync(req, res)
        .then(function (responseObject) {
            var user = responseObject.user.toObject();
            var availability = responseObject.availability;
            user.verificationCode = md5(user.verificationCode);
            delete user.password;
            delete user.salt;
            return res.send({
                status: 'success',
                message: "User Signup",
                msgCode: 'user_create_success',
                msgInfo: 'User Created Successfully',
                data: {
                    user: user,
                    availability: availability
                }
            });

        }).catch(StandardError, function (err) {
        return res.status(200).send({
            status: 'error',
            message: "User Signup",
            msgCode: 'user_create_failed',
            msgInfo: err.msgInfo || 'unknown error in server',
            errors: err
        });
    }).catch(function (err) {
        return res.status(200).send({
            status: 'error',
            message: "User Signup",
            msgCode: 'user_create_failed',
            msgInfo: errorHelper.getError(err) || 'Unknown Error at server',
            //errors: errorHelper.getError(err)
        });
    });
}

function login(req, res) {
    var user = req.user.toObject();
    delete user.salt;
    delete user.password;
    delete user.created;
    return userHelper
        .collectInfoAsync(user)
        .then(function (user) {
            return res.send({
                status: 'success',
                message: 'User Login',
                msgInfo: 'User Login Success',
                msgCode: 'user_login_success',
                data: {user: user}
            });
        });
}
function loginFailure(req, res) {
    var message = req.flash('error');
    res.status(200).send({
        status: 'error',
        message: 'User Login',
        msgInfo: message[0],
        msgCode: 'user_login_failed'
    });
}
function me(req, res) {
    var user = req.user.toObject();
    delete user.salt;
    delete user.password;
    delete user.created;
    return res.send({
        status: 'success',
        message: 'user info',
        msgInfo: 'user is logged in',
        msgCode: 'user_fetch_success',
        data: {user: user}
    });
}
function logout(req, res) {
    req.logout();
    return res.status(200).send({
        status: 'success',
        message: 'user logout',
        msgInfo: 'user logout success',
        msgCode: 'user_logout_success'
    });
}
function createVehicle(req, res) {
//this services adds vehicle for user
    userHelper.createVehicleAsync(req, res)
        .then(function (vehicleObject) {
            var vehicle = vehicleObject.toObject();
            delete vehicle.user;
            res.status(200).send({
                status: 'success',
                message: "Create Vehicle",
                msgCode: 'vehicle_create_success',
                msgInfo: 'Vehicle created successfully',
                data: {vehicle: vehicle}
            });
        }).catch(StandardError, function (err) {
        return res.send({
            status: 'error',
            message: "Create Vehicle",
            msgCode: 'vehicle_create_failed',
            errors: err
        });
    }).catch(function (err) {
        res.status(200).send({
            status: 'error',
            message: "New Vehicle",
            msgCode: 'vehicle_create_failed',
            errors: errorHelper.getError(err)
        });
    });
}
function listVehicle(req, res) {
    //fetches list of vehicles
    userHelper
        .listVehicleAsync(req, res)
        .then(function (vehicles) {
            var _vehicles = vehicles;
            res.status(200).send({
                status: 'success',
                message: "Vehicle List",
                msgCode: 'vehicles_fetching_success',
                msgInfo: 'Vehicles fetched successfully',
                data: {vehicles: _vehicles}
            });
        }).catch(StandardError, function (err) {
        return res.status(200).send({
            status: 'error',
            message: "Vehicle List",
            msgInfo: err.msgInfo ||
            errorHelper.getError(err) ||
            err.message ||
            'something went wrong on server.',
            errors: err
        });
    }).catch(function (err) {
        res.status(200).send({
            status: 'error',
            message: "Vehicle List",
            msgInfo: err.msgInfo ||
            errorHelper.getError(err) ||
            err.message ||
            'something went wrong on server.',
            errors: errorHelper.getError(err)
        });
    });
}
function verifyPhone(req, res) {
    userHelper
        .verifyPhoneAsync(req, res)
        .then(function (responseObject) {
            return res.status(200).send({
                status: 'success',
                message: "Verify Phone",
                msgCode: 'verification_code_sent',
                msgInfo: 'Verification Code Sent',
                data: responseObject
            });
        }).catch(StandardError, function (err) {
        return res.send({
            status: 'error',
            message: "Verify Phone",
            msgCode: err.msgCode,
            msgInfo: err.msgInfo,
            orignalError: err.orignalError
        });
    }).catch(function (err) {
        res.send({
            status: 'error',
            message: "Verify Phone",
            msgCode: 'verify_phone_error',
            errors: errorHelper.getError(err)
        });
    });
}
function sendForgetCode(req, res) {
    userHelper
        .sendForgetCodeAsnc(req, res)
        .then(function (md5Code) {
            return res.status(200).send({
                status: 'success',
                message: "Forget Password",
                msgCode: 'verification_code_sent',
                msgInfo: 'Verification Code Sent',
                token: md5Code
            });
        }).catch(StandardError, function (err) {
        return res.status(200).send({
            status: 'error',
            message: "Forget Password",
            msgCode: err.msgCode,
            msgInfo: err.msgInfo,
            orignalError: err.orignalError
        });
    }).catch(function (err) {
        return res.status(200).send({
            status: 'error',
            message: "Forget Password",
            msgCode: err.msgCode,
            msgInfo: err.msgInfo,
            orignalError: err
        });
    });
}
function resetPassword(req, res) {
    userHelper
        .resetPasswordAsync(req, res)
        .then(function () {
            return res.status(200).send({
                status: 'success',
                message: "Reset Password",
                msgCode: 'password_reset_success',
                msgInfo: 'Password changed successfully.'
            });
        }).catch(StandardError, function (err) {
        return res.status(200).send({
            status: 'error',
            message: "Reset Password",
            msgCode: err.msgCode,
            msgInfo: err.msgInfo,
            orignalError: err.orignalError
        });
    }).catch(function (err) {
        return res.status(200).send({
            status: 'error',
            message: "Reset Password",
            msgCode: err.msgCode,
            msgInfo: err.msgInfo,
            //errors: errorHelper.getError(err),
            orignalError: err
        });
    });
}
function checkUniquenss(req, res) {
    userHelper
        .findExistenceAsync(req, res)
        .then(function () {
            return res.send({
                status: 'success',
                msgCode: 'data_is_available',
                msgInfo: 'Phone and Email are available'

            });
        }).catch(StandardError, function (err) {
        return res.status(200).send({
            status: 'error', msg: err.msgInfo,
            msgCode: err.msgCode,
            message: 'Error Checking Unique phone and Email'
        });

    }).catch(function (err) {
        return res.status(200).send({
            status: 'error',
            msgInfo: err.msg ||
            err.msgInfo ||
            errorHelper.getError(err),
            msgCode: "checking_phone&email_failed",
            message: 'Error Checking Unique phone and Email'
        });
    });

}
function addCard(req, res) {
    userHelper
        .addCardAsync(req, res)
        .then(function () {
            return res.send({
                status: 'success',
                msgInfo: 'Card added successfully.'
            });
        }).catch(StandardError, function (err) {
        return res.send({
            status: 'error',
            msgInfo: err.msgInfo ||
            err.message ||
            'something went wrong'
        });
    }).catch(function (err) {
        return res.send({
            status: 'error',
            msgInfo: err.msg ||
            err.msgInfo ||
            err.message ||
            errorHelper.getError(err)
        });
    });
}
function getNonCustomVehicle(req, res) {
    userHelper
        .getNonCustomVehicleAsync(req.query.makeId)
        .then(function (vehicleList) {
            return res.send(
                {
                    status: 'success',
                    msgInfo: 'List fetched successfully',
                    data: {
                        list: vehicleList
                    }
                });
        }).catch(StandardError, function (err) {
        return res.status(200).send({
            status: 'error',
            msgInfo: err.msgInfo ||
            err.message ||
            'something went wrong'
        });
    }).catch(function (err) {
        return res.send({
            status: 'error',
            msgInfo: err.msg ||
            err.msgInfo ||
            err.message ||
            errorHelper.getError(err)
        });
    });
}
function fetchOrderHistory(req, res) {
    userHelper
        .fetchOrderHistoryAsync(req)
        .then(function (orderHistory) {
            return res.send(
                {
                    status: 'success',
                    msgInfo: 'List fetched successfully',
                    data: {
                        history: orderHistory
                    }
                });
        }).catch(StandardError, function (err) {
        return res.send({
            status: 'error',
            msgInfo: err.msgInfo || err.message || 'something went wrong'
        });
    }).catch(function (err) {
        return res.status(200).send({
            status: 'error',
            msgInfo: err.msg ||
            err.msgInfo ||
            err.message ||
            errorHelper.getError(err)
        });
    });
}

function updateVehicle(req, res) {
    userHelper
        .updateVehicleAsync(req)
        .then(function () {
            res.send({
                status: 'success',
                msgInfo: 'Vehicle updated sucessfully.'
            });
        }).catch(function (err) {
        return res.send({
            status: 'error',
            msgInfo: err.msgInfo ||
            errorHelper.getError(err) ||
            err.message ||
            'something went wrong on server'
        });
    });
}
function deleteVehicle(req, res) {
    userHelper
        .deleteVehicleAsync(req)
        .then(function () {
            res.send({
                status: 'success',
                msgInfo: 'Vehicle deleted successfully.'
            });
        }).catch(function (err) {
        return res.send({
            status: 'error',
            msgInfo: err.msgInfo ||
            errorHelper.getError(err) ||
            err.message ||
            'something went wrong on server'
        });
    });
}
module.exports = {
    signup: signup,
    login: login,
    loginFailure: loginFailure,
    me: me,
    logout: logout,
    createVehicle: createVehicle,
    listVehicle: listVehicle,
    verifyPhone: verifyPhone,
    sendForgetCode: sendForgetCode,
    resetPassword: resetPassword,
    checkUniquenss: checkUniquenss,
    addCard: addCard,
    getNonCustomVehicle: getNonCustomVehicle,
    fetchOrderHistory: fetchOrderHistory,
    updateVehicle: updateVehicle,
    deleteVehicle: deleteVehicle
};