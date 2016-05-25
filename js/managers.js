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
        getProjects: function(str) {
            var deferred = $q.defer();
            var scope = this;
            APIservice.getProjects(str).
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


angular.module('DefectsApp.manager')
    .factory('usManager', function usManager($http, $q, Artifact, APIservice) {
        var manager = {
            loadUserStories: function (id, pagesize) {
                var deferred = $q.defer();
                // APIservice.getUSForId(id, pagesize).
                APIservice.tempData().  //DEBUG
                success(function (response) {
                    var us_list = [];
                    response.QueryResult.Results.forEach(function (data) {
                        var us = data;
                        us.projectID = id;
                        us_list.push(us);
                    });
                    deferred.resolve(us_list);
                })
                .error(function () {
                    deferred.reject();
                });
                return deferred.promise;
            },

            build_US_list: function (array) {
                var us_list = [];

                array.forEach(function (data) {
                    //var id = data._ref.substr(data._ref.lastIndexOf('/') + 1); //48046560864
                    var obj = {
                        ref: data._ref,
                        FormattedID: data.FormattedID,
                        Name: data._refObjectName,
                        //RevisionRef: data.RevisionHistory._ref,
                        OwnerName: data.Owner ? data.Owner._refObjectName : 'No Owner',
                        Tags: [],
                        //https://rally1.rallydev.com/#/6537932590/detail/defect/48046560864
                        Url: 'https://rally1.rallydev.com/#/' + data.projectID + '/detail/userstory/' + data.ObjectID,
                        ScheduleState: data.ScheduleState,
                        // Gone: data.ScheduleState==="Fixed/Resolved"|| data.ScheduleState==="Closed",
                        TaskActualTotal: data.TaskActualTotal,
                        TaskEstimateTotal: data.TaskEstimateTotal,
                        TaskRemainingTotal: data.TaskRemainingTotal
                    };
                    us_list.push(obj);
                });


                return us_list;
            },


            getTasks: function (us_list) {
                // array: user story list
                var myPromise = $q.defer();

                return $q.all(us_list.map(function (item) {
                    return APIservice.getTasks(item.ref);
                }))
                    .then(function (results) {
                        // results: task_lists of all user stories
                        results.forEach(function (val, i) {  // val: task_list of each user story
                            var tasks = val.data.QueryResult.Results;
                            us_list[i].tasks = [];
                            tasks.forEach(function (task) {
                                us_list[i].tasks.push(task);
                            });
                        });

                        myPromise.resolve(us_list);
                        return myPromise.promise;
                    });
            }


        };

        return manager;
    })
    .directive('timeChart', function () {
        return {
            restrict: 'E',
            template: '<div height="100px" width="100px"></div>',
            scope: {
                data: '='
            },
            link: function (scope, element) {
                var percentComplete = Math.floor((scope.data.TaskEstimateTotal - scope.data.TaskRemainingTotal) / scope.data.TaskEstimateTotal * 100);
                if (scope.data.TaskEstimateTotal != 0) 
                    Highcharts.chart(element[0], {
                        credits: {
                            enabled: false
                        },
                        chart: {
                            type: 'pie',
                            width: 200,
                            height: 150,
                            align: 'center',
                        },
                        title: {
                            text: percentComplete + '%',
                            align: 'center',
                            verticalAlign: 'middle'
                        },
                        plotOptions: {
                            pie: {
                                allowPointSelect: false,
                                dataLabels: {
                                    enabled: false,
                                    format: '<b>{point.name}</b>: {point.x} hours'
                                },
                                size: '80%'
                            }
                        },
                        series: [{
                            name : " ",
                            showInLegend: false,
                            allowPointSelect: false,
                            innerSize: '78%',
                            data: [
                                ['Hours Completed', scope.data.TaskEstimateTotal - scope.data.TaskRemainingTotal],
                                ['Hours Remaining', scope.data.TaskRemainingTotal]
                            ]
                        }]
                    });
                else Highcharts.chart(element[0], {
                    chart: {
                        type: 'pie',
                        width: 200,
                        height: 150
                    },
                    title: {
                        text: 'No Tasks to Complete',
                        align: 'center',
                        verticalAlign: 'middle',
                        y: -20
                    },
                    plotOptions: {
                        pie: {
                            allowPointSelect: false,
                            dataLabels: {
                                enabled: false
                            },
                            size: '80%'
                        }
                    },
                    credits: {
                        enabled: false
                    }

                });
            }
        };
    });

