Rally.onReady(function() {
	// define a calculator
 Ext.define('Rally.example.BurnCalculator', {
                extend: 'Rally.data.lookback.calculator.TimeSeriesCalculator',
                config: {
                    completedScheduleStateNames: ['Accepted']
                },
            
                constructor: function(config) {
                    this.initConfig(config);
                    this.callParent(arguments);
                },
            
                getDerivedFieldsOnInput: function() {
                    var completedScheduleStateNames = this.getCompletedScheduleStateNames();
                    return [
                        {
                            "as": "Planned",
                            "f": function(snapshot) {
                                if (snapshot.PlanEstimate) {
                                    return snapshot.PlanEstimate;
                                }
            
                                return 0;
                            }
                        },
                        {
                            "as": "PlannedCompleted",
                            "f": function(snapshot) {
                                if (_.contains(completedScheduleStateNames, snapshot.ScheduleState) && snapshot.PlanEstimate) {
                                    return snapshot.PlanEstimate;
                                }
            
                                return 0;
                            }
                        }
                    ];
                },
            
                getMetrics: function() {
                    return [
                        {
                            "field": "Planned",
                            "as": "Planned",
                            "display": "line",
                            "f": "sum"
                        },
                        {
                            "field": "PlannedCompleted",
                            "as": "Completed",
                            "f": "sum",
                            "display": "column"
                        }
                    ];
                }
            });
            
            var PI_OID = 6537932590; //The ObjectID of the PI on which to burn
            
            Ext.define('Rally.example.BurnChart', {
                extend: 'Rally.app.App',
            
                requires: [
                    'Rally.example.BurnCalculator'
                ],
            
                launch: function() {
                    this.add({
                        xtype: 'rallychart',
                        storeType: 'Rally.data.lookback.SnapshotStore',
                        storeConfig: this._getStoreConfig(),
                        calculatorType: 'Rally.example.BurnCalculator',
                        calculatorConfig: {
                            completedScheduleStateNames: ['Accepted', 'Released']
                        },
                        chartConfig: this._getChartConfig()
                    });
                },
            
                /**
                 * Generate the store config to retrieve all snapshots for all leaf child stories of the specified PI
                 */
                _getStoreConfig: function() {
                    return {
                        find: {
                            _ItemHierarchy: PI_OID,
                            _TypeHierarchy: 'HierarchicalRequirement',
                            Children: null
                        },
                        fetch: ['ScheduleState', 'PlanEstimate'],
                        hydrate: ['ScheduleState'],
                        sort: {
                            _ValidFrom: 1
                        },
                        context: this.getContext().getDataContext(),
                        limit: Infinity
                    };
                },
            
                /**
                 * Generate a valid Highcharts configuration object to specify the chart
                 */
                _getChartConfig: function() {
                    return {
                        chart: {
                            defaultSeriesType: 'area',
                            zoomType: 'xy'
                        },
                        title: {
                            text: 'PI Burnup'
                        },
                        xAxis: {
                            categories: [],
                            tickmarkPlacement: 'on',
                            tickInterval: 5,
                            title: {
                                text: 'Date',
                                margin: 10
                            }
                        },
                        yAxis: [
                            {
                                title: {
                                    text: 'Points'
                                }
                            }
                        ],
                        tooltip: {
                            formatter: function() {
                                return '' + this.x + '<br />' + this.series.name + ': ' + this.y;
                            }
                        },
                        plotOptions: {
                            series: {
                                marker: {
                                    enabled: false,
                                    states: {
                                        hover: {
                                            enabled: true
                                        }
                                    }
                                },
                                groupPadding: 0.01
                            },
                            column: {
                                stacking: null,
                                shadow: false
                            }
                        }
                    };
                }
            });
    Rally.launchApp('Rally.example.StandardReport', {
      name: 'Standard Report Example'
    });
});