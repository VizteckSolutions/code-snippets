angular.module('BlurAdmin.pages.drivers').factory('driver', function ($http) {
    return {
        getDrivers: function () {
            return $http.get('/admin/drivers').then(function (responseObject) {
                return responseObject.data;
            });
        },
        addDriver: function (driver) {
            return $http.post('/admin/drivers', driver).then(function (responseObject) {
                return responseObject.data;
            });
        }, assignJob: function (driverId, orderId) {
            return $http.post('/admin/drivers/' + driverId + '/' + orderId).then(function (responseObject) {
                return responseObject.data;
            });
        }
    }
});