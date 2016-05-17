
controllers.controller('configController', function($scope, $location, APIservice, projectsManager) {
    
     $scope.serverName = APIservice.getServer();
     $scope.projectID = APIservice.getProjectID();
     $scope.projectName = APIservice.getProjectName();

     APIservice.setServer($scope.serverName);

    // list all projects
     $scope.projectsList = []; 
     projectsManager.getProjects(" ").then(function(result){
        $scope.projectsList = result;
    });

     $scope.save = function(){
        // https://rally1.rallydev.com/slm/webservice/v2.0/
           APIservice.setServer($scope.serverName);
           APIservice.setProject($scope.projectID, $scope.projectName);
           $location.path("/defects");
     };

     $scope.back = function(){
            $location.path("/defects");
     }

     $scope.showProjects = function(){        
        $scope.projectsList = [];
        projectsManager.getProjects().then(function(result){
            $scope.projectsList = result;
        });
     }

 	 $scope.projectFilter = function(project){
	  	var keyword = new RegExp($scope.projectName, 'i');
	  	return (project === undefined)
	  	|| keyword.test(project._refObjectName)
	  	|| keyword.test(project.ObjectID);
 	 };

 	 $scope.selectProject = function(project){
 	 	$scope.projectID = project.ObjectID;
        $scope.projectName =  project._refObjectName;
 	 };

 	 $scope.resetServer = function(){
 	 	 //$scope.serverName = APIservice.getServer();
         APIservice.setServer($scope.serverName);

     };

     $scope.search = function(){
        APIservice.setServer($scope.serverName);
        var string = $scope.projectName;
        if(!string) string =" ";
        projectsManager.getProjects(string).then(function(result){
            $scope.projectsList = result;
        });
     };

});
