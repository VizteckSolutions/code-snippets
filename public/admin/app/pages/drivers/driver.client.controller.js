angular.module('BlurAdmin.pages.drivers').controller('driverController', ['$scope', 'driver', '$uibModal', function ($scope, driver, $uibModal) {
    var self = this;
    self.saveDriver = addDriver;
    self.loadDrivers = loadDrivers;
    self.initializeDriver = initializeDriver;
    self.openNotificationModal = openNotificationModal;
    self.errors = {};
    function initializeDriver() {
        self.driver = {};
    }

    function loadDrivers() {
        driver.getDrivers().then(function (responseObject) {
            $scope.drivers = responseObject.data.drivers;
            $scope.driversData = responseObject.data.drivers;
        });
    }

    $scope.pageSize = 25;
    function openNotificationModal(page, size, message, type) {
        $uibModal.open({
            animation: true,
            templateUrl: page,
            controller: 'notificationModalController',
            controllerAs: 'notificationCtrl',
            resolve: {
                message: function () {
                    return message;
                }
            }, size: size


        }).result.then(function () {
            if (type === 'success') {
                console.log('success');

            }
        });
    }

    function addDriver() {

        var _validDriver = validDriver(self.driver);
        if (!_validDriver) {
            return;
        }
        driver.addDriver(self.driver).then(function (responseObject) {
            if (responseObject.status === 'success') {
                openNotificationModal('app/pages/drivers/widgets/infoModal.html', 'md', 'Driver\'s PIN: ' + responseObject.data.pin, 'success');
                initializeDriver();
            } else {
                openNotificationModal('app/pages/drivers/widgets/dangerModal.html', 'md', responseObject.msgInfo);
            }
        });
    }

    function validDriver(driver) {
        var isValid = true;
        if (!driver.fName) {
            self.errors.fName = 'Name is required.';
            isValid = false;
        }
        if (!driver.mobile) {
            self.errors.mobile = 'Mobile is missing or invalid.';
            isValid = false;
        }
        if (!driver.license) {
            self.errors.license = 'License is missing or invalid.';
            isValid = false;
        }
        return isValid;

    }
}]);
angular.module('BlurAdmin.pages.drivers').controller('notificationModalController', ['$uibModalInstance', 'message', function ($uibModalInstance, message) {
    var notificationCtrl = this;
    notificationCtrl.message = message;
}]);