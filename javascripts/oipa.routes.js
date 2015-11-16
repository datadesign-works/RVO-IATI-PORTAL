(function () {
    'use strict';

    angular
      .module('oipa.routes')
      .config(config);

    config.$inject = ['$stateProvider', '$locationProvider', '$urlRouterProvider', 'templateBaseUrl', ];

    /**
    * @name config
    * @desc Define valid application routes
    */
    function config($stateProvider, $locationProvider, $routeProvider, templateBaseUrl){

      $locationProvider.html5Mode(true);
      $routeProvider.otherwise('/');

      $stateProvider
        .state({
            name:         'home',
            url:          '/',
            controller:   'IndexController',
            controllerAs: 'vm',
            templateUrl:  templateBaseUrl + '/templates/_layout/index.html',
            ncyBreadcrumb: {
                label: 'Home'
            }
        })
        .state({
            name:         'activities',
            url:          '/projects/',
            controller:   'ActivitiesExploreController',
            controllerAs: 'vm',
            templateUrl:  templateBaseUrl + '/templates/activities/activities-view-list-map.html',
            ncyBreadcrumb: {
                label: 'IATI Explorer'
            }
        })
        .state({
            name:         'activities-list',
            url:          '/projects/lijst/',
            controller:   'ActivitiesExploreController',
            controllerAs: 'vm',
            templateUrl:  templateBaseUrl + '/templates/activities/activities-view-list.html',
            ncyBreadcrumb: {
                label: 'IATI Explorer'
            }
        })
        .state({
            name:        'activiteit',
            url:         '/projects/:activity_id/',
            controller:  'ActivityController',
            controllerAs: 'vm',
            templateUrl: templateBaseUrl + '/templates/activities/activity-view-detail.html',
            ncyBreadcrumb: {
                label: 'IATI Activiteit detail pagina'
            }
        })
        .state({
            name:        'locations-map',
            url:         '/locations/list/',
            controller:  'LocationsMapListController',
            controllerAs: 'vm',
            templateUrl: templateBaseUrl + '/templates/locations/locations-view-map-list.html',
            ncyBreadcrumb: {
                label: 'Locaties'
            }
        })
        .state({
            name:        'locations-polygonmap',
            url:         '/locations/map/',
            controller:  'LocationsPolygonGeoMapController',
            controllerAs: 'vm',
            templateUrl: templateBaseUrl + '/templates/locations/locations-view-map-polygons.html',
            ncyBreadcrumb: {
                label: 'Locaties'
            }
        })
        .state({
            name:        'country',
            url:         '/countries/:country_id/',
            controller:  'CountryController',
            controllerAs: 'vm',
            templateUrl: templateBaseUrl + '/templates/countries/country-view-detail.html',
            ncyBreadcrumb: {
                parent: 'countries',
                label: '{{vm.country.name}}'
            }
        })
        .state({
            name:        'region',
            url:         '/regions/:region_id/',
            controller:  'RegionController',
            controllerAs: 'vm',
            templateUrl: templateBaseUrl + '/templates/regions/region-view-detail.html',
            ncyBreadcrumb: {
                parent: 'regio\'s',
                label: '{{vm.region.name}}'
            }
        })
        .state({
            name:        'regions-list',
            url:         '/regions/list/',
            controller:  'RegionListController',
            controllerAs: 'vm',
            templateUrl: templateBaseUrl + '/templates/regions/region-view-list.html',
            ncyBreadcrumb: {
                label: 'Regio\'s'
            }
        })
        .state({
            name:        'regions-vis',
            url:         '/regions/',
            controller:  'RegionsVisualisationController',
            controllerAs: 'vm',
            templateUrl: templateBaseUrl + '/templates/regions/region-view-visualisation.html',
            ncyBreadcrumb: {
                label: 'Regio\'s'
            }
        })
        .state({
            name:        'organisations',
            url:         '/organisations/',
            controller:  'ImplementingOrganisationsExploreController',
            controllerAs: 'vm',
            templateUrl: templateBaseUrl + '/templates/implementingOrganisations/implementing-organisations-view-list.html'
        })
        // .state({
        //     name:        'organisations',
        //     url:         '/organisaties/',
        //     controller:  'ImplementingOrganisationsVisualisationController',
        //     controllerAs: 'vm',
        //     templateUrl: templateBaseUrl + '/templates/implementingOrganisations/implementing-organisations-view-visualisation.html'
        // })
        .state({
            name:        'organisation',
            url:         '/organisations/:organisation_id/',
            controller:  'ImplementingOrganisationController',
            controllerAs: 'vm',
            templateUrl: templateBaseUrl + '/templates/implementingOrganisations/implementing-organisation-view-detail.html'
        })
        .state({
            name:        'sector-list',
            url:         '/sectors/lijst/',
            controller:  'SectorsExploreController',
            controllerAs: 'vm',
            templateUrl: templateBaseUrl + '/templates/sectors/sectors-view-list.html'
        })
        .state({
            name:        'sectors',
            url:         '/sectors/',
            controller:  'SectorsVisualisationController',
            controllerAs: 'vm',
            templateUrl: templateBaseUrl + '/templates/sectors/sectors-view-visualisation.html'
        })
        .state({
            name:        'sector',
            url:         '/sectors/:sector_id/',
            controller:  'SectorController',
            controllerAs: 'vm',
            templateUrl: templateBaseUrl + '/templates/sectors/sector-view-detail.html'
        })
        
        .state({
            name:        'about',
            url:         '/about/',
            controller:  'PagesController',
            controllerAs: 'vm',
            templateUrl: templateBaseUrl + '/templates/pages/pages.html',
            ncyBreadcrumb: {
                label: '{{vm.title}}'
            }
        })
        .state({
            name:        'iati-publiceren',
            url:         '/iati-publiceren/',
            controller:  'PagesController',
            controllerAs: 'vm.post.title',
            templateUrl: templateBaseUrl + '/templates/pages/pages.html'
        })
        .state({
            name:        'search',
            url:         '/zoeken/?search&tab',
            controller:  'SearchPageController',
            controllerAs: 'vm',
            templateUrl: templateBaseUrl + '/templates/search/search-page.html'
        });

     
    }
})();
