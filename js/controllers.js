var controllers = angular.module('DefectsApp.controllers', []);


/* Projects controller */
controllers.controller('projectsController', function ($scope, $http, APIservice, projectsManager) {
    $scope.projectsList = [];
    $scope.disable = false;

    projectsManager.getProjects().then(function (result) {
        $scope.projectsList = result;
    });

});

/* Project controller */
controllers.controller('projectController', function ($scope, $routeParams, $location, APIservice, artifactsManager) {

    if (!APIservice.getServer || !APIservice.getProjectID()) {
        $location.path('/config');
    }

    //$scope.id = $routeParams.id;

    $scope.id = APIservice.getProjectID();
    $scope.projectName = APIservice.getProjectName();

    $scope.basicList = [];
    $scope.defectsList = [];
    $scope.groupDict = {};
    $scope.groupDict2 = {};
    $scope.RevisionHistory = [];
    $scope.LastRevisions = [];
    $scope.hide_filter = true;
    $scope.hideButtonText = "Show";
    $scope.orderToggled = {
        'Owner': false,
        'Package': false,
        'Changeset': false,
        'Resolution': false,
        'Tags': false,
        'Ready': false,
        'State': false,
        'Project': false
    };
    $scope.default_toggled= false;

    $scope.propertyFilter = {};
    $scope.nameFilter = {};
    $scope.pool = {};
    $scope.loading = true;

    $scope.getLabelClass = function (tag) {
        var classes = ['label-primary', 'label-danger', 'label-success', 'label-info', 'label-warning'];
        var i = hashCode(tag) % 5;
        i = i > 0 ? i : -i;
        return classes[i];
    }
    hashCode = function (s) {
        return s.split("").reduce(function (a, b) {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a
        }, 0);
    }

    $scope.searchFilter = function (defect) {
        var keyword = new RegExp($scope.nameFilter.text, 'i');
        return ($scope.nameFilter.text === undefined)
            || keyword.test(defect.Name)
            || keyword.test(defect.Severity)
            || keyword.test(defect.State)
            || keyword.test(defect.FormattedID)
            || keyword.test(defect.OwnerName);
    };

    $scope.groupFilter = function (defect) {

        for (var key in $scope.propertyFilter) {
            if (key === 'Owner') {	// 'Owner' needs to be treated specially
                //TODO
                // if( $scope.propertyFilter[key].indexOf( defect.Owner._refObjectName) >= 0 ){
                // 	continue;
                // }else{
                // 	return false;
                // }
            } else if (key === 'Tags') {
                if (defect['Tags'].length === 0 && $scope.propertyFilter[key].indexOf('No Tags') < 0) {
                    return false;
                }

                for (var i = 0; i < defect['Tags'].length; i++) {
                    if ($scope.propertyFilter[key].indexOf(defect['Tags'][i]) >= 0) {
                        continue;
                    } else {
                        return false;
                    }
                }
            } else {
                if ($scope.propertyFilter[key].indexOf(defect[key]) >= 0) {
                    continue;
                } else {
                    return false;
                }
            }
        }

        return true;
    };


    $scope.addFilter = function (key, option) {
        if ($scope.propertyFilter[key] === undefined) {
            $scope.propertyFilter[key] = [];
        }
        var index = $scope.propertyFilter[key].indexOf(option);

        if (index < 0) {
            $scope.propertyFilter[key].push(option);
        } else {
            $scope.propertyFilter[key] = $scope.propertyFilter[key].splice(index + 1, 1);
            if ($scope.propertyFilter[key].length === 0) {
                delete $scope.propertyFilter[key];
            }
        }
    }

    // Loading defects
    artifactsManager.loadAllArtifacts($scope.id, 100).then(
        function (result) {
            $scope.basicList = artifactsManager.buildArtifacts(result);
        }).then(
        function () {
            artifactsManager.getTags($scope.basicList).then(function (result) {
                var withTags = result;
                artifactsManager.getRevisions($scope.basicList).then(function (result) {
                    //$scope.LastRevisions = result;
                    $scope.revisionsInfo = result;
                    $scope.defectsList = APIservice.mergeArrays($scope.basicList, $scope.revisionsInfo);

                    $scope.groupDict = APIservice.groupByDay($scope.defectsList);

                    $scope.pool.property = APIservice.getPropertyPool($scope.defectsList);

                    $scope.groupDict2 = APIservice.groupBy($scope.defectsList, 'State', $scope.pool.property);

                    // Stop spinning loader
                    $scope.loading = false;
                });
            });

            $scope.sortRevisions = function (patt) {
                $scope.defectsList = artifactsManager.sortBy(patt, $scope.defectsList);
                $scope.groupDict = APIservice.groupByDay($scope.defectsList);
            };

            $scope.toggle_filter = function () {
                console.log('toggle_filter');
                $scope.hide_filter = !$scope.hide_filter;
                $scope.hideButtonText = $scope.hide_filter ? "Show" : "Hide";
            };

            $scope.default_toggle = function () {
                $scope.toggle('Owner');
                $scope.toggle('Package');
                $scope.toggle('Changeset');
                $scope.toggle('Resolution');
                $scope.default_toggled = !$scope.default_toggled;
            };


            $scope.toggle = function (type) {
                $scope.orderToggled[type] = !$scope.orderToggled[type];

                var patt = "";
                var count = 0;

                for (var key in $scope.orderToggled) {
                    if ($scope.orderToggled[key] === true) {
                        patt = patt + '|(' + key + ')';
                        count++;
                    }
                }

                if (count === 0) {
                    patt = '.';
                } else {
                    patt = patt.substring(1);
                }
                $scope.sortRevisions(patt);
            }


            $scope.groupBy = function (property) {
                $scope.groupDict2 = APIservice.groupBy($scope.defectsList, property, $scope.pool.property);
            }

            $scope.refresh = function (pagesize) {
                if (pagesize === undefined) {
                    pagesize = 100;
                }

                $scope.loading = true;

                artifactsManager.loadAllArtifacts($scope.id, pagesize).then(
                    function (result) {
                        $scope.basicList = artifactsManager.buildArtifacts(result);
                    }).then(
                    function () {
                        artifactsManager.getTags($scope.basicList).then(function (result) {
                            var withTags = result;
                            artifactsManager.getRevisions($scope.basicList).then(function (result) {
                                $scope.revisionsInfo = result;
                                $scope.defectsList = APIservice.mergeArrays($scope.basicList, $scope.revisionsInfo);

                                $scope.groupDict = APIservice.groupByDay($scope.defectsList);

                                $scope.pool.property = APIservice.getPropertyPool($scope.defectsList);

                                $scope.groupDict2 = APIservice.groupBy($scope.defectsList, 'State', $scope.pool.property);
                                $scope.loading = false; // Stop spinning loader
                            });
                        });
                    });

            }


            $scope.$watch(APIservice.getServer, function (value, oldValue) {

                if (!value && oldValue) {
                    console.log("Disconnect");
                    $location.path('/config');
                }

                if (value) {
                    console.log("Connect");
                    //Do something when the user is connected
                }

            }, true);


        });

});
