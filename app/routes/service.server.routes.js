'use strict';//NOSONAR
var fetching = require('../middleware/fetching.server.middleware'),
    user = require('../middleware/user.server.middleware'),
    services = require('../controllers/services.server.controller'),
    conf = require('../../config/config');
module.exports = function (app) {
    //app.route(conf.api + '/services/available')
    // .get(services.checkServiceAvailability);

    //split into fetch vehicle and fetch slot info
    app.route(conf.api + '/services/gas')
        .post(user.requiresLogin,
            user.requiresCustomer,
            user.validCordinates,
            user.validOrder,
            user.referredOrder,
            fetching.fetchSlotById,
            fetching.fetchVehicleById,
            services.gasRequest
        );
    app.route(conf.api + '/services/schedule')
        .get(user.requiresLogin,
            user.requiresCustomer,
            services.getSchedule
        );
    app.route(conf.api + '/services/pricing')
        .post(user.requiresLogin,
            user.requiresCustomer,
            services.getPricing);
    return app;
};