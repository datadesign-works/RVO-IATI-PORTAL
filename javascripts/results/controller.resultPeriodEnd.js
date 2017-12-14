(function () {
  'use strict';

  angular
    .module('oipa.filters')
    .controller('ResultPeriodEndController', ResultPeriodEndController);

  ResultPeriodEndController.$inject = ['$scope', 'FilterSelection', 'Results'];

  function ResultPeriodEndController($scope, FilterSelection, Results) {

    var vm = this;
    vm.on = false;
    vm.defaultYear = 2016;
    vm.resultPeriodEndYear = 2016;
    vm.results = Results;

    vm.yearOptions = function(){
      var curYear = (new Date()).getFullYear();
      var curMonth = (new Date().getMonth());
      if (curMonth < 11) {
        curYear--;
      };
      var years = [];
      for (var i = curYear; i > 2014;i--){
        years.push(i.toString());
      };
      return years;
    }();

    activate();

    /**
    * @name activate
    * @desc Actions to be performed when this controller is instantiated
    * @memberOf oipa.budget.controllers.BudgetController
    */
    function activate() {

      $scope.$watch("vm.resultPeriodEndYear", function (year) {
        Results.year.value = year;
      }, true);

      $scope.$watch("vm.on", function (yearOn) {
        Results.year.on = yearOn;
        if (yearOn) {
          Results.year.value = vm.resultPeriodEndYear;
        } else {
          Results.year.value = vm.defaultYear;
        };
      }, true);

      $scope.$watch("vm.results.toReset", function (toReset) {       
        if(toReset == true){
          vm.resultPeriodEndYear = 2016;
          vm.on = false;
        }
      }, true);
    }

    vm.save = function(){
      FilterSelection.save();
    }

  }
})();