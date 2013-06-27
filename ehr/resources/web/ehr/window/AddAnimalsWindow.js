/**
 * @class
 * This is the panel that appears when hitting the 'Add Bulk' button on EHR grids.  It provides a popup to find the set of
 * distinct animal IDs based on room, case, etc.
 */
Ext4.define('EHR.window.AddAnimalsWindow', {
    extend: 'Ext.window.Window',
    initComponent: function(){
        Ext4.apply(this, {
            title: 'Choose Animals',
            modal: true,
            border: true,
            bodyStyle: 'padding:5px',
            width: 350,
            defaults: {
                width: 330,
                border: false,
                bodyBorder: false
            },
            items: [{
                xtype: 'textarea',
                height: 100,
                itemId: 'subjArea',
                fieldLabel: 'Id(s)'
            },{
                xtype: 'ehr-roomfield',
                emptyText:'',
                fieldLabel: 'Room(s)',
                itemId: 'roomField'
            },{
                xtype: 'ehr-cagefield',
                itemId: 'cageField',
                fieldLabel: 'Cage'
            }],
            buttons: [{
                text:'Submit',
                disabled:false,
                ref: 'submit',
                scope: this,
                handler: function(btn){
                    this.getAnimals();
                }
            },{
                text: 'Close',
                handler: function(btn){
                    btn.up('window').hide();
                }
            }]
        });

        this.callParent(arguments);
    },

    getFilterArray: function(){
        var room = this.down('#roomField').getValue();
        room = !room || Ext4.isArray(room) ? room : [room];

        var cage = this.down('#cageField').getValue();

        var filterArray = [];

        if (!Ext4.isEmpty(room))
            filterArray.push(LABKEY.Filter.create('Id/curLocation/room', room.join(';'), LABKEY.Filter.Types.EQUALS_ONE_OF));

        if (!Ext4.isEmpty(cage))
            filterArray.push(LABKEY.Filter.create('Id/curLocation/cage', cage, LABKEY.Filter.Types.EQUAL));

        return filterArray;
    },

    getAnimals: function(){
        //we clean up, combine subjects
        var subjectList = this.down('#subjArea').getValue();
        if(subjectList){
            subjectList = subjectList.replace(/[\s,;]+/g, ';');
            subjectList = subjectList.replace(/(^;|;$)/g, '');
            subjectList = subjectList.toLowerCase();
            subjectList = subjectList.split(';');
            if(subjectList.length && this.targetStore){
                var records = [];
                Ext4.Array.forEach(subjectList, function(s){
                    records.push(this.targetStore.createModel({Id: s}));
                }, this);
                this.targetStore.add(records);
            }
        }

        var filterArray = this.getFilterArray();
        if (!subjectList && !subjectList.length && !filterArray.length){
            if(!subjectList.length)
                alert('Must Enter A Room or List of Animals');

            return;
        }

        if (filterArray.length){
            this.hide();
            Ext4.Msg.wait("Loading...");

            //find distinct animals matching criteria
            LABKEY.Query.selectRows({
                schemaName: 'study',
                queryName: 'demographics',
                sort: 'Id/curLocation/room,Id/curLocation/cage,Id',
                columns: 'Id/curLocation/room,Id/curLocation/cage,Id',
                filterArray: filterArray,
                scope: this,
                success: this.onSuccess,
                failure: LDK.Utils.getErrorCallback()
            });
        }
        else {
            this.close();
        }
    },

    onSuccess: function(results){
        if (!results.rows || !results.rows.length){
            Ext4.Msg.hide();
            Ext4.Msg.alert('', 'No matching animals were found.');
            return;
        }

        var ids = {};
        var records = [];

        Ext4.Array.forEach(results.rows, function(row){
            var obj;
            if (!ids[row.Id]){
                obj = {Id: row.Id};
                if(row.room)
                    obj['id/curlocation/location'] = row.room+'-'+row.cage;

                records.push(this.targetStore.createModel(obj));
                ids[row.Id] = 0;
            }
        }, this);

        if (this.targetStore){
            this.targetStore.add(records);
        }

        Ext4.Msg.hide();
        this.close();
    }
});
