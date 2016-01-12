/**
* FiltersSelectionController
* @namespace oipa.filters.controllers
*/
(function () {
  'use strict';

  angular
    .module('oipa.filters')
    .controller('FiltersSelectionController', FiltersSelectionController);

  FiltersSelectionController.$inject = ['$scope', '$state', 'FilterSelection', 'Programmes', 'Countries', 'Budget', 'Sectors', 'Transaction', 'ImplementingOrganisations', 'ActivityStatus', 'Search'];

  function FiltersSelectionController($scope, $state, FilterSelection, Programmes, Countries, Budget, Sectors, Transaction, ImplementingOrganisations, ActivityStatus, Search) {
    var vm = this;
    vm.selectedCountries = Countries.selectedCountries;
    vm.selectedSectors = Sectors.selectedSectors;
    vm.selectedProgrammes = Programmes.selectedProgrammes;
    vm.selectedImplementingOrganisations = ImplementingOrganisations.selectedImplementingOrganisations;
    vm.selectedActivityStatuses = ActivityStatus.selectedActivityStatuses;
    vm.selectedBudget = Budget.budget;
    vm.selectedTransactionYear = Transaction.year;
    vm.filterSelection = FilterSelection;
    vm.search = Search;
    vm.currentPage = null;
    vm.state = $state;
    vm.filterCount = 0;

    vm.updateFilterCount = function(){
      var count = 0;
      if(vm.currentPage != 'country'){ count += vm.selectedCountries.length; }
      if(vm.currentPage != 'programmes'){ count += vm.selectedProgrammes.length; }
      if(vm.currentPage != 'sector'){ count += vm.selectedSectors.length; }
      if(vm.currentPage != 'organisation'){ count += vm.selectedImplementingOrganisations.length; }
      count += vm.selectedActivityStatuses.length;
      count += vm.search.searchString.length;
      if(vm.selectedBudget.on){ count += 1; }
      if(vm.selectedTransactionYear.on){ count += 1; }
      if(count != vm.filterCount){ vm.filterCount = count; }
    }

    function activate(){
      $scope.$watch('vm.state.current.name', function(name){
        if(name){
          vm.currentPage = name;
        }
      }, true);

      $scope.$watch('vm.filterSelection.selectionString', function(selectionString){
        if(!selectionString.length){
          if(vm.filterCount != 0){
            vm.filterCount = 0;
          }
        } else {
          vm.updateFilterCount();
        }

      }, true);
      console.log(vm.filterSelection);
    }
    activate();

    vm.removeFilter = function(selectedArr, name, item_id) {
      // console.log(selectedArr);
      // console.log('got here');
      // console.log(name);
      // console.log(item_id);

      for (var i = 0; i < selectedArr.length;i++){
        if(name == 'activity_id'){
          if(selectedArr[i]['activity_id'] == item_id){
            selectedArr.splice(i, 1);
            break;
          }
        }
        //mooier maken? lelijk voor org filter 
        else if(typeof selectedArr[i][name] != 'undefined') {
          if(selectedArr[i][name].code == item_id){
            selectedArr.splice(i, 1);
            break;
          }
        }
        else if(selectedArr[i].name == item_id){
          selectedArr.splice(i, 1);
          break;
        }
      }
      FilterSelection.save();
    }

    vm.removeAll = function(selectedArr){
      FilterSelection.removeAll(selectedArr);
    }

    vm.removeBudgetFilter = function(){
      vm.selectedBudget.on = false;
      vm.selectedBudget.value = [0,30000000];
      FilterSelection.save();
      Budget.toReset = true;
    }

    vm.removeTransactionYearFilter = function(){
      vm.selectedTransactionYear.on = false;
      vm.selectedTransactionYear.year = 2015;
      FilterSelection.save();
      Transaction.toReset = true;
    }  


    vm.removeSearch = function(){
      Search.searchString = '';
      FilterSelection.save();
    }

  }
})();