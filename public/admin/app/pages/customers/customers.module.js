/**
 * @author v.lugovsky
 * created on 16.12.2015
 */
(function () {
    'use strict';

    angular.module('BlurAdmin.pages.customers', [])
        .config(routeConfig);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('customers', {
                url: '/customers',
                templateUrl: 'app/pages/customers/customers.html',
                controller: 'customerController',
                title: 'Customers',
                sidebarMeta: {
                    icon: 'ion-android-home',
                    order: 1
                }
            });
    }

})();
