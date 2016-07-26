/**
 * Created by waqas_noor on 23/06/2016.
 */
angular.module('BlurAdmin.pages.configuration').controller('ordersController', ['$scope', 'orders', '$uibModal', function ($scope, ordersService, $uibModal) {
    var self = this;
    self.fetchOrders = fetchOrders;
    self.applyFilters = applyFilters;
    self.orderAcceptAction = orderAcceptAction;
    self.orderRejectAction = orderRejectAction;
    $scope.smartTableState = {};
    self.orderTypes = {};
    self.orderTypes = {
        all: true,
        inprogress: false,
        finished: false,
        newOrders: false,
        assigned: false,
        unassigned: false,
        rejected: false
    };
    function applyFilters() {
        $scope.smartTableState.pagination.start = 0;
        fetchOrders($scope.smartTableState);
    }

    function resetFilters() {
        $scope.smartTableState.pagination.start = 0;
        fetchOrders($scope.smartTableState);
    }

    function fetchOrders(tableState) {
        $scope.smartTableState = tableState;
        self.isLoading = true;
        self.noResults = false;
        var pagination = tableState.pagination;
        self.orderTypes.start = pagination.start || 0;
        self.orderTypes.number = pagination.number || 10;
        ordersService.fetchOrders(self.orderTypes)
            .then(function (response) {
                if (response.status === 'success') {
                    self.orders = response.data.orders;
                    self.isLoading = false;
                    tableState.pagination.numberOfPages = response.data.numOfPages;

                } else {
                    self.isLoading = false;
                    self.noResults = true;
                    tableState.pagination.numberOfPages = 0;
                    self.error = response.data;
                }
            });
    }


    function orderAcceptAction(order) {

        openModal('/admin/app/pages/orders/widgets/acceptModal.html', 'md', order);
    }

    function orderRejectAction(order) {
        //model Code Here
        ordersService.orderAction('reject', order._id).then(function (responseObject) {
            if (responseObject.status === 'success') {

                var index = _.findIndex(self.orders, {_id: order._id});
                self.orders[index].status = 'rejected';

            } else {
                alert(responseObject);
            }

        }).catch(function (err) {
            alert(err);
        });
    }

    function openModal(page, size, order) {
        console.log('opening modal');
        $uibModal.open({
            animation: true,
            templateUrl: page,
            size: size,
            resolve: {
                data: function () {
                    return order;
                }
            },
            controller: 'driverModalController',
            controllerAs: 'ctrl'

        }).result.then(function (modalResponse) {
            if (modalResponse === 'assigned' || modalResponse === 'unassigned') {
                var index = _.findIndex(self.orders, {_id: order._id});
                self.orders[index].status = modalResponse;
            } else {

            }
        });
    }

    self.pageSize = 25

}]);
angular.module('BlurAdmin.pages.configuration')
    .controller('driverModalController',
        ['driver', '$uibModalInstance', 'data', 'orders',
            function (driverService, $uibModalInstance, data, orderService) {
                var self = this;
                self.loadDrivers = loadDrivers;
                self.assignJob = assignJob;
                self.acceptJob = acceptJob;
                self.order = data;

                function loadDrivers() {
                    driverService.getDrivers().then(function (driverResponse) {
                        self.drivers = driverResponse.data.drivers;
                        self.driver = self.drivers[0];
                    });
                }

                loadDrivers();

                function assignJob() {
                    driverService.assignJob(self.driver._id, self.order._id).then(function (response) {
                        if (response.status === 'success') {
                            $uibModalInstance.close('assigned');
                        } else {
                            console.log(response);
                        }
                    });

                }

                function acceptJob() {
                    orderService.orderAction('accept', self.order._id).then(function (response) {
                        if (response.status === 'success') {
                            $uibModalInstance.close('unassigned');
                        } else {
                            console.log(response)
                        }
                    });

                }


            }]);
//angular.module('BlurAdmin.pages.configuration').controller('slotModalCtrl', ['$scope', 'slots', '$uibModalInstance', function ($scope, slotService, $uibModalInstance) {
//    var self = this;
//    self._slot = {
//        startDay: 'Monday',
//        endDay: 'Monday',
//        startTime: '10:00',
//        endTime: '18:00',
//        serviceCharges: '1'
//    };
//    self.error = {};
//
//    self.createSlot = function () {
//        slotService.createSlot(self._slot).then(function (response) {
//            if (response.status === 'success') {
//                $uibModalInstance.close(response.data.slot);
//            } else {
//                console.log(response);
//                self.error = {status: 'Error!', msgInfo: response.msgInfo}
//            }
//        });
//
//
//    }
//}]);