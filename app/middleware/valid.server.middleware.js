'use strict'; //NOSONAR

function validDriver(req, res, next) {
    var driver = req.body;
    if (!driver.fName) {
        return sendErrorResponse(res, 'Name is required');
    }
    if (!driver.mobile) {
        return sendErrorResponse(res, 'Mobile is required');
    }
    if (!driver.license) {
        return sendErrorResponse(res, 'License is required');
    }
    if (!driver.email) {
        return sendErrorResponse(res, 'Email is required');
    }
    driver.fullName = driver.fName + ' ' + driver.lName;
    driver.phone = driver.mobile;
    req.driver = driver;
    next();

}
function sendErrorResponse(res, message) {
    res.send({
        status: 'error',
        msgInfo: message
    });
}
module.exports = {
    validDriver: validDriver
};
