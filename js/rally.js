Rally.onReady(function() {
	console.log('onReady');
	var defectStore = Ext.create('Rally.data.lookback.SnapshotStore', {
	    //model: 'Defect', //or defectModel
	    fetch: ['Name', 'ScheduleState'],
	    filters: [{	
		    	property: '_TypeHierarchy',
		    	operator: '=',
		    	value: 'Defect'
		    	},
		    	{	
		    	//Project.ObjectID = 206537932590,
		    	property: 'State',
		    	operator: '=',
		    	value: 'Open'
		    	},
		    	{
		    		property: '__At',
		    		value: '2015-12-09T00:00:00Z'
		    	}
		 ],
	    listeners: {
	        load: function(store, records) {
	        }
	    },
	    hydrate: ['ScheduleState']
	});

	defectStore.load({
		callback: function(records, operation) {
			if(operation.wasSuccessful()) {
						console.log('load');
             	console.log(records.length);
             	for(var i=0; i<10; i++){
             		console.log(records);
             	}
        }
    }
	});

    // Rally.launchApp('Rally.example.BurnChart', {
    //   name: 'Standard Report Example'
    // });
});