/**
* NavbarController
* @namespace oipa.navbar.controllers
*/
(function () {
  'use strict';

  angular
    .module('oipa.layout')
    .controller('NavbarController', NavbarController);

  NavbarController.$inject = ['$scope', '$state', 'templateBaseUrl', 'homeUrl'];

  function NavbarController($scope, $state, templateBaseUrl, homeUrl) {
    var vm = this;

    $scope.homeUrl = homeUrl;
    $scope.templateBaseUrl = templateBaseUrl;
    vm.stateName = '';
    vm.state = $state;
    activate();

    function loadScrollListener(){
      var eTop = 0;

      if(document.getElementById('filter-bar') !== null) {
        eTop = $('#filter-bar').offset().top-5;

        $(window).unbind('resize.filterBar');
        $(window).bind('resize.filterBar', function() {
          eTop = $('#filter-bar').offset().top-5;
        })

        $(window).unbind('scroll.filterBar');

        $(window).bind("scroll.filterBar", function() {
          var height = $(window).scrollTop();
          var $fixedbar = $('.filters-fixed');

          if(height  > eTop ) {
              var barHeight = $('.filters-fixed').height()+5;
              $fixedbar.addClass('fixed');
              $('.pad-helper').css('height',barHeight);
              $("#toTop").fadeIn();
          }
          if (height < eTop ) {
             $fixedbar.removeClass('fixed');
             $('.pad-helper').css('height',0);
             $("#toTop").fadeOut();
          }
        });
      }
    
    }

    function activate(){

      $scope.$watch('vm.state.current.name', function(name){
        if (['activities', 'activities-list', 'activiteit'].indexOf(name) >= 0) { vm.stateName = 'activities'; }
        else if (['locations', 'locations-map', 'locations', 'country'].indexOf(name) >= 0) { vm.stateName = 'locations'; }
        else if (['programmes', 'programme'].indexOf(name) >= 0) { vm.stateName = 'programmes'; }
        else if (['sectors', 'sectors-vis', 'sector-list', 'sector'].indexOf(name) >= 0) { vm.stateName = 'sectors'; }
        else if (['organisations', 'organisation'].indexOf(name) >= 0) { vm.stateName = 'organisations'; }
        else if (['search'].indexOf(name) >= 0) { vm.stateName = 'search'; }
        else if (['about'].indexOf(name) >= 0) { vm.stateName = 'about'; }
        else if (['results'].indexOf(name) >= 0) { vm.stateName = 'results'; }
        else { vm.stateName = 'home'; }

        $("html, body").animate({
          scrollTop:0
        },400);

        loadScrollListener();
      }, true);

      
      $(window).load(loadScrollListener);

      // $('.nav a.mobi').on('click', function(){
      //   $('.navbar-toggle').click();
      // });
      
    }
    
  }
})();