angular.module('DefectsApp')
.factory('Artifact',function($http) {  
	function Artifact(Data) {
		if (Data) {
		    this.setData(Data);
		}
	// Some other initializations related to artifact
	};

    Artifact.prototype = {
	    setData: function(Data) {
	        angular.extend(this, Data);
	    },
	   
	}

	return Artifact;
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
            APIservice.getDefectsForId(id).
	            success(function(response) {
		     		var artifacts = [];
		     		response.QueryResult.Results.forEach(function(data){
		     			//var artifact = scope._retrieveInstance(data.id, data);
		     			var artifact = data;
		     			//console.log(data);
		     		//	artifact.Owner = data.Owner._refObjectName;
		     			//????
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
        			Name: data._refObjectName
        		};
        		artifacts_Objects.push(obj);
        	});
        	return artifacts_Objects;
        },

        test1: function(){
        	console.log('test');
        }

     };


    return manager;
});