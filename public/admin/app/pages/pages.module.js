/**
 * @author v.lugovsky
 * created on 16.12.2015
 */
(function () {
    'use strict';

    angular.module('BlurAdmin.pages', [
            'ui.router',
            'BlurAdmin.pages.orders',
            'BlurAdmin.pages.customers',
            'BlurAdmin.pages.drivers',
            'BlurAdmin.pages.configuration',
            'BlurAdmin.pages.dashboard'
        ])
        .config(routeConfig);

    /** @ngInject */
    function routeConfig($urlRouterProvider, baSidebarServiceProvider) {
        $urlRouterProvider.otherwise('/orders');

    }

})();