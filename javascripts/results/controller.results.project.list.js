(function () {
  'use strict';

  angular
    .module('oipa.results')
    .controller('ResultsProjectListController', ResultsProjectListController);

  ResultsProjectListController.$inject = ['$scope', 'Activities', 'FilterSelection', 'homeUrl'];

  function ResultsProjectListController($scope, Activities, FilterSelection, homeUrl) {
    var vm = this;
    vm.filterSelection = FilterSelection;
    vm.activities = [];
    vm.order_by = 'title';
    vm.pageSize = 15;
    vm.page = 1;
    vm.totalActivities = 0;
    vm.hasToContain = $scope.hasToContain;
    vm.busy = false;
    vm.extraSelectionString = '';

    function activate() {
      $scope.$watch("vm.filterSelection.selectionString", function (selectionString) {
        vm.update(selectionString);
      }, true);

      $scope.$watch("searchValue", function (searchValue) {
        if (searchValue == undefined) return false; 
        searchValue == '' ? vm.extraSelectionString = '' : vm.extraSelectionString = '&q='+searchValue;
        vm.update();
      }, true);

      // do not prefetch when the list is hidden
      if($scope.shown != undefined){
        $scope.$watch("shown", function (shown) {
            vm.busy = !shown ? true : false;
        }, true);
      }
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

      Activities.resultList(vm.filterSelection.selectionString + vm.extraSelectionString + '&hierarchy=2', vm.pageSize, vm.order_by, vm.page).then(succesFn, errorFn);

      function succesFn(data, status, headers, config){
        vm.activities = data.data.results;
        vm.totalActivities = data.data.count;
        $scope.count = vm.totalActivities;        
      }

      function errorFn(data, status, headers, config){
        console.warn('error getting data for activity.list.block');
      }
    }

    vm.nextPage = function(){
      if (!vm.hasContains() || vm.busy || (vm.totalActivities <= (vm.page * vm.pageSize))) return;

      vm.busy = true;
      vm.page += 1;
      Activities.resultList(vm.filterSelection.selectionString + vm.extraSelectionString + '&hierarchy=2', vm.pageSize, vm.order_by, vm.page).then(succesFn, errorFn);

      function succesFn(data, status, headers, config){
        vm.activities = vm.activities.concat(data.data.results);
        vm.busy = false;   
      }

      function errorFn(data, status, headers, config){
        console.warn('error getting data on lazy loading');
      }
    };

    vm.download = function(format){
      var url = homeUrl + '/export/?type=activity-list&format='+format+'&filters=' + encodeURIComponent(vm.filterSelection.selectionString);
      window.open(url);
    }

    activate();
  }
})();