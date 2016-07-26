/**
 * Created by waqas_noor on 20/06/2016.
 */
angular.module('BlurAdmin.pages.configuration').factory('configuration', function ($http) {
    return {
        fetchSlots: function () {
            return $http.get('/admin/config/slot').then(function (responseObject) {
                return responseObject.data;
            });
        }, createSlot: function (slot) {
            return $http.post('/admin/config/slot', slot).then(function (responseObject) {
                return responseObject.data;
            });
        }, updateSlot: function (_id,slot) {
            return $http.post('/admin/config/slot/'+_id, slot).then(function (responseObject) {
                return responseObject.data;
            });
        },
        fetchPricing: function () {
            return $http.get('/admin/config/pricing').then(function (responseObject) {
                return responseObject.data;
            });
        }, createPricing: function (pricing) {
            return $http.post('/admin/config/pricing', pricing).then(function (responseObject) {
                return responseObject.data;
            });
        }, updatePricing: function (_id, pricing) {
            return $http.put('/admin/config/pricing/' + _id, pricing).then(function (responseObject) {
                return responseObject.data;
            });
        }, deletePricing: function (_id) {
            return $http.delete('/admin/config/pricing/' + _id).then(function (responseObject) {
                return responseObject.data;
            });
        }
    }
});