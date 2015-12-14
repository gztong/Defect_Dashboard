angular.module('DefectsApp.services', []).
  factory('APIservice', function($http) {

    var API = {};

    API.getProjects = function(){
      return $http({
        method: 'JSONP',
        url: 'https://rally1.rallydev.com/slm/webservice/v2.0/projects?query=(Name contains "AIM")&pagesize=50&fetch=ObjectID&jsonp=JSON_CALLBACK'
      });
    }

    API.getDefects = function(){
      return $http({
        method: 'JSONP',
       // url: 'https://rally1.rallydev.com/slm/webservice/v2.0/defect?query=(((State = Open) and (Owner.Name = gangzheng.tong@ansys.com)) and (Severity <= %22Minor Problem%22))&order=Priority desc,Severity desc&fetch=true&stylesheet=/slm/doc/webservice/browser'
        url: 'https://rally1.rallydev.com/slm/webservice/v2.0/defects?query=((Owner.Name%20=%20gangzheng.tong@ansys.com)%20and%20(State%20!=%20Completed))&order=Rank&fetch=true&jsonp=JSON_CALLBACK'
      });
    }

    API.tempData = function() {
      return $http.get('content.json');
    }

    API.getDefectsForId = function(id) {
      return $http({
        method: 'JSONP', 
        // sample: https://rally1.rallydev.com/slm/webservice/v2.0/defects?query=(Project.ObjectID%20=%206537932590)&order=LastUpdateDate%20desc&pagesize=10&fetch=State,FormattedID,Owner,RevisionHistory
        url: 'https://rally1.rallydev.com/slm/webservice/v2.0/defects?query=(Project.ObjectID = '+id+')&order=LastUpdateDate desc&pagesize=100&fetch=Tags,Priority,Severity,State,ObjectID,FormattedID,Owner,RevisionHistory&jsonp=JSON_CALLBACK'
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
     	    // Sample: https://rally1.rallydev.com/slm/webservice/v2.0/revisionhistory/425698796/revisions?jsonp=JSON_CALLBACK
  		    url: ref+'/revisions?pagesize=200&jsonp=JSON_CALLBACK'
   		 });
    }

    API.getTags = function(ref){
    	if(ref === null) return null;
    	return $http({
    		method: 'JSONP', 
    		// Sample: https://rally1.rallydev.com/slm/webservice/v2.0/Defect/47941087530/Tags
       		url: ref+'?jsonp=JSON_CALLBACK'
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

	API.groupByDay = function(arr){
		arr.sort(dynamicSort('-RevisionCreationDate'));
		var groups = {};
		var weekday = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
		for(var i=0; i< arr.length; i++){
			var d = new Date(arr[i].RevisionCreationDate);
			var oneWeekAgo = new Date();
			oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

			// Break, if RevisionCreationDate is two weeks ago
			if( d.getTime() < oneWeekAgo.getTime() ) break; 

			if (groups[weekday[d.getDay()]] === undefined ){
				groups[weekday[d.getDay()]] = [];
			}
			groups[weekday[d.getDay()]].push(arr[i]);
		}

		return groups;
	}

	API.getPropertyPool = function(arr){
		var keys = Object.keys(arr[0]);
		keys = ['State', 'Severity', 'Tags', 'Priority', 'OwnerName'];
		var pool = {};
		for(var i=0; i<arr.length; i++){
			for(var j=0; j<keys.length; j++){
				if( pool[keys[j]] === undefined ){
					pool[keys[j]] = [];
				}
				// 'Tags' is a special case
				if(keys[j] === 'Tags'){
					if (pool['Tags'].indexOf('No Tags')<0 && arr[i]['Tags'].length===0) {pool['Tags'].push('No Tags');};
					arr[i]['Tags'].forEach(function(tag){
						if(pool['Tags'].indexOf(tag) <0 ){
							pool['Tags'].push(tag);
						}
					});
				// Other normal cases
				}else if( pool[keys[j]].indexOf(arr[i][keys[j]]) < 0) {
					pool[keys[j]].push(arr[i][keys[j]]);
				}
			}
		}
		console.log(pool);
		return pool;
	}

	API.groupBy = function(arr, property, pool){

		var groups = {};
		var keys = pool[property];

		if(property === 'Owner'){
			for(var i=0; i< arr.length; i++){
				if ( arr[i][property] === null){
					arr[i][property] = {};
					arr[i][property]._refObjectName = 'No Owner';
				} 
				if (groups[arr[i][property]._refObjectName] === undefined ){
					groups[arr[i][property]._refObjectName] = [];
				}
				groups[arr[i][property]._refObjectName].push(arr[i]);
			}
			return groups;
		}
		//TODO
		if(property === 'Tags'){
			groups['No Tags'] = [];
			for(var i=0; i< arr.length; i++){
				if ( arr[i][property].length ===0){
					groups['No Tags'].push(arr[i]);
				}else{	// not an empty tag array
					for(var j=0; j< arr[i][property].length; j++){
						if (groups[arr[i][property][j]]=== undefined ){
							groups[arr[i][property][j]] = [];
						}
						groups[arr[i][property][j]].push(arr[i]);
					}
				}
			}
			return groups;
		}

		for(var i=0; i< arr.length; i++){			
			if (groups[arr[i][property]] === undefined ){
				groups[arr[i][property]] = [];
			}
			groups[arr[i][property]].push(arr[i]);
		}
		return groups;
	}


    return API;
  });