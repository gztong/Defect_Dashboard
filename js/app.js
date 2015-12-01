var defectsApp = angular.module('DefectsApp', [
  'DefectsApp.controllers',
  'DefectsApp.services',
  'DefectsApp.manager',
  'ngRoute'
]);

defectsApp.config(['$routeProvider', function($routeProvider){	
	$routeProvider.
		when("/defects", {templateUrl: "partials/defects.html", controller: "defectsController"}).
		when("/projects", {templateUrl: "partials/projects.html", controller: "projectsController"}).
		when("/defects/:id", {templateUrl: "partials/defects.html", controller: "projectController"}).
		otherwise({redirectTo: '/projects'});
}]);


//Run Block
defectsApp.run( ['$http', function ($http){
	// Predefine the API's value from Parse.com
	$http.defaults.headers.common = {
	'X-Parse-Application-Id':'hfHYNm2LY9jqxXrnOOuNQ1wTrQpL3vXDsm8obtPw',
	'X-Parse-REST-API-Key':'4OdKh69gqEucTaMKefJnHt7GFaTUGF1qxvloIWaA'
	}

}]);

