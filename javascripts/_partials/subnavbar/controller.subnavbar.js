/**
* TopNavBarController
* @namespace oipa.partials
*/
(function () {
  'use strict';

  angular
    .module('oipa.partials')
    .controller('SubNavbarController', SubNavbarController);

  SubNavbarController.$inject = ['$scope'];

  /**
  * @namespace CountriesController
  */
  function SubNavbarController($scope) {
    var vm = this;
    vm.tabs = $scope.tabs;

    vm.openTab = function(id){
      $scope.selectedTab = id;
      console.log('opentab');
      window.dispatchEvent(new Event('resize'));
    }

    vm.isOpenedTab = function(id){
      return $scope.selectedTab == id;
    }
  }
})();