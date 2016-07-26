/**
 * @author v.lugovsky
 * created on 16.12.2015
 */
(function () {
    'use strict';

    angular.module('BlurAdmin.pages.orders', [])
        .config(routeConfig);

    /** @ngInject */
    function routeConfig($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('orders', {
                url: '/orders',
                template: '<ui-view></ui-view>',
                abstract: true,
                title: 'Orders',
                sidebarMeta: {
                    icon: 'ion-grid',
                    order: 300
                }
            }).state('orders.new', {
            url: '/new',
            templateUrl: 'app/pages/orders/newOrders.html',
            title: 'New',
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
        state('orders.history', {
            url: '/history',
            templateUrl: 'app/pages/orders/history.html',
            title: 'History',
            sidebarMeta: {
                order: 0
            }
        });
        $urlRouterProvider.when('/orders', '/orders/new');
    }

})();
