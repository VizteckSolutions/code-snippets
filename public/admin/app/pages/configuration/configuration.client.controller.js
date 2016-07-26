angular.module('BlurAdmin.pages.configuration').controller('configurationController', ['$scope', 'configuration', '$uibModal', function ($scope, configurationService, $uibModal) {
    var self = this;
    var modalInstance;
    self.loadSlots = loadSlots;
    self.createSlotModal = createSlotModal;
    self.loadPricing = loadPricing;
    self.updatePricing = updatePricing;
    self.deletePricing = deletePricing;
    self.createPricingModal = createPricingModal;
    self.confirmDialog = confirmDialog;

    function createPricingModal(page, size, _pricing) {
        var price = _.cloneDeep(_pricing);
        modalInstance = $uibModal.open({
            animation: true,
            templateUrl: page,
            size: size,
            controller: 'pricingModalCtrl',
            controllerAs: 'ctrl',

            resolve: {
                item: function () {
                    return price;
                }
            }

        });
        modalInstance.result.then(function (pricing) {
            if (_pricing) {
                var index = _.findIndex(self.pricing, {_id: pricing._id})
                self.pricing[index].zip = pricing.zip;
                self.pricing[index].premiumPrice = pricing.premiumPrice;
                self.pricing[index].regularPrice = pricing.regularPrice;
            } else {
                self.pricing.push(pricing);
            }
        });
    }


    function confirmDialog(page, size, price) {
        modalInstance = $uibModal.open({
            animation: true,
            templateUrl: page,
            size: size,
            resolve: {
                item: function () {
                    return price;
                }
            },
            controller: 'pricingModalCtrl',
            controllerAs: 'ctrl'

        });
        modalInstance.result.then(function () {
            deletePricing(price);
            //cb(objectToDelete)
        });
    }

    function loadSlots() {
        configurationService.fetchSlots().then(function (responseData) {
            self.slots = responseData.data.slots;
        }).catch(function (err) {
            alert(err);
        });
    }


    function createSlotModal(page, size, _slot) {
        var slotObject = _.cloneDeep(_slot);
        modalInstance = $uibModal.open({
            animation: true,
            templateUrl: page,
            size: size,
            resolve: {
                item: function () {
                    return slotObject;
                }
            },
            controller: 'slotModalCtrl',
            controllerAs: 'ctrl'

        });
        modalInstance.result.then(function (newSlot) {
            if (_slot) {
                var index = _.findIndex(self.slots, {_id: _slot._id});
                self.slots[index].startDay = newSlot.startDay;
                self.slots[index].endDay = newSlot.endDay;
                self.slots[index].startTime = newSlot.startTime;
                self.slots[index].endTime = newSlot.endTime;
                self.slots[index].serviceCharges = newSlot.serviceCharges;
            } else {
                self.slots.push(newSlot);
            }

        });
    }

    function loadPricing() {
        configurationService.fetchPricing().then(function (responseData) {
            self.pricing = responseData.data.pricing;

        }).catch(function (err) {

            alert(err);
        });
    }

    function updatePricing(pricingObject) {
        configurationService.updatePricing(pricingObject).then(function (responseData) {
            //self.pricing = responseData.data.pricing;
        }).catch(function (err) {
            alert(err);
        });
    }

    function deletePricing(pricingObject) {

        configurationService.deletePricing(pricingObject._id).then(function (responseData) {
            if (responseData.status === 'success') {
                _.remove(self.pricing, function (priceObject) {
                    return priceObject._id === pricingObject._id;
                });

            }
        }).catch(function (err) {
            alert(err);
        });
    }

    //
    //function deleteSlot(slotObject) {
    //
    //    configurationService.deletePricing(pricingObject._id).then(function (responseData) {
    //        if (responseData.status === 'success') {
    //            _.remove(self.pricing, function (priceObject) {
    //                return priceObject._id === pricingObject._id;
    //            });
    //
    //        }
    //    }).catch(function (err) {
    //        alert(err);
    //    });
    //}

}]);
angular.module('BlurAdmin.pages.configuration').controller('slotModalCtrl', ['configuration', '$uibModalInstance', 'item', function (configurationService, $uibModalInstance, item) {

    var self = this;
    self.update = item ? true : false;
    self._slot = item ? item : {
        startDay: 'Monday',
        endDay: 'Monday',
        startTime: '10:00',
        endTime: '18:00',
        serviceCharges: 30
    };
    self.error = {};
    self.createSlot = createSlot;
    function createSlot() {
        if (!self.update) {
            return configurationService.createSlot(self._slot).then(function (response) {
                if (response.status === 'success') {
                    $uibModalInstance.close(response.data.slot);
                } else {
                    self.error = {status: 'Error!', msgInfo: response.msgInfo}
                }
            });
        }
        return configurationService.updateSlot(self._slot._id, self._slot).then(function (response) {
            if (response.status === 'success') {
                $uibModalInstance.close(response.data.slot);
            } else {
                self.error = {status: 'Error!', msgInfo: response.msgInfo}
            }
        });

    }
}]);
angular.module('BlurAdmin.pages.configuration').controller('pricingModalCtrl', ['configuration', '$uibModalInstance', 'item', function (configurationService, $uibModalInstance, item) {
    var self = this;
    self.update = item ? true : false;
    self._pricing = item ? item : {};
    self.error = {};
    self.createPricing = createPricing;

    function createPricing() {
        self.error = {};
        if (!self._pricing.regularPrice) {
            return self.error = {status: 'Error!', msgInfo: 'Regular price is missing or invalid.'}
        }
        if (!self._pricing.premiumPrice) {
            return self.error = {status: 'Error!', msgInfo: 'Premium price is missing or invalid.'}
        }
        if (!self._pricing.zip) {
            return self.error = {status: 'Error!', msgInfo: 'Postal code is missing or invalid.'}
        }
        if (!self.update) {
            configurationService.createPricing(self._pricing).then(function (response) {
                if (response.status === 'success') {
                    $uibModalInstance.close(response.data.pricing);
                } else {
                    self.error = {status: 'Error!', msgInfo: response.msgInfo}
                }
            });
        } else {
            configurationService.updatePricing(item._id, self._pricing).then(function (response) {
                if (response.status === 'success') {
                    $uibModalInstance.close(response.data.pricing);
                } else {
                    self.error = {status: 'Error!', msgInfo: response.msgInfo}
                }
            });
        }
    }
}]);