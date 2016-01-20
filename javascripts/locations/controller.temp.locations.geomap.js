/**
* LocationsGeoMapController
* @namespace oipa.locations
*/
(function () {
  'use strict';

  angular
    .module('oipa.locations')
    .controller('TempLocationsGeoMapController', TempLocationsGeoMapController);

  TempLocationsGeoMapController.$inject = ['$scope', 'leafletData', 'Aggregations', 'Activities', 'templateBaseUrl', 'homeUrl', 'FilterSelection', '$filter'];

  /**
  * @namespace LocationsGeoMapController
  */
  function TempLocationsGeoMapController($scope, leafletData, Aggregations, Activities, templateBaseUrl, homeUrl, FilterSelection, $filter) {
    var vm = this;
    vm.geoView = "countries";
    vm.mapHeight = $scope.mapHeight;
    vm.mapDropdown = $scope.mapDropdown;
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

    vm.defaults = {
      maxZoom: 10,
      minZoom: 2,
      attributionControl: false,
      scrollWheelZoom: false,
      zoomControlPosition: 'topright'
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
      overlays: {
        locations: {
            name: 'locations',
            type: 'markercluster',
            visible: true
        }
      }, 
    }

    vm.center = {
        lat: -59.204,
        lng: -131.484,
        zoom: 3
    };

    vm.markers = {};
    vm.markerIcons = {
      Delete: { html: '<div class="removed-marker" style="display: none"></div>',type: 'div',iconSize: [28, 35],iconAnchor: [14, 18],markerColor: 'blue',iconColor: 'white',},
      Other: { html: '<div class="fa fa-map-marker fa-stack-1x fa-inverse marker-circle marker-circle-Other2"></div>',type: 'div',iconSize: [28, 35],iconAnchor: [14, 18],markerColor: 'blue',iconColor: 'white',},
      Regiocirkel: { html: '<div class="region-marker-circle"></div>' ,type: 'div',iconSize: [200, 200],iconAnchor: [100, 100],markerColor: 'blue',iconColor: 'white',}
    };

    vm.filterSelection = FilterSelection;
    vm.selectionString = '';

    vm.countryMarkerData = [];
    vm.regionMarkerData = [];
    
    vm.geoView = 'countries';
    vm.resultCounter = 0;

    vm.geoLocation = null;

    /**
    * @name activate
    * @desc Actions to be performed when this controller is instantiated
    * @memberOf oipa.countries.controllers.CountriesController
    */
    function activate() {

      if($scope.exactLocation !== undefined){
        
        $scope.$watch('exactLocation', function (exactLocation) {
          if(exactLocation){
            vm.geoLocation = exactLocation;
            vm.showExactLocation();
          }
          
        }, true);

      } else {
        $scope.$watch('vm.filterSelection.selectionString', function (selectionString) {
          vm.selectionString = selectionString;
          vm.updateMap();
        }, true);
      }
    }

    vm.showExactLocation = function() {

      if(!vm.geoLocation.center_longlat){
        return false;
      }

      var location = vm.geoLocation.center_longlat.replace('POINT (', '').replace(')', '');
      location = location.split(' ');

      vm.center.lat = parseInt(location[1]);
      vm.center.lng = parseInt(location[0]);

      vm.markers['location'] = {
        lat: parseInt(location[1]),
        lng: parseInt(location[0]),
      }

      if (vm.geoLocation.code === parseInt(vm.geoLocation.code, 10))
        vm.markers['location'].icon = { html: '<div class="region-marker-circle"></div>' ,type: 'div',iconSize: [200, 200],iconAnchor: [100, 100],markerColor: 'blue',iconColor: 'white',};
      else
        vm.markers['location'].icon = { html: '<div class="fa fa-map-marker fa-stack-1x fa-inverse marker-circle marker-circle-Other2"></div>',type: 'div',iconSize: [28, 35],iconAnchor: [14, 18],markerColor: 'blue',iconColor: 'white',};
      
        
    };


    vm.changeSelectedCountryRelations = function(){
      vm.updateMap();
    }

    vm.changeView = function(){
      $scope.geoView = vm.geoView;
      vm.updateMap();
    }

    vm.updateMap = function(){

      Activities.locations(vm.selectionString).then(function(data,status,headers,config){

        vm.deleteAllMarkers();
        var newMarkers = {};

        for(var i = 0;i < data.data.objects.length;i++){
          for(var y = 0;y < data.data.objects[i].locations.length;y++){

            var message = '<h4 style="margin-top: 50px; font-size: 16px; color: #007bc7;">'+data.data.objects[i].titles[0].title+'</h4><a target="_blank" class="btn btn-default" href="'+homeUrl+'/projects/'+data.data.objects[i].id+'/">Go to project</a>';

            newMarkers[i + '_' + y] = {
              lat: parseInt(data.data.objects[i].locations[y].latitude),
              lng: parseInt(data.data.objects[i].locations[y].longitude),
              layer: 'locations',
              message: message
            };
          }
        }
        vm.markers = newMarkers;

      }, function(data,status,headers,config){
        console.log('failed');
        console.log(data);
      });


    



        // Aggregations.aggregation('recipient-country', 'disbursement', vm.selectionString, 'name', 1000, 0, 'activity_count').then(countrySuccessFn, errorFn);
        // Aggregations.aggregation('recipient-region', 'disbursement', vm.selectionString, 'name', 1000, 0, 'activity_count').then(regionSuccessFn, errorFn);

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

            if (selectedCountryRelationMap[partnerType] !== undefined){
              var message = '<span class="flag-icon flag-icon-'+vm.countryMarkerData[i].country_id.toLowerCase()+'"></span>'+
                    '<h4>'+vm.countryMarkerData[i].name+'</h4>'+
                    '<p><b>Activities:</b> '+vm.countryMarkerData[i]['activity_count']+'</p>'+
                    '<p><b>Total expenditure:</b> '+ $filter('shortcurrency')(vm.countryMarkerData[i]['total_disbursements'],'€') +'</p>'+
                    '<p><b>Relationship type:</b> '+partnerType+'</p>'+
                    '<a class="btn btn-default" href="'+homeUrl+'/landen/'+vm.countryMarkerData[i].country_id+'/">Go to country overview</a>';

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