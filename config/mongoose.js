var config = require('./config'),
    winston = require('winston'),
    mongoose = require('mongoose');
module.exports = function () {
    mongoose.set('debug', true);
    var db = mongoose.connect(config.db);

    // Load Model Files Here
    require('../app/models/user.server.model');
    require('../app/models/feedback.server.model');
    require('../app/models/jobs.server.model');
    require('../app/models/notification.server.model');
    require('../app/models/order.server.model');
    require('../app/models/timeslot.server.model');
    require('../app/models/vehicle.server.model');
    require('../app/models/pricing.server.model');
    require('../app/models/strip.server.model');
    return db;
};