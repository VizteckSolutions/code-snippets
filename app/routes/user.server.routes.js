'use strict';//NOSONAR
var conf = require('../../config/config');
var user = require('../controllers/user.server.controller'),
    passport = require('passport'),
    userMiddleware = require('../middleware/user.server.middleware'),
    fetch = require('../middleware/fetching.server.middleware');
module.exports = function (app) {
    app.route(conf.api + '/user/signup')
        .post(user.signup);

    app.route(conf.api + '/user/login')
        .post(passport.authenticate('localUser', {
            failureRedirect: conf.api + '/user/loginFailure',
            failureFlash: true
        }), user.login);

    app.route(conf.api + '/user/loginFailure')
        .get(user.loginFailure);

    app.route(conf.api + '/user/me')
        .get(userMiddleware.requiresLogin,
            user.me);

    app.route(conf.api + '/user/logout')
        .get(userMiddleware.requiresLogin,
            user.logout);

    app.route(conf.api + '/user/vehicle')
        .get(userMiddleware.requiresLogin,
            userMiddleware.requiresCustomer,
            user.listVehicle)
        .post(userMiddleware.requiresLogin,
            userMiddleware.requiresCustomer,
            user.createVehicle);

    app.route(conf.api + '/user/vehicle/:vehicleId')
        .put(userMiddleware.requiresLogin,
            userMiddleware.requiresCustomer,
            user.updateVehicle)
        .delete(userMiddleware.requiresLogin,
            userMiddleware.requiresCustomer,
            user.deleteVehicle);

    app.route(conf.api + '/user/verifyPhone')
        .post(user.verifyPhone);

    app.route(conf.api + '/user/forgetPassword')
        .post(user.resetPassword);

    app.route(conf.api + '/user/forgetPasswordToken')
        .post(user.sendForgetCode);

    app.route(conf.api + '/user/checkUniqueness')
        .post(user.checkUniquenss);

    app.route(conf.api + '/user/card')
        .post(userMiddleware.requiresLogin,
            userMiddleware.requiresCustomer,
            fetch.fetchUserCard,
            user.addCard);


    app.route(conf.api + '/user/nonCustomVehicles')
        .get(userMiddleware.requiresLogin,
            userMiddleware.requiresCustomer,
            user.getNonCustomVehicle);

    app.route(conf.api + '/user/orderHistory')
        .get(userMiddleware.requiresLogin,
            userMiddleware.requiresCustomer,
            user.fetchOrderHistory);

    app.param('vehicleId',
        fetch.fetchVehicleByParam);
    return app;
};