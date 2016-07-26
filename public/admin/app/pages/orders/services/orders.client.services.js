/**
 * Created by waqas_noor on 23/06/2016.
 */
angular.module('BlurAdmin.pages.orders').factory('orders', function ($http) {
    return {
        fetchOrders: function (orderTypes) {
            return $http.get('/admin/orders/fetch?number=' + orderTypes.number +
                    '&start=' + orderTypes.start + '&all=' + orderTypes.all +
                    '&new=' + orderTypes.newOrders + '&unassigned=' + orderTypes.unassigned +
                    '&rejected=' + orderTypes.rejected + '&inprogress=' + orderTypes.inprogress +
                    '&finished=' + orderTypes.finished + '&assigned=' + orderTypes.assigned)
                .then(function (responseObject) {
                    return responseObject.data;
                });
        }, orderAction: function (action, _id) {
            return $http.get('/admin/orders/action/' + action + '/' + _id).then(function (responseObject) {
                return responseObject.data;
            });
        }
    }
});