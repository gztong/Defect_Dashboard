var controllers = angular.module('DefectsApp.controllers', []);

controllers.controller('driversController', function($scope, APIservice) {
    $scope.nameFilter = null;
    $scope.driversList = [];
    

  APIservice.getDrivers().success(function (response){
    $scope.driversList = response.MRData.StandingsTable.StandingsLists[0].DriverStandings;
  });
}).

/* Defects controller */
controller('defectsController', function($scope, APIservice) {
  $scope.defectsList = [];

  $scope.searchFilter = function (defect) {
       var keyword = new RegExp($scope.nameFilter, 'i');
       return !$scope.nameFilter || keyword.test(defect._refObjectName) || keyword.test(defect.Owner._refObjectName );
    };
  APIservice.getDefects($scope.id).success(function (response) {
    $scope.defectsList = response.QueryResult.Results;
  });


}).

/* Projects controller */
controller('projectsController', function($scope, $http, APIservice) {
  $scope.projectsList = [];
  $scope.disable = false;

  APIservice.getProjects().success(function (response) {
    $scope.projectsList = response.QueryResult.Results;
  });
}).

/* Project controller */
controller('projectController' , function($scope, $routeParams, APIservice, artifactsManager) {
  $scope.id = $routeParams.id;
  $scope.defectsList = []; 
  $scope.RevisionHistory = new Array();
  $scope.LastRevisions = new Array();

  $scope.searchFilter = function (defect) {
       var keyword = new RegExp($scope.nameFilter, 'i');
       return !$scope.nameFilter || keyword.test(defect._refObjectName);
    };

  // APIservice.getDefectsForId($scope.id).success(function (response) {
  //   $scope.defectsList = response.QueryResult.Results;
  //    getRevisions(response);
  // });

  artifactsManager.loadAllArtifacts($scope.id).then(
    function(result){
   // $scope.defectsList = result;
    return result;
    },
    function(error){
      console.log(error.statusText);
    }
  ).then(function(result){
   $scope.defectsList = artifactsManager.buildArtifacts(result);


  });

  // artifactsManager.loadAllArtifacts($scope.id).then(function(artifacts){
  //     $scope.defectsList = artifacts;
  // });



  var getRevisions = function(response){
    for(var i=0; i < $scope.defectsList.length; i++){
      $scope.RevisionHistory[i] = response.QueryResult.Results[i].RevisionHistory._ref;
        APIservice.getRevisions( $scope.RevisionHistory[i] ).success(function (response1){
          //console.log(response1.QueryResult.Results[0].Description);
          $scope.LastRevisions[i] = response1.QueryResult.Results[0].CreationDate;
          // console.log($scope.LastRevisions[$scope.defectsList[i].FormattedID]);
         // console.log($scope.LastRevisions[i]);
        });  
    }
  }

});
