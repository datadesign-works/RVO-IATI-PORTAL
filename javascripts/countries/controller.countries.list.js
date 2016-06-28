/**
* CountriesController
* @namespace oipa.countries
*/
(function () {
  'use strict';

  angular
    .module('oipa.countries')
    .controller('CountriesListController', CountriesListController);

  CountriesListController.$inject = ['$scope', 'TransactionAggregations', 'FilterSelection', 'homeUrl', 'templateBaseUrl'];

  /**
  * @namespace CountriesExploreController
  */
  function CountriesListController($scope, TransactionAggregations, FilterSelection, homeUrl, templateBaseUrl) {
    var vm = this;
    vm.filterSelection = FilterSelection;
    vm.countries = [];
    vm.totalCountries = 0;
    vm.order_by = 'recipient_country';
    vm.hasToContain = $scope.hasToContain;
    vm.page = 1;
    vm.busy = false;
    vm.perPage = 15;
    vm.extraSelectionString = '';
    vm.templateBaseUrl = templateBaseUrl;

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
          searchValue == '' ? vm.extraSelectionString = '' : vm.extraSelectionString = '&q_field=recipient_country&q='+searchValue;
          vm.update();
        }
      }, true);

      // do not prefetch when the list is hidden
      if($scope.shown != undefined){
        $scope.$watch("shown", function (shown) {
          vm.busy = !$scope.shown;
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
      vm.busy = true;
      TransactionAggregations.aggregation('recipient_country', 'activity_count,incoming_fund', vm.filterSelection.selectionString + vm.extraSelectionString, vm.order_by, vm.perPage, vm.page).then(succesFn, errorFn);

      function succesFn(data, status, headers, config){
        vm.countries = data.data.results;
        vm.totalCountries = data.data.count;
        $scope.count = vm.totalCountries;
        vm.busy = ($scope.shown != undefined) ? !$scope.shown : false; 
      }

      function errorFn(data, status, headers, config){
        console.warn('error getting data for country.block');
      }
    }

    vm.nextPage = function(){
      if (!vm.hasContains() || vm.busy || (vm.totalCountries <= (vm.page * vm.perPage))) return;

      vm.busy = true;
      vm.page += 1;
      TransactionAggregations.aggregation('recipient_country', 'activity_count,incoming_fund', vm.filterSelection.selectionString + vm.extraSelectionString, vm.order_by, vm.perPage, vm.page).then(succesFn, errorFn);

      function succesFn(data, status, headers, config){
        vm.countries = vm.countries.concat(data.data.results);
        vm.busy = false;
      }

      function errorFn(data, status, headers, config){
        console.warn('error getting data on lazy loading');
      }
    };

    vm.download = function(format){
      var aggregation_url = TransactionAggregations.prepare_url('recipient_country', 'activity_count,incoming_fund', vm.filterSelection.selectionString + vm.extraSelectionString, vm.order_by);
      var url = homeUrl + '/export/?type=aggregated-list&format='+format+'&aggregation_group=recipient_country&aggregation_url=' + encodeURIComponent(aggregation_url);
      window.open(url);
    }

    activate();
  }
})();