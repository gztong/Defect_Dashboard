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
       return !$scope.nameFilter || keyword.test(defect.Name) || keyword.test(defect.Owner.Name );
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

  // APIservice.getProjects().success(function (response) {
  //  // $scope.projectsList = response.QueryResult.Results;

  // });
}).

/* Project controller */
controller('projectController' , function($scope, $routeParams, APIservice, artifactsManager) {
  $scope.id = $routeParams.id;
  $scope.basicList = [];
  $scope.defectsList = []; 
  $scope.RevisionHistory = new Array();
  $scope.LastRevisions = new Array();
  $scope.orderToggled = {
      'Owner': false,
      'Tags': false,
      'Package': false,
      'Changeset': false
  };
  $scope.nameFilter ={};

  $scope.searchFilter = function (defect) {
       var keyword = new RegExp($scope.nameFilter.text, 'i');
       return ($scope.nameFilter.text === undefined) || keyword.test(defect.Name);
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
        $scope.LastRevisions = result;
        $scope.defectsList = APIservice.mergeArrays($scope.basicList, $scope.LastRevisions);

    }); 

  $scope.sortRevisions = function(patt){
    console.log("sort for " + patt);
    $scope.LastRevisions = artifactsManager.sortBy(patt);
    $scope.defectsList = APIservice.mergeArrays($scope.basicList, $scope.LastRevisions);
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

  });




});
