module.exports = function (app) {
    //include all route files here
    require('../app/routes/index.server.routes')(app);
    require('../app/routes/admin.server.routes')(app);
    require('../app/routes/user.server.routes')(app);
    require('../app/routes/driver.server.routes')(app);
    require('../app/routes/test.server.routes')(app);
    require('../app/routes/service.server.routes')(app);
    return app;
};