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
  $scope.id = $routeParams.id;
  $scope.basicList = [];
  $scope.defectsList = []; 
  $scope.groupDict = {};
  $scope.groupDict2 = {};
  $scope.RevisionHistory = new Array();
  $scope.LastRevisions = new Array();
  $scope.orderToggled = {
      'Owner': false,
      'Tags': false,
      'Package': false,
      'Changeset': false,
      'Resolution': false
  };
  $scope.propertyFilter = {
  	'State': ['Open', 'Submitted'],
  	'Severity': ['Cosmetic Problem (Class 2)']
  };

  $scope.nameFilter ={};
  $scope.pool = {};

  $scope.searchFilter = function (defect) {
  		// $scope.groupDict2[State] contains defect

  		// for( key in $scope.propertyFilter){
  		// 	var value = $scope.propertyFilter[key];
  		// 	console.log(value);
  		// }


       var keyword = new RegExp($scope.nameFilter.text, 'i');

       var filterResult = true;

       return  (($scope.nameFilter.text === undefined) 
       || keyword.test(defect.Name) 
       || keyword.test(defect.Severity)
       || keyword.test(defect.State))
       && filterResult;
    };

  artifactsManager.loadAllArtifacts($scope.id).then(
    function(result){
   // $scope.defectsList = result;
    return result;
    },
    function(error){
      console.log(error.statusText);
    }
  ).then(function(result){
   $scope.basicList = artifactsManager.buildArtifacts(result);
   $scope.defectsList = $scope.basicList;
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
