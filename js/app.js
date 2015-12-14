var defectsApp = angular.module('DefectsApp', [
  'ui.bootstrap',
  'DefectsApp.controllers',
  'DefectsApp.services',
  'DefectsApp.manager',
  'ngRoute'
]);

angular.module('myModule', ['ui.bootstrap']);

defectsApp.config(['$routeProvider', function($routeProvider){	
	$routeProvider.
		when("/defects", {templateUrl: "partials/defects.html", controller: "projectController"}).
		when("/projects", {templateUrl: "partials/projects.html", controller: "projectsController"}).
		when("/defects/:id", {templateUrl: "partials/defects.html", controller: "projectController"}).
		otherwise({redirectTo: '/projects'});
}]);

