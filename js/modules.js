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
        _pool: {},
        _retrieveInstance: function(Id, Data) {
            var instance = this._pool[Id];

            if (instance) {
                instance.setData(Data);
            } else {
                instance = new Artifact(Data);
                this._pool[Id] = instance;
            }

            return instance;
        },
        _search: function(Id) {
            return this._pool[Id];
        },
        _load: function(Id, deferred) {
            var scope = this;
            // TODO
            // $http.get('ourserver/books/' + bookId)
            //     .success(function(bookData) {
            //         var book = scope._retrieveInstance(bookData.id, bookData);
            //         deferred.resolve(book);
            //     })
            //     .error(function() {
            //         deferred.reject();
            //     });
        },
        /* Public Methods */
        /* Use this function in order to get an instance by its id */
        getArtifact: function(Id) {
            var deferred = $q.defer();
            var artifact = this._search(Id);
            if (artifact) {
                deferred.resolve(artifact);
            } else {
                this._load(Id, deferred);
            }
            return deferred.promise;
        },
        loadAllArtifacts: function(id) {
            var deferred = $q.defer();
            var scope = this;
           // APIservice.getDefectsForId(id). TODO
                APIservice.tempData().
	            success(function(response) {
		     		var artifacts = [];
		     		response.QueryResult.Results.forEach(function(data){
		     			var artifact = data;
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

        		var obj = {
        			FormattedID: data.FormattedID,
        			Name: data._refObjectName,
                    RevisionRef: data.RevisionHistory._ref,
                    Owner: data.Owner
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
                window.allRevisions = results;
                results.forEach(function (val, i) {
                   // var result = APIservice.filterRevisions(val.data.QueryResult.Results, patt);
                    var result = val.data.QueryResult.Results[0];
                    //var result = filter(val.data.QueryResult.Results, patt);
                    var myDate = new Date(result.CreationDate);


                    apiList[i].RevisionCreationDate = result.CreationDate;// myDate.toLocaleString();
                    apiList[i].Revisiondesc =  result.Description;
                });
                myPromise.resolve(apiList);
                return myPromise.promise;      
            });
        },


        sortBy: function(pattStr){
            var patt = new RegExp(pattStr.toUpperCase());

            window.allRevisions.forEach(function (val, i) {
                var result = APIservice.filterRevisions(val.data.QueryResult.Results, patt);       
                window.apiList[i].RevisionCreationDate =  result.CreationDate;
                window.apiList[i].Revisiondesc =  result.Description;
                console.log("ID: " +window.apiList[i].FormattedID +", Date: "+ window.apiList[i].RevisionCreationDate);
            });

            return window.apiList;
        },
        

        test1: function(){
        	console.log('test');
        }

     };


    return manager;
});