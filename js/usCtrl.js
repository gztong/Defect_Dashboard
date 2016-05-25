/**
 * Created by Tong on 5/22/16.
 */

controllers.controller('usController', function($scope, $location, APIservice, usManager) {

    $scope.projectName = APIservice.getProjectName();
    $scope.loading = true;
    $scope.us_list = [];
    $scope.isToggled = [];
    $scope.nameFilter = {};

    $scope.searchFilter = function (us) {
        var keyword = new RegExp($scope.nameFilter.text, 'i');
        return ($scope.nameFilter.text === undefined)
            || keyword.test(us.ScheduleState)
            || keyword.test(us.Name)
            || keyword.test(us.FormattedID)
            || keyword.test(us.OwnerName);
    };



    // Loading user stories
    usManager.loadUserStories($scope.id, 100).then(
        function (result) {
            $scope.us_list = usManager.build_US_list(result);
        }).then(
        function () {
            usManager.getTasks( $scope.us_list ).then(function (result) {
                $scope.us_list = result;
                // [
                // us1:
                //     -_ref
                //      estimateTime
                //      tasks: [ ]
                // us2:
                // ]
            });

            // artifactsManager.getTags($scope.basicList).then(function (result) {
            //     var withTags = result;
            //     artifactsManager.getRevisions($scope.basicList).then(function (result) {
            //         //$scope.LastRevisions = result;
            //         $scope.revisionsInfo = result;
            //         $scope.defectsList = APIservice.mergeArrays($scope.basicList, $scope.revisionsInfo);
            //
            //         $scope.groupDict = APIservice.groupByDay($scope.defectsList);
            //
            //         $scope.pool.property = APIservice.getPropertyPool($scope.defectsList);
            //
            //         $scope.groupDict2 = APIservice.groupBy($scope.defectsList, 'State', $scope.pool.property);
            //
            //         // Stop spinning loader
            //         $scope.loading = false;
            //     });
            // });

            // Stop spinning loader
            $scope.loading = false;
        });


    $scope.toggleClass = function (id) {
        $scope.isToggled[id] = ($scope.isToggled[id])?(!$scope.isToggled[id]):true;
    };
    

});