/**
 * This window will allow users to query open cases and add records to a task based on them
 */
Ext4.define('EHR.window.AddSurgicalCasesWindow', {
    extend: 'EHR.window.AddClinicalCasesWindow',
    caseCategory: 'Surgery',
    allowNoSelection: true,

    getCases: function(button){
        var filterArray = this.getFilterArray();
        if (!filterArray || !filterArray.length){
            return;
        }

        Ext4.Msg.wait("Loading...");
        this.hide();

        //find distinct animals matching criteria
        LABKEY.Query.selectRows({
            requiredVersion: 9.1,
            schemaName: 'study',
            queryName: 'cases',
            sort: 'Id', //Id/curlocation/room,Id/curlocation/cage,
            columns: 'Id,caseid,todaysRemarks',
            filterArray: filterArray,
            scope: this,
            success: this.onSuccess,
            failure: LDK.Utils.getErrorCallback()
        });
    },

    onSuccess: function(results){
        if (!results || !results.rows || !results.rows.length){
            Ext4.Msg.hide();
            Ext4.Msg.alert('', 'No active cases were found.');
            return;
        }

        LDK.Assert.assertNotEmpty('Unable to find targetStore in AddSurgicalCasesWindow', this.targetStore);

        var records = [];
        var performedby = this.down('#performedBy').getValue();

        Ext4.Array.each(results.rows, function(sr){
            var row = new LDK.SelectRowsRow(sr);

            var obj = {
                Id: row.getValue('Id'),
                date: new Date(),
                category: 'Surgery',
                s: null,
                o: null,
                a: null,
                p: null,
                caseid: row.getValue('caseid'),
                remark: row.getValue('todaysRemarks'),
                performedby: performedby
            };

            records.push(this.targetStore.createModel(obj));
        }, this);

        this.targetStore.add(records);

        Ext4.Msg.hide();
    }
});

EHR.DataEntryUtils.registerGridButton('ADDSURGICALCASES', function(config){
    return Ext4.Object.merge({
        text: 'Add Open Cases',
        tooltip: 'Click to automatically add SOAP notes based on open cases',
        handler: function(btn){
            var grid = btn.up('gridpanel');
            if(!grid.store || !grid.store.hasLoaded()){
                console.log('no store or store hasnt loaded');
                return;
            }

            var cellEditing = grid.getPlugin('cellediting');
            if(cellEditing)
                cellEditing.completeEdit();

            Ext4.create('EHR.window.AddSurgicalCasesWindow', {
                targetStore: grid.store
            }).show();
        }
    }, config);
});
