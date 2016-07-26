angular.module('BlurAdmin.pages.customers').controller('customerController', ['customers', function (customers) {
    var self = this;
    self.loadCustomers = loadCustomers;
    self.customers = [];
    self.pageSize = 25;

    function loadCustomers() {
        customers.getCustomers().then(function (responseObject) {
            self.customers = responseObject.data.customers;
            self.customersData = responseObject.data.customers;
        });
    }


}]);
