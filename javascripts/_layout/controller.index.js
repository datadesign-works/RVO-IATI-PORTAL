/**
* IndexController
* @namespace oipa.layout.controllers
*/
(function () {
  'use strict';

  angular
    .module('oipa.layout')
    .controller('IndexController', IndexController);

  IndexController.$inject = ['$scope', '$sce', 'FilterSelection', 'Aggregations', 'TransactionAggregations', 'Activities', '$http', '$filter'];

  function IndexController($scope, $sce, FilterSelection, Aggregations, TransactionAggregations, Activities, $http, $filter) {
    var vm = this;
    vm.countryCount = null;
    vm.activityCount = null;
    vm.budget = null;
    vm.date_updated = '';


    activate();

    function activate() {

      FilterSelection.reset();

      var selectionString = '';

      Aggregations.aggregation('recipient_country', 'count', selectionString + '&hierarchy=2', 'recipient_country', 1).then(function(data, status, headers, config){
        vm.countryCount = data.data.count;
      }, errorFn);

      Activities.list(selectionString + '&hierarchy=2', 1).then(function(data, status, headers, config){
        vm.activityCount = data.data.count;
      }, errorFn);

      TransactionAggregations.aggregation('reporting_organisation', 'incoming_fund', '&hierarchy=2').then(function(data, status, headers, config){
        vm.budget = data.data.results[0].incoming_fund;
      }, errorFn);

      $http.get(home_url + "/wp-admin/admin-ajax.php?action=dateupdated", { cache: true }).then(function(data, status, headers, config){
        vm.date_updated = $filter('date')(new Date(data.data.date_updated.substring(0, 10)),'dd-MM-yyyy');
      }, errorFn);

      function errorFn(data,status,heders,config){
        
      }
    }
  }
})();