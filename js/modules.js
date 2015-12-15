angular.module('DefectsApp')
.factory('Artifact',function($http) {  
	function Artifact(Data) {
		if (Data) {
		    this.setData(Data);
		}
	};

    Artifact.prototype = {
	    setData: function(Data) {
	        angular.extend(this, Data);
	    },
	}

	return Artifact;
});


angular.module('DefectsApp')
.factory('projectsManager',function projectsManager($http, $q, APIservice) {  
    var projectsManager = {
        getProjects: function() {
            var deferred = $q.defer();
            var scope = this;
            APIservice.getProjects().
                success(function(response) {
                    var projects = [];
                    response.QueryResult.Results.forEach(function(data){
                        var project = data;
                        projects.push(project);
                    });
                    deferred.resolve(projects);
                })
                .error(function(){
                    deferred.reject();
                });
            return deferred.promise;
        }
    }

    return projectsManager;
});


angular.module('DefectsApp.manager', [])
.factory('artifactsManager',function artifactsManager ($http, $q, Artifact, APIservice) {  
    var manager = {
        /* Public Methods */
        loadAllArtifacts: function(id, pagesize) {
            var deferred = $q.defer();
            var scope = this;
            APIservice.getDefectsForId(id, pagesize).
                //APIservice.tempData().
	            success(function(response) {
		     		var artifacts = [];
		     		response.QueryResult.Results.forEach(function(data){
		     			var artifact = data;
		     			artifact.projectID = id;
		     			artifacts.push(artifact);
		     		});
		     		deferred.resolve(artifacts);
		     	})
		     	.error(function(){
		     		deferred.reject();
		     	});
	     	return deferred.promise;
        },

        buildArtifacts: function(array){
        	var artifacts_Objects = [];

        	array.forEach(function(data){
        		var id = data._ref.substr(data._ref.lastIndexOf('/') + 1); //48046560864
        		var obj = {
        			FormattedID: data.FormattedID,
        			Name: data._refObjectName,
                    RevisionRef: data.RevisionHistory._ref,
                    tags_Ref: data._ref + '/Tags',
                    OwnerName: data.Owner ? data.Owner._refObjectName: 'No Owner',
                  //  Owner: data.Owner,
                    Tags: [],
                    //OwnerName: data.Owner._refObjectName,  ???
                    //https://rally1.rallydev.com/#/6537932590/detail/defect/48046560864
                    Url: 'https://rally1.rallydev.com/#/'+ data.projectID+ '/detail/defect/'+ id,
                    State: data.State,
                    Gone: data.State==="Fixed/Resolved"|| data.State==="Closed",
                    Severity: data.Severity,
                    Priority: data.Priority
        		};
        		artifacts_Objects.push(obj);
        	});

           // this.getRevisions(artifacts_Objects);


        	return artifacts_Objects;
        },

        getRevisions: function (array) {
            var count = 0;
            var apiList = [];
            window.apiList = apiList;
            var myPromise = $q.defer();
            array.forEach(function(obj){
                apiList.push( {'FormattedID':obj.FormattedID,
                               'ref': obj.RevisionRef} );
            });
            return $q.all(apiList.map(function (item) {
                return APIservice.getRevisions(item.ref);
            }))
            .then(function (results) {
              //  window.allRevisions = results;
                results.forEach(function (val, i) {
                    var result = val.data.QueryResult.Results[0];
                    var revisions = val.data.QueryResult.Results;

                    var myDate = new Date(result.CreationDate);

                    apiList[i].RevisionCreationDate = result.CreationDate;// myDate.toLocaleString();
                    var d = new Date(result.CreationDate);
                    apiList[i].RevisionCreationDateFormatted = d.toLocaleString();
                    apiList[i].Revisiondesc =  result.Description;
                    apiList[i].Revisions = revisions;
                });
                myPromise.resolve(apiList);
                return myPromise.promise;      
            });
        },

        getTags: function(array){
        	 var myPromise = $q.defer();
        	
        	return $q.all(array.map(function(item){
        		return APIservice.getTags(item.tags_Ref);
        	}))
        	.then(function(results){

				results.forEach(function(val, i){
					var tags = val.data.QueryResult.Results;
	    			array[i].Tags  = [];
	    			tags.forEach(function(tag){
	    				array[i].Tags .push(tag.Name);
	    			});
				});

        		myPromise.resolve(array);
        		return myPromise.promise;
        	});

        },

        sortBy: function(pattStr, arr){
            var patt = new RegExp(pattStr.toUpperCase());
            arr.forEach(function (val, i) {
                var result = APIservice.filterRevisions(val.Revisions, patt);  
                val.RevisionCreationDate = result.CreationDate;
                val.Revisiondesc = result.Description;
            });

            return arr;
        }
     };
     
    return manager;
});