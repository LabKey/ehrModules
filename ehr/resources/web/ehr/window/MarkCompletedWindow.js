/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * @cfg dataRegionName
 * @cfg schemaName
 * @cfg queryName
 * @cfg fieldXtype
 */
Ext4.define('EHR.window.MarkCompletedWindow', {
    extend: 'Ext.window.Window',

    initComponent: function(){
        Ext4.apply(this, {
            modal: true,
            title: 'Set End Date',
            closeAction: 'destroy',
            width: 380,
            items: [{
                bodyStyle: 'padding: 5px;',
                items: [{
                    xtype: (this.fieldXtype || 'xdatetime'),
                    fieldLabel: 'Date',
                    width: 350,
                    value: new Date(),
                    itemId: 'dateField'
                }]
            }],
            buttons: [{
                text:'Submit',
                disabled:false,
                scope: this,
                handler: function(btn){
                    Ext4.Msg.wait('Loading...');
                    var date = btn.up('window').down('#dateField').getValue();
                    if(!date){
                        Ext4.Msg.alert('Error', 'Must enter a date');
                        return;
                    }

                    var dataRegion = LABKEY.DataRegions[this.dataRegionName];
                    var checked = dataRegion.getChecked();

                    LABKEY.Query.selectRows({
                        schemaName: this.schemaName,
                        queryName: this.queryName,
                        filterArray: [
                            LABKEY.Filter.create('lsid', checked.join(';'), LABKEY.Filter.Types.EQUALS_ONE_OF)
                        ],
                        scope: this,
                        success: function(data){
                            var toUpdate = [];
                            var skipped = [];
                            var dataRegion = LABKEY.DataRegions[this.dataRegionName];

                            if(!data.rows || !data.rows.length){
                                Ext4.Msg.hide();
                                dataRegion.selectNone();
                                dataRegion.refresh();
                                return;
                            }

                            Ext4.Array.forEach(data.rows, function(row){
                                if(!row.enddate)
                                    toUpdate.push({lsid: row.lsid, enddate: date});
                                else
                                    skipped.push(row.lsid)
                            }, this);

                            if(toUpdate.length){
                                LABKEY.Query.updateRows({
                                    schemaName: this.schemaName,
                                    queryName: this.queryName,
                                    rows: toUpdate,
                                    scope: this,
                                    success: function(){
                                        this.close();
                                        Ext4.Msg.hide();
                                        dataRegion.selectNone();
                                        dataRegion.refresh();
                                    },
                                    failure: LDK.Utils.getErrorCallback()
                                });
                            }
                            else {
                                Ext4.Msg.hide();
                                dataRegion.selectNone();
                                dataRegion.refresh();
                            }

                            if(skipped.length){
                                Ext4.Msg.alert('', 'One or more rows was skipped because it already has an end date');
                            }
                        },
                        failure: LDK.Utils.getErrorCallback()
                    });
                }
            },{
                text: 'Close',
                handler: function(btn){
                    btn.up('window').close();
                }
            }]
        });

        this.callParent();
    }
});