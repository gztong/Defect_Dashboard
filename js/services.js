angular.module('DefectsApp.services', []).
  factory('APIservice', function($http) {

    var API = {};

    API.getProjects = function(){
      return $http({
        method: 'JSONP',
        url: 'https://rally1.rallydev.com/slm/webservice/v2.0/projects?query=(Name contains "AIM")&pagesize=200&fetch=ObjectID&jsonp=JSON_CALLBACK'
      });
    }

    API.getDefects = function(){
      return $http({
        method: 'JSONP',
       // url: 'https://rally1.rallydev.com/slm/webservice/v2.0/defect?query=(((State = Open) and (Owner.Name = gangzheng.tong@ansys.com)) and (Severity <= %22Minor Problem%22))&order=Priority desc,Severity desc&fetch=true&stylesheet=/slm/doc/webservice/browser'
        url: 'https://rally1.rallydev.com/slm/webservice/v2.0/defects?query=((Owner.Name%20=%20gangzheng.tong@ansys.com)%20and%20(State%20!=%20Completed))&order=Rank&fetch=true&jsonp=JSON_CALLBACK'
      });
    }

    API.getDrivers = function() {
      return $http({
        method: 'JSONP', 
        url: 'http://ergast.com/api/f1/2013/driverStandings.json?callback=JSON_CALLBACK'
      });
    }

    API.tempData = function() {
      return $http.get('content.json');
    }

    API.getDefectsForId = function(id) {
      return $http({
        method: 'JSONP', 
        // sample: https://rally1.rallydev.com/slm/webservice/v2.0/defects?query=(Project.ObjectID="6537932590")&pagesize=200&fetch=FormattedID,Owner&jsonp=JSON_CALLBACK
        url: 'https://rally1.rallydev.com/slm/webservice/v2.0/defects?query=(Project.ObjectID = '+id+')&order=CreationDate desc&pagesize=100&fetch=FormattedID,Owner,RevisionHistory&jsonp=JSON_CALLBACK'
      });
    }

    // API.getDriverRaces = function(id) {
    //   return $http({
    //     method: 'JSONP', 
    //     url: 'http://ergast.com/api/f1/2013/drivers/'+ id +'/results.json?callback=JSON_CALLBACK'
    //   });
    // }

    API.getRevisions = function(ref){
      return $http({
        method: 'JSONP', 
        // sample: https://rally1.rallydev.com/slm/webservice/v2.0/revisionhistory/425698796/revisions?jsonp=JSON_CALLBACK
        url: ref+'/revisions?pagesize=200&jsonp=JSON_CALLBACK'
      });
    }



    // API.mergeObjects = function(obj1,obj2){
    //   var obj3 = {};
    //   for (var attrname in obj1) { obj3[attrname] = obj1[attrname]; }
    //   for (var attrname in obj2) { obj3[attrname] = obj2[attrname]; }
    //   return obj3;
    // }

    API.filterRevisions = function(results, patt){
      for(var k = 0; k < results.length; k++){
        if( patt.test(results[k].Description) ){
          return results[k];
       }
     }
     var notfound = {
          Description: "Not Found",
          CreationDate: "1970-12-03T15:39:53.953Z"
     }
     return notfound;
   }
   // arr1: all elements
   // arr2 : filtered elements
    API.mergeArrays = function(arr1, arr2){
     
    //  arr1.sort(dynamicSort('FormattedID'));
     // arr2.sort(dynamicSort('FormattedID'));

      for (var i=0; i< arr1.length; i++){
        if (arr2[i].FormattedID === arr1[i].FormattedID){
            $.extend( arr1[i], arr2[i] );
        }else{
          console.log("NOT MATCH");
        }
      }
      return arr1;
    }

    function dynamicSort(property) {
    var sortOrder = 1;
    if(property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }
    return function (a,b) {
        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
        return result * sortOrder;
    }
}
    return API;
  });