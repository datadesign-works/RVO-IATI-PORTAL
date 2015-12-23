(function () {
  'use strict';

  angular
    .module('oipa.budget')
    .controller('BudgetController', BudgetController);

  BudgetController.$inject = ['$scope', 'Budget', 'FilterSelection', '$filter'];

  function BudgetController($scope, Budget, FilterSelection, $filter) {
    var vm = this;
    vm.on = false;
    vm.budgetValue = [0,30000000];
    vm.budget = Budget;

    activate();

    function activate() {

      $scope.$watch("vm.budgetValue", function (budgetValue) {
        Budget.budget.value = budgetValue;

        angular.element('.tooltip-min .currency').html( $filter('shortcurrency')(vm.budgetValue[0],'€') );
        angular.element('.tooltip-max .currency').html( $filter('shortcurrency')(vm.budgetValue[1],'€') );

      }, true);

      $scope.$watch("vm.on", function (budgetOn) {
        Budget.budget.on = budgetOn;
      }, true);

      $scope.$watch("vm.budget.toReset", function (toReset) {
        if(toReset == true){
          vm.budgetValue = [0,30000000];
          vm.on = false;
          vm.budget.toReset = false;
        }
      }, true);

      
      // tickFormat: function(d){
      //         return $filter('shortcurrency')(d,'€');
      //       },

    }

    vm.save = function(){
      FilterSelection.save();
    }

  }
})();