/**
* CountriesController
* @namespace oipa.countries
*/
(function () {
  'use strict';

  angular
    .module('oipa.implementingOrganisations')
    .controller('ImplementingOrganisationsListController', ImplementingOrganisationsListController);

  ImplementingOrganisationsListController.$inject = ['$scope', 'Aggregations', 'FilterSelection'];

  /**
  * @namespace CountriesExploreController
  */
  function ImplementingOrganisationsListController($scope, Aggregations, FilterSelection) {
    var vm = this;
    vm.filterSelection = FilterSelection;
    vm.organisations = [];
    vm.totalOrganisations = 0;
    vm.order_by = 'name';
    vm.page = 1;
    vm.pageSize = 15;
    vm.busy = false;
    vm.extraSelectionString = '&';
    vm.hasToContain = $scope.hasToContain;

    function activate() {
      // use predefined filters or the filter selection
      $scope.$watch("vm.filterSelection.selectionString", function (selectionString, oldString) {
        if(selectionString !== oldString){
          vm.update(selectionString);
        }
      }, true);

      $scope.$watch("searchValue", function (searchValue, oldSearchValue) {
        if(searchValue == undefined) return;
        if(searchValue !== oldSearchValue){
          searchValue == '' ? vm.extraSelectionString = '' : vm.extraSelectionString = '&name_query='+searchValue;
          vm.update();
        }
      }, true);

      // do not prefetch when the list is hidden
      if($scope.shown != undefined){
        $scope.$watch("shown", function (shown) {
          vm.busy = !shown ? true : false;
        }, true);
      }

      vm.update(vm.filterSelection.selectionString);
    }

    vm.toggleOrder = function(){
      vm.update(vm.filterSelection.selectionString);
    }

    vm.hasContains = function(){
      if(vm.hasToContain !== undefined){
        var totalString = vm.filterSelection.selectionString + vm.extraSelectionString;
        if(totalString.indexOf(vm.hasToContain) < 0){
          return false;
        }
      }
      return true;
    }

    vm.update = function(){
      if (!vm.hasContains()) return false;

      vm.page = 1;
      Aggregations.aggregation('participating_organisation', 'count', vm.filterSelection.selectionString + '&participating_organisation_role=2,4' + vm.extraSelectionString, vm.order_by, vm.pageSize, vm.page).then(succesFn, errorFn);

      function succesFn(data, status, headers, config){
        vm.organisations = data.data.results;
        vm.totalOrganisations = data.data.count;
        $scope.count = vm.totalOrganisations;
      }

      function errorFn(data, status, headers, config){
        console.warn('error getting data for implementing.orgs.block');
      }
    }

    vm.nextPage = function(){
      if (!vm.hasContains() || vm.busy || (vm.totalOrganisations <= (vm.page * vm.pageSize))) return;

      vm.busy = true;
      vm.page += 1;
      Aggregations.aggregation('participating_organisation', 'count', vm.filterSelection.selectionString + '&participating_organisation_role=2,4' + vm.extraSelectionString, vm.order_by, vm.pageSize, vm.page).then(succesFn, errorFn);

      function succesFn(data, status, headers, config){
        vm.organisations = vm.organisations.concat(data.data.results);
        vm.busy = false;
      }

      function errorFn(data, status, headers, config){
        console.warn('error getting data on lazy loading');
      }
    };

    activate();
  }
})();