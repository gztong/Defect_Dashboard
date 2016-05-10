'use strict';
var defectsApp = angular.module('DefectsApp', [
  'ui.bootstrap',
  'DefectsApp.controllers',
  'DefectsApp.services',
  'DefectsApp.manager',
  'ngRoute',
  'LocalStorageModule'
]);

defectsApp.config(function($routeProvider){	
	$routeProvider.
		when("/defects", {templateUrl: "partials/defects.html", controller: "projectController"}).
		when("/projects", {templateUrl: "partials/projects.html", controller: "projectsController"}).
		when("/defects/:id", {templateUrl: "partials/defects.html", controller: "projectController"}).
		when("/config", {templateUrl: "partials/config.html", controller: "configController"}).
		otherwise({redirectTo: '/defects'});

});


defectsApp.run(['$rootScope', '$location', 'APIservice', function ($rootScope, $location, APIservice) {
    $rootScope.$on('$routeChangeStart', function (event) {

        if (!APIservice.getServer()) {
            console.log('DENY');
            $location.path('/config');
        }
        else {
            console.log('ALLOW');
          //  $location.path('/defects');
        }
    });
}]);