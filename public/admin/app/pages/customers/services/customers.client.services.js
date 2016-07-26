angular.module('BlurAdmin.pages.customers').factory('customers', function ($http) {
    return {
        getCustomers: function () {
            return $http.get('/admin/customers').then(function (responseObject) {
                return responseObject.data;
            });
        }
    }
});