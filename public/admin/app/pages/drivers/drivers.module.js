/**
 * @author v.lugovsky
 * created on 16.12.2015
 */
(function () {
    'use strict';

    angular.module('BlurAdmin.pages.drivers', [])
        .config(routeConfig);

    /** @ngInject */
    function routeConfig($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('drivers', {
                url: '/drivers',
                template: '<ui-view></ui-view>',
                abstract: true,
                title: 'Drivers',
                sidebarMeta: {
                    icon: 'ion-grid',
                    order: 300
                }
            }).state('drivers.new', {
            url: '/new',
            templateUrl: 'app/pages/drivers/newDriver.html',
            title: 'New Driver',
            sidebarMeta: {
                order: 0
            }
        }).
        //    .state('orders.pending', {
        //    url: '/pending',
        //    templateUrl: 'app/pages/orders/pending.html',
        //    title: 'Pending',
        //    sidebarMeta: {
        //        order: 0
        //    }
        //}).
        state('drivers.list', {
            url: '/list',
            templateUrl: 'app/pages/drivers/drivers.html',
            title: 'List',
            sidebarMeta: {
                order: 0
            }
        });
        $urlRouterProvider.when('/drivers', '/drivers/list');
    }

})();
