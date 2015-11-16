/**
* LocationsGeoMapController
* @namespace oipa.locations
*/

(function () {
  'use strict';

  angular
    .module('oipa.locations')
    .controller('LocationsGeoMapController', LocationsGeoMapController);

  LocationsGeoMapController.$inject = ['$scope', 'leafletData', 'Aggregations', 'templateBaseUrl', 'homeUrl', 'FilterSelection', '$sce', '$filter'];

  /**
  * @namespace LocationsGeoMapController
  */
  function LocationsGeoMapController($scope, leafletData, Aggregations, templateBaseUrl, homeUrl, FilterSelection, $sce, $filter) {
    var vm = this;

    vm.geoView = "countries";
    vm.mapHeight = $scope.mapHeight;
    vm.mapDropdown = ($scope.mapDropdown == 'true');
    vm.templateBaseUrl = templateBaseUrl;
    vm.countryRelation = [
      {'id':1, 'name': 'Aid relation'}, 
      {'id':2, 'name': 'Transition relation'}, 
      {'id':3, 'name': 'EXIT relation'}, 
      {'id':4, 'name': 'Trade relation'}, 
      {'id':5, 'name': 'Other'}];
    vm.selectedCountryRelation = [
      {'id':1, 'name': 'Aid relation'}, 
      {'id':2, 'name': 'Transition relation'}, 
      {'id':3, 'name': 'EXIT relation'}, 
      {'id':4, 'name': 'Trade relation'}, 
      {'id':5, 'name': 'Other'}];

    vm.currentHoverText = '';
    // vm.buttonTexts = {
    //   'hover1': {'text': 'Hulp txt', hoverShow: false},
    //   'hover2': {'text': 'Transition relation txt', hoverShow: false},
    //   'hover3': {'text': 'Exit txt', hoverShow: false},
    //   'hover4': {'text': 'Handelstxt', hoverShow: false},
    //   'hover5': {'text': 'Other txt', hoverShow: false},
    // };

    vm.defaults = {
      tileLayer: 'https://{s}.tiles.mapbox.com/v3/zimmerman2014.deb5109d/{z}/{x}/{y}.png',
      maxZoom: 12,
      minZoom: 2,
      attributionControl: false,
      scrollWheelZoom: false,
      continuousWorld: false,
      zoomControlPosition: 'topright'
    };
    vm.center = {
        lat: 14.505,
        lng: 18.00,
        zoom: 3
    };

    vm.layers = {
      baselayers: {
        osm: {
          name: 'OpenStreetMap',
          type: 'xyz',
          url: 'https://{s}.tiles.mapbox.com/v3/zimmerman2014.deb5109d/{z}/{x}/{y}.png',
          layerOptions: {
              subdomains: ['a', 'b', 'c'],
              attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
              continuousWorld: true
          }
        }
      },
    };

    vm.markers = {};
    vm.markerIcons = {
      Aidrelation: { html: '<div class="fa fa-map-marker fa-stack-1x fa-inverse marker-circle marker-circle-Aidrelation"></div>',type: 'div',iconSize: [28, 35],iconAnchor: [14, 18],markerColor: 'blue',iconColor: 'white',},
      Transitionrelation: { html: '<div class="fa fa-map-marker fa-stack-1x fa-inverse marker-circle marker-circle-Transitionrelation"></div>',type: 'div',iconSize: [28, 35],iconAnchor: [14, 18],markerColor: 'blue',iconColor: 'white',},
      EXITrelation: { html: '<div class="fa fa-map-marker fa-stack-1x fa-inverse marker-circle marker-circle-EXITrelation"></div>',type: 'div',iconSize: [28, 35],iconAnchor: [14, 18],markerColor: 'blue',iconColor: 'white',},
      Traderelation: { html: '<div class="fa fa-map-marker fa-stack-1x fa-inverse marker-circle marker-circle-Traderelation"></div>',type: 'div',iconSize: [28, 35],iconAnchor: [14, 18],markerColor: 'blue',iconColor: 'white',},
      Other: { html: '<div class="fa fa-map-marker fa-stack-1x fa-inverse marker-circle marker-circle-Other2"></div>',type: 'div',iconSize: [28, 35],iconAnchor: [14, 18],markerColor: 'blue',iconColor: 'white',},
      Regiocirkel: { html: '<div class="region-marker-circle"></div>' ,type: 'div',iconSize: [200, 200],iconAnchor: [100, 100],markerColor: 'blue',iconColor: 'white',}
    };

    vm.filterSelection = FilterSelection;
    vm.selectionString = '';

    vm.countryMarkerData = [];
    vm.regionMarkerData = [];

    vm.geoView = 'countries';
    vm.resultCounter = 0;

    /**
    * @name activate
    * @desc Actions to be performed when this controller is instantiated
    * @memberOf oipa.countries.controllers.CountriesController
    */
    function activate() {

      $scope.$watch('vm.filterSelection.selectionString', function (selectionString) {
        vm.selectionString = selectionString;
        vm.updateMap();
      }, true);
    }

    vm.changeSelectedCountryRelations = function(){
      vm.updateMap();
    }

    vm.changeView = function(){
      $scope.geoView = vm.geoView;
      vm.updateMap();
    }

    vm.updateMap = function(){

        Aggregations.aggregation('recipient-country', 'disbursement', vm.selectionString, 'name', 1000, 0, 'activity_count').then(countrySuccessFn, errorFn);
        
        Aggregations.aggregation('recipient-region', 'disbursement', vm.selectionString, 'name', 1000, 0, 'activity_count').then(regionSuccessFn, errorFn);

        function countrySuccessFn(data, status, headers, config) {
            vm.countryMarkerData = data.data.results;
            vm.updateCountryMarkers();
        }

        function regionSuccessFn(data, status, headers, config){
            vm.regionMarkerData = data.data.results;
            vm.updateRegionMarkers();
        }

        function errorFn(data, status, headers, config) {
            console.log("getting countries failed");
        }
    }

    vm.hoverIn = function(id){
      vm.buttonTexts[id].hoverShow = true;
      vm.currentHoverText =  $sce.trustAsHtml(vm.buttonTexts[id].text);
    };

    vm.hoverOut = function(id){
        vm.buttonTexts[id].hoverShow = false;
    };

    vm.deleteAllMarkers = function(){

      for (var obj in vm.markers) {
        delete vm.markers[obj];
      }
    }

    vm.updateCountryMarkers = function(markerData) {
      
      if(vm.geoView != 'countries'){
        return false;
      }

      vm.deleteAllMarkers();

      var selectedCountryRelationMap = {};
      for(var i = 0;i < vm.selectedCountryRelation.length;i++){
          selectedCountryRelationMap[vm.selectedCountryRelation[i]['name'].replace(/\s/g, '')] = true;
      }

      for (var i = 0; i < vm.countryMarkerData.length;i++){
       
          var partnerType = 'Other';

          var message = '<span class="flag-icon flag-icon-'+vm.countryMarkerData[i].country_id.toLowerCase()+'"></span>'+
                '<h4>'+vm.countryMarkerData[i].name+'</h4>'+
                '<p><b>Activities:</b> '+vm.countryMarkerData[i]['activity_count']+'</p>'+
                '<p><b>Total expenditure:</b> '+ $filter('shortcurrency')(vm.countryMarkerData[i]['total_disbursements'],'€') +'</p>'+
                '<a class="btn btn-default" href="'+homeUrl+'/countries/'+vm.countryMarkerData[i].country_id+'/">Go to country overview</a>';

          if(vm.markers[vm.countryMarkerData[i].country_id] === undefined){
            if(vm.countryMarkerData[i].location != null){
              var location = vm.countryMarkerData[i].location.substr(6, (vm.countryMarkerData[i].location.length - 7));
              location = location.split(' ');
              var flag = vm.countryMarkerData[i].country_id;
              var flag_lc = flag.toLowerCase();
              vm.markers[vm.countryMarkerData[i].country_id] = {
                lat: parseInt(location[1]),
                lng: parseInt(location[0]),
                icon: vm.markerIcons[partnerType],
              }
            }
          }
          vm.markers[vm.countryMarkerData[i].country_id].message = message;
          
      }
    }

    vm.updateRegionMarkers = function(markerData) {
      
      if(vm.geoView != 'regions'){
        return false;
      }

      vm.deleteAllMarkers();

      for (var i = 0; i < vm.regionMarkerData.length;i++){

        if(vm.regionMarkerData[i].location != null){

          var message = '<span class="flag-icon flag-icon-'+vm.regionMarkerData[i].region_id+'"></span>'+
              '<h4>'+vm.regionMarkerData[i].name+'</h4>'+
              '<p><b>Activities:</b> '+vm.regionMarkerData[i]['activity_count']+'</p>'+
              '<p><b>Total expenditure:</b> '+ $filter('shortcurrency')(vm.regionMarkerData[i]['total_disbursements'],'€') + '</p>'+
              '<a class="btn btn-default" href="'+homeUrl+'/regions/'+vm.regionMarkerData[i].region_id+'/">Ga naar regio overzicht</a>';

          if(vm.markers[vm.regionMarkerData[i].region_id] == undefined){
            var location = vm.regionMarkerData[i].location.substr(6, (vm.regionMarkerData[i].location.length - 7));
            location = location.split(' ');
            vm.markers[vm.regionMarkerData[i].region_id] = {
              lat: parseInt(location[1]),
              lng: parseInt(location[0]),
              icon: vm.markerIcons['Regiocirkel'],
            }
          }

          vm.markers[vm.regionMarkerData[i].region_id].message = message;
        }
      }
    }

    activate();
  }
})();