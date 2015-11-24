var controllers = angular.module('DefectsApp.controllers', []);

controllers.controller('driversController', function($scope, APIservice) {
    $scope.nameFilter = null;
    $scope.driversList = [];
    

  APIservice.getDrivers().success(function (response){
    $scope.driversList = response.MRData.StandingsTable.StandingsLists[0].DriverStandings;
  });
}).

/* Driver controller */
controller('driverController', function($scope, $routeParams, APIservice) {
  $scope.id = $routeParams.id;
  $scope.races = [];
  $scope.driver = null;

  APIservice.getDriverDetails($scope.id).success(function (response) {
    $scope.driver = response.MRData.StandingsTable.StandingsLists[0].DriverStandings[0]; 
  });

  APIservice.getDriverRaces($scope.id).success(function (response) {
    $scope.races = response.MRData.RaceTable.Races; 
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
    console.log($scope.defectsList[0]._refObjectName);
  });


}).

/* Projects controller */
controller('projectsController', function($scope, $http, APIservice) {
  $scope.projectsList = [];
  $scope.disable = false;


  APIservice.getProjects().success(function (response) {
    $scope.projectsList = response.QueryResult.Results;
    console.log($scope.projectsList[0].Name);
  });
}).

/* Project controller */
controller('projectController', function($scope, $routeParams, APIservice) {
  $scope.id = $routeParams.id;
  $scope.defectsList = []; 

  $scope.searchFilter = function (defect) {
       var keyword = new RegExp($scope.nameFilter, 'i');
       return !$scope.nameFilter || keyword.test(defect._refObjectName) || keyword.test(defect.Owner._refObjectName );
    };
  APIservice.getDefects($scope.id).success(function (response) {
    $scope.defectsList = response.QueryResult.Results;
  });

});
