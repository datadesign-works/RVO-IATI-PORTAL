/**
* CountriesController
* @namespace oipa.countries
*/
(function () {
  'use strict';

  angular
    .module('oipa.sectors')
    .controller('SectorListController', SectorListController);

  SectorListController.$inject = ['$scope', 'Aggregations', 'FilterSelection', 'sectorMapping'];

  /**
  * @namespace SectorListController
  */
  function SectorListController($scope, Aggregations, FilterSelection, sectorMapping) {
    var vm = this;
    vm.filterSelection = FilterSelection;
    vm.sectors = [];
    vm.totalSectors = 0;
    vm.order_by = 'name';
    vm.page = 1;
    vm.pageSize = 9999;
    vm.hasToContain = $scope.hasToContain;
    vm.busy = false;
    vm.extraSelectionString = '';
    vm.isCollapsed = false;

    function activate() {
      // use predefined filters or the filter selection
      $scope.$watch("vm.filterSelection.selectionString", function (selectionString, oldString) {
        if(selectionString !== oldString){
          vm.update(selectionString);
        }
      }, true);

      $scope.$watch("searchValue", function (searchValue, oldSearchValue) {
        if(searchValue == undefined) return false;
        if(searchValue !== oldSearchValue){
          searchValue == '' ? vm.extraSelectionString = '' : vm.extraSelectionString = '&q_fields=sector&q='+searchValue;
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
      Aggregations.aggregation('sector', 'sector_percentage_weighted_incoming_fund,count', vm.filterSelection.selectionString + vm.extraSelectionString, 'sector').then(succesFn, errorFn);

      function replaceDac5(arr){
        for (var i = 0;i < arr.length;i++){
          if(arr[i].hasOwnProperty('children')){
            replaceDac5(arr[i].children);
          } else {

            var match =_.find(vm.remoteSectors, function(sector) {
              return sector.sector.code == arr[i].sector_id;
            })

            if (match) {
              arr[i] = match;
            } else {
              arr[i].incoming_fund = null;
            }
          }
        }
      }

      function updateTransactions(sector) { 
        if(!sector.hasOwnProperty('children')) {
          return [sector.incoming_fund, sector.count];
        }
        var incoming_fund = 0;
        var count = 0;
        for (var i = 0; i < sector.children.length; i++) {
          var values = updateTransactions(sector.children[i])
          if (values[0]) incoming_fund += values[0];
          if (values[1]) count += values[1];
        }
        sector.incoming_fund = incoming_fund;
        sector.count = count;
        return [incoming_fund, count];
      }

      function sortSectorChildren(sector, i, reverse) {
        // first level
        if (sector.hasOwnProperty('children')) {
          sector.children = _.sortBy(sector.children, vm.order_by_final)
          if (this) sector.children = sector.children.reverse();
          _.each(sector.children, sortSectorChildren, this);
        }
      }

      function applySectorHierarchy(sectors) {

        // replace lowest level DAC5 in sectormapping with sectors
        replaceDac5(sectors.children)
        _.each(sectors.children, updateTransactions)

        if (vm.order_by.charAt(0) === "-") { //reverse
          vm.order_by_final = vm.order_by.substring(1);
          sectors = _.sortBy(_.each(sectors.children, sortSectorChildren, true), vm.order_by_final).reverse();
        } else {
          vm.order_by_final = vm.order_by;
          sectors = _.sortBy(_.each(sectors.children, sortSectorChildren), vm.order_by_final)
        }
        return sectors;
      }

      function succesFn(data, status, headers, config){
          vm.remoteSectors = data.data.results
          vm.sectorMapping = angular.copy(sectorMapping)
          vm.sectors = applySectorHierarchy(vm.sectorMapping)
          vm.totalSectors = data.data.count
          $scope.count = vm.totalSectors
      }

      function errorFn(data, status, headers, config){
        console.warn('error getting data for sector.block');
      }
    }

    vm.toggleHideChildren = function($event) {
      var parent = $($event.target).closest('.parent') 
      var children = parent.next();

      parent.toggleClass('expanded').toggleClass('collapsed')
    }

    vm.toggleOrder = function(){
      vm.update(vm.filterSelection.selectionString);
    }

    activate();
  }
})();