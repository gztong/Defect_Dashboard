Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    launch: function() {
        var that = this;
        var minDate = new Date(new Date() - 86400000*90); //milliseconds in day = 86400000
        var datePicker = Ext.create('Ext.panel.Panel', {
            title: 'Choose start and end dates:',
            bodyPadding: 10,
            renderTo: Ext.getBody(),
            layout: 'hbox',
            items: [{
                xtype: 'rallydatepicker',
                itemId: 'from',
                minDate: minDate,
                handler: function(picker, date) {
                     that.onStartDateSelected(date);
                    }
                },
                {
                xtype: 'rallydatepicker',
                itemId: 'to',
                minDate: minDate,
                handler: function(picker, date) {
                     that.onEndDateSelected(date);
                }
            }]
        });        
        this.add(datePicker);
        var panel =  Ext.create('Ext.panel.Panel', {
            id:'infoPanel',
            componentCls: 'panel'
        });
        this.add(panel);
    },
    onStartDateSelected:function(date){
        console.log(date);
        this._startDate = date;
   },

   onEndDateSelected:function(date){
        this._endDate = date;
        console.log(date);
        Ext.getCmp('infoPanel').update('showing data between ' + this._startDate + ' and ' + this._endDate);
    this.defineCalculator();
        this.makeChart();
   },   

    defineCalculator: function(){
        var that = this;
        Ext.define("MyDefectCalculator", { 
            extend: "Rally.data.lookback.calculator.TimeSeriesCalculator",
            getMetrics: function () {
                var metrics = [
                   {
                        field: "State",
                        as: "Open",
                        display: "column",
                        f: "filteredCount",
                        filterField: "State",
                        filterValues: ["Submitted","Open"]
                   },
                    {
                        field: "State",
                        as: "Closed",
                        display: "column",
                        f: "filteredCount",
                        filterField: "State",
                        filterValues: ["Fixed","Closed"]
                    }
                ];  
                return metrics;
            }
        });
    },

    makeChart: function(){
        if (this.down('#myChart')) {
                this.remove('myChart');
        }
        var timePeriod = new Date(this._endDate - this._startDate);

        var project = this.getContext().getProject().ObjectID;

        var storeConfig = this.createStoreConfig(project, timePeriod);

        this.chartConfig.calculatorConfig.startDate = Rally.util.DateTime.format(new Date(this._startDate), 'Y-m-d');
        this.chartConfig.calculatorConfig.endDate = Rally.util.DateTime.format(new Date(this._endDate), 'Y-m-d');
        this.chartConfig.storeConfig = storeConfig;
        this.add(this.chartConfig); 
    },

    createStoreConfig : function(project, interval ) {
        return {
            listeners : { 
                load : function(store,data) {
                    console.log("data",data.length);
                }
            },
            filters: [
                {
                    property: '_ProjectHierarchy',
                    operator : 'in',
                    value : [project] 
                },
                {
                    property: '_TypeHierarchy',
                    operator: 'in',
                    value: ['Defect']
                },
                {
                    property: '_ValidFrom',
                    operator: '>=',
                    value: interval
                }

            ],
            autoLoad : true,
            limit: Infinity,
            fetch: ['State'],
            hydrate: ['State']
        };
    },
     chartConfig: {
        xtype: 'rallychart',
        itemId : 'myChart',
        chartColors: ['Red', 'Green'],

        storeConfig: { },
        calculatorType: 'MyDefectCalculator',

        calculatorConfig: {
        },

        chartConfig: {

            plotOptions: {
                column: { stacking: 'normal'}
            },
            chart: { },
            title: { text: 'Open/Closed Defects'},
            xAxis: {
                tickInterval: 1,
                labels: {
                    formatter: function() {
                        var d = new Date(this.value);
                        return ""+(d.getMonth()+1)+"/"+d.getDate();
                    }
                },
                title: {
                    text: 'Date'
                }
            },
            yAxis: [
                {
                    title: {
                        text: 'Count'
                    }
                }
            ]
            }
    }   

});