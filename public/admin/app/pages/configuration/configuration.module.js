/**
 * @author v.lugovsky
 * created on 16.12.2015
 */
(function () {
    'use strict';

    angular.module('BlurAdmin.pages.configuration', [])
        .config(routeConfig);

    /** @ngInject */
    function routeConfig($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('configuration', {
                url: '/configuration',
                template: '<ui-view></ui-view>',
                abstract: true,
                title: 'Configuration',
                sidebarMeta: {
                    icon: 'ion-grid',
                    order: 300
                }
            }).state('configuration.slot', {
            url: '/slots',
            templateUrl: 'app/pages/configuration/slots/slots.html',
            title: 'Time Slots',
            sidebarMeta: {
                order: 0
            }
        }).state('configuration.pricing', {
            url: '/pricing',
            templateUrl: 'app/pages/configuration/pricing/pricing.html',
            title: 'Pricing',
            sidebarMeta: {
                order: 0
            }
        });
        $urlRouterProvider.when('/configuration', '/configuration/slots');
    }


})();
