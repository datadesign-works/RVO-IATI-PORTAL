(function () {
    'use strict';

    angular
        .module('oipa.activities')
        .factory('Activities', Activities);

    Activities.$inject = ['$http', 'oipaUrl', 'reportingOrganisationId'];

    function Activities($http, oipaUrl, reportingOrganisationId) {
        var m = this;

        var Activities = {
            all: all,
            get: get,
            getTransactions: getTransactions,
            list: list,
            resultList: resultList,
            locations: locations
        };

        return Activities;

        ////////////////////

        function all() {
            var url = oipaUrl + '/activities/?format=json&page_size=1&fields=iati_identifier,title'
            if(reportingOrganisationId){
                url += '&reporting_organisation=' + reportingOrganisationId
            }
            return $http.get(url, { cache: true });
        }


        function list(filters, page_size, order_by, page){
            var url = oipaUrl + '/activities/?format=json&title_narrative_language=en'
            url += '&fields=id,title,related_activities,recipient_countries,aggregations'

            if(reportingOrganisationId){
                url += '&reporting_organisation=' + reportingOrganisationId
            }
            if(filters !== undefined){
                url += filters;
            }
            if(order_by !== undefined){
                url += '&ordering=' + order_by;
            }
            if(page !== undefined){ 
                url += '&page=' + page;
            }
            if(page_size !== undefined){
                url += '&page_size=' + page_size;
            }

            return $http.get(url, { cache: true });
        }

        function resultList(filters, page_size, order_by, page){
            var url = oipaUrl + '/activities/?format=json'
            url += '&fields=id,title,related_activities,results'

            if(reportingOrganisationId){
                url += '&reporting_organisation=' + reportingOrganisationId
            }
            if(filters !== undefined){
                url += filters;
            }
            if(order_by !== undefined){
                url += '&ordering=' + order_by;
            }
            if(page !== undefined){ 
                url += '&page=' + page;
            }
            if(page_size !== undefined){
                url += '&page_size=' + page_size;
            }

            return $http.get(url, { cache: true });
        }

        function list_programmes(filters, page_size, order_by, page){
            var url = oipaUrl + '/activities/?format=json'
            url += '&fields=id,title,activity_status,recipient_countries,aggregations'

            if(reportingOrganisationId){
                url += '&reporting_organisation=' + reportingOrganisationId
            }
            if(filters !== undefined){
                url += filters;
            }
            if(order_by !== undefined){
                url += '&ordering=' + order_by;
            }
            if(page !== undefined){ 
                url += '&page=' + page;
            }
            if(page_size !== undefined){
                url += '&page_size=' + page_size;
            }

            return $http.get(url, { cache: true });
        }

        function get(code) {
            return $http.get(oipaUrl + '/activities/' + code + '/?format=json', { cache: true });
        }

        function getTransactions(code) {
            return $http.get(oipaUrl + '/activities/' + code + '/transactions/?format=json&page_size=999', { cache: true });
        }

        function locations(filters, limit){
            var url = oipaUrl + '/activities/?format=json'
            url += '&fields=id,title,locations&page=1&page_size=1000'

            if(reportingOrganisationId){
                url += '&reporting_organisation=' + reportingOrganisationId
            }
            if(filters !== undefined){
                url += filters;
            }
            return $http.get(url, { cache: true });
        }
    }
})();