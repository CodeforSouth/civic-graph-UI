(function (angular) {

    'use strict';

    var homeDependencies = [
        '$scope',
        '$timeout',
        '_',
        'entityService',
        'connectionService',
        homeCtrl
    ];

    function homeCtrl($scope, $timeout, _, entityService, connectionService) {
        var self = this;

        self.minConnections = $scope.minConnections = 2;

        $scope.entities = [];
        $scope.searchItems = null;
        $scope.currentLocation = null;
        $scope.clickedEntity = { entity: null };
        $scope.editing = false;
        $scope.actions = { 'interacted': false };
        $scope.showsearchMB = false;
        $scope.entityTypes = entityService.getEntityTypes();
        $scope.connectionTypes = connectionService.getConnectionTypes();
        $scope.status = {
            "isNetworkShown": true,
            "license": true,
            "networkLoading": true
        };
        $scope.mobile = mobileCheck();
        $scope.settingsEnabled = !$scope.mobile;

        $scope.showSearch = showSearch;
        $scope.toggleSettings = toggleSettings;
        $scope.startEdit = startEdit;
        $scope.switchView = switchView;
        $scope.setEntity = setEntity;
        $scope.setEntityID = setEntityID;
        $scope.setLocation = setLocation;
        $scope.selectItem = selectItem;

        $scope.$watch('minConnections', watchMinConnection);

        $scope.$on('setCurrentEntity', onSetCurrentEntity);
        $scope.$on('setCurrentLocation', onSetCurrentLocation);
        $scope.$on("editEntitySuccess", onEditEntitySuccess);

        $timeout(function () {
            entityService
                .getAll()
                .then(function (data) {
                    console.log(data);
                    $scope.entities = data.nodes;
                    var locations = _.uniq(
                        _.pluck(_.flatten(_.pluck($scope.entities, 'locations')), 'locality'));

                    var entitiesByLocation = _.map(locations, function (loc) {
                        var findings = _.filter($scope.entities, _.flow(
                            _.property('locations'),
                            _.partialRight(_.any, { locality: loc })
                        ));

                        return {
                            name: loc,
                            type: 'location',
                            entities: findings,
                            dict: _.zipObject(_.pluck(findings, 'name'),
                                _.pluck(findings, 'index'))
                        };
                    });

                    $scope.searchItems = entitiesByLocation.concat($scope.entities);

                    $scope.$broadcast('triggerNetworkDraw');
                });
        }, 100);

        function watchMinConnection() {
            $scope.$broadcast('triggerNetworkDraw');
        }

        function hydePartials(except) {
            if (except === "search") {
                $scope.editing = false;
                $scope.settingsEnabled = false;
            } else if (except === "settings") {
                $scope.editing = false;
                $scope.showsearchMB = false;
            } else if (except === "edit") {
                $scope.settingsEnabled = false;
                $scope.showsearchMB = false;
            } else {
                $scope.editing = false;
                $scope.settingsEnabled = false;
                $scope.showsearchMB = false;
            }

        }

        function showSearch() {
            hydePartials("search");
            $scope.showsearchMB = !$scope.showsearchMB;
            // $scope.$broadcast('hideLicense');
            $scope.status.license = false;
        }

        function toggleSettings() {
            hydePartials("settings");
            $scope.settingsEnabled = !$scope.settingsEnabled;
        }

        function startEdit(entity) {
            $scope.currentEntity = entity;
            if ($scope.mobile) {
                hydePartials("edit");
            }
            $scope.editing = true;
        }

        function switchView() {
            $scope.status.isNetworkShown = !$scope.status.isNetworkShown;
            if ($scope.status.isNetworkShown) {
                $scope.$broadcast('triggerNetworkDraw');
            }
        }

        function mobileCheck() {
            var check = false,
                regex = /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i,
                regex2 = /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i;
            (function (a) {
                if (regex.test(a) || regex2.test(a.substr(0, 4))) {
                    check = true;
                }
            })(navigator.userAgent || navigator.vendor || window.opera);
            return check;
        }

        function setEntity(entity) {
            $scope.currentLocation = null;
            $scope.currentEntity = entity;
            if ($scope.editing) {
                stopEdit();
            }
            $scope.$broadcast('entityChange');
        }

        function setEntityID(id) {
            setEntity(_.find($scope.entities, { 'id': id }));
        }

        function setLocation(location) {
            $scope.currentLocation = location;
            if ($scope.editing) {
                stopEdit();
            }
            $scope.$broadcast('itemChange');
        }

        function selectItem(item) {
            var fn = (item % 1 === 0 ? setEntityID : setEntity);

            if (item.type === 'location') {
                setLocation(item);
            }
            else {
                fn(item);
            }
            $scope.$broadcast('selectItem', item);
        }

        function onSetCurrentEntity(event, args) {
            $scope.currentEntity = args.value;
        }

        function onSetCurrentLocation(event, args) {
            $scope.currentLocation = args.value;
        }

        function setEntities(entities) {
            $scope.entities = entities;
        }

        function stopEdit() {
            $scope.editing = false;
        }

        function onEditEntitySuccess(response) {
            setEntities(response.nodes);
            $scope.$broadcast('triggerNetworkDraw');
        }
    }

    angular.module('civic-graph')
        .controller('homeCtrl', homeDependencies);

})(angular);
