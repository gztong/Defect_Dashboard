var controllers = angular.module('DefectsApp.controllers', []);

controllers.controller('driversController', function($scope, APIservice) {
    $scope.nameFilter = null;
    $scope.driversList = [];
}).

/* Defects controller */
controller('defectsController', function($scope, APIservice) {
  $scope.defectsList = [];

  $scope.searchFilter = function (defect) {
       var keyword = new RegExp($scope.nameFilter, 'i');
       return !$scope.nameFilter || keyword.test(defect.Name);
    };
  APIservice.getDefects($scope.id).success(function (response) {
    $scope.defectsList = response.QueryResult.Results;
  });

}).

/* Projects controller */
controller('projectsController', function($scope, $http, APIservice, projectsManager) {
  $scope.projectsList = [];
  $scope.disable = false;

  projectsManager.getProjects().then(function(result){
    $scope.projectsList = result;
  });

}).

/* Project controller */
controller('projectController' , function($scope, $routeParams, APIservice, artifactsManager) {
  // $('[data-toggle="tooltip"]').tooltip(); 
  $scope.id = $routeParams.id;
  $scope.basicList = [];
  $scope.defectsList = []; 
  $scope.groupDict = {};
  $scope.groupDict2 = {};
  $scope.RevisionHistory = [];
  $scope.LastRevisions = [];
  $scope.hide_filter = true;
  $scope.hideButtonText = "Show";
  $scope.orderToggled = {
      'Owner': false,
      'Tags': false,
      'Package': false,
      'Changeset': false,
      'Resolution': false
  };
  $scope.propertyFilter = {};
  $scope.nameFilter ={};
  $scope.pool = {};
  $scope.getLabelClass = function(tag){
  	var classes = ['label-primary', 'label-danger', 'label-success', 'label-info', 'label-warning'];
  	var i = hashCode(tag) % 5;
  	i = i>0 ? i: -i;
  	return classes[i];
  }
  hashCode = function(s){
 	 return s.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);              
  }

  $scope.searchFilter = function(defect){
  	var keyword = new RegExp($scope.nameFilter.text, 'i');
  	return ($scope.nameFilter.text === undefined) 
  	|| keyword.test(defect.Name) 
  	|| keyword.test(defect.Severity)
  	|| keyword.test(defect.State)
  	|| keyword.test(defect.FormattedID)
  	|| keyword.test(defect.OwnerName);
  };

  $scope.groupFilter = function(defect){

  	for(var key in $scope.propertyFilter){
  		if(key === 'Owner'){	// 'Owner' needs to be treated specially 
  			 //TODO
  			// if( $scope.propertyFilter[key].indexOf( defect.Owner._refObjectName) >= 0 ){
  			// 	continue;
  			// }else{
  			// 	return false;
  			// }
  		}else if(key === 'Tags'){
  			if (defect['Tags'].length===0 && $scope.propertyFilter[key].indexOf('No Tags')<0){
  				return false;
  			} 

  			for(var i=0; i<defect['Tags'].length; i++){
  				if( $scope.propertyFilter[key].indexOf(defect['Tags'][i]) >= 0 ){
  					continue;
  				}else{
  					return false;
  				}
  			}
  		}else{
  			if( $scope.propertyFilter[key].indexOf( defect[key]) >= 0 ){
  				continue;
  			}else{
  				return false;
  			}
  		}
  	}

  	return true;
  };


  $scope.addFilter = function(key, option){
  	if(	$scope.propertyFilter[key] === undefined){
  		$scope.propertyFilter[key] = [];
  	}
  	var index = $scope.propertyFilter[key].indexOf(option);

  	if(index < 0){
  		$scope.propertyFilter[key].push(option);
  	}else{
  		$scope.propertyFilter[key] = $scope.propertyFilter[key].splice(index+1, 1);
  		if( $scope.propertyFilter[key].length ===0 ){
  			delete $scope.propertyFilter[key];
  		} 
  	}
  }



  artifactsManager.loadAllArtifacts($scope.id).then(
    function(result){
    return result;
    },
    function(error){
      console.log(error.statusText);
    }
  ).then(function(result){
   $scope.basicList = artifactsManager.buildArtifacts(result);

   var listtest = artifactsManager.getTags($scope.basicList).then(function(result){
   		var withTags = result;
   		console.log(result);
   });


    artifactsManager.getRevisions($scope.basicList).then(function(result){
        //$scope.LastRevisions = result;
        $scope.revisionsInfo = result; 
        $scope.defectsList = APIservice.mergeArrays($scope.basicList, $scope.revisionsInfo);

        $scope.groupDict = APIservice.groupByDay($scope.defectsList);

        $scope.pool.property = APIservice.getPropertyPool($scope.defectsList);

        $scope.groupDict2 = APIservice.groupBy($scope.defectsList, 'State', $scope.pool.property  );
    }); 



    $scope.sortRevisions = function(patt){
    	$scope.defectsList = artifactsManager.sortBy(patt, $scope.defectsList );
    	$scope.groupDict = APIservice.groupByDay($scope.defectsList);
    };

    $scope.toggle_filter = function(){
    	console.log('toggle_filter');
    	$scope.hide_filter = !$scope.hide_filter;
    	$scope.hideButtonText = $scope.hide_filter? "Show":"Hide";	
    };

    $scope.toggle = function(type){
    	$scope.orderToggled[type] = !$scope.orderToggled[type];

    	var patt = "";
    	var count = 0;

    	for(var key in $scope.orderToggled){
    		if($scope.orderToggled[key] === true){
    			patt = patt + '|('+key+')';
    			count++;
    		}
    	}

    	if(count === 0){
    		patt = '.';
    	}else{
    		patt = patt.substring(1);
    	}
    	$scope.sortRevisions(patt);
    }

    $scope.groupBy = function(property){
    	$scope.groupDict2 = APIservice.groupBy($scope.defectsList, property, $scope.pool.property  );
    }

});

});
