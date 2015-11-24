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
    console.log($scope.defectsList[0]._refObjectName);
  });


}).

/* Projects controller */
controller('projectsController', function($scope, $http, APIservice) {
  $scope.projectsList = [];
  $scope.disable = false;

  var a =  APIservice.getProjects().response1;
  console.log(a);
  APIservice.getProjects().success(function (response) {
    console.log("@" + response);
    $scope.projectsList = response.QueryResult.Results;
  });
}).

/* Project controller */
controller('projectController', function($scope, $routeParams, APIservice) {
  $scope.id = $routeParams.id;
  $scope.defectsList = []; 

  $scope.searchFilter = function (defect) {
       var keyword = new RegExp($scope.nameFilter, 'i');
       return !$scope.nameFilter || keyword.test(defect.Name) || keyword.test(defect.Owner.Name );
    };
  APIservice.getDefectsForId($scope.id).success(function (response) {
    $scope.defectsList = response.QueryResult.Results;
        console.log("name" + $scope.defectsList[0].Owner.Name);

  });

});
