/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

EHR.DataEntryUtils.registerGridButton('ROOM_LAYOUT', function(config){
    return Ext4.Object.merge({
        text: 'View Room Layout',
        tooltip: 'Click to delete selected rows',
        handler: function(btn){
            Ext4.create('Ext.window.Window', {
                title: 'View Room Layout',
                modal: true,
                width: 450,
                bodyStyle: 'padding: 5px;',
                closeAction: 'destroy',
                items: [{
                    html: 'Select either a room or an area to view the cages in that location.',
                    style: 'padding-bottom: 10px;',
                    border: false
                },{
                    xtype: 'ehr-areafield',
                    itemId: 'areaField',
                    multiSelect: false,
                    width: 400,
                    listeners: {
                        change: function(field, val){
                            if (val){
                                field.up('window').down('#roomField').reset();
                            }
                        }
                    }
                },{
                    xtype: 'ehr-roomfield',
                    itemId: 'roomField',
                    multiSelect: false,
                    width: 400,
                    listeners: {
                        change: function(field, val){
                            if (val){
                                field.up('window').down('#areaField').reset();
                            }
                        }
                    }
                }],
                buttons: [{
                    text: 'Submit',
                    handler: function(btn){
                        var win = btn.up('window');
                        var area = win.down('#areaField').getValue();
                        var room = win.down('#roomField').getValue();
                        if (!area && !room){
                            Ext4.Msg.alert('Error', 'Must enter either a room or area');
                            return;
                        }

                        if (area){
                            window.open(LABKEY.ActionURL.buildURL('onprc_ehr', 'areaDetails', null, {area: area}));
                        }
                        else if (room){
                            window.open(LABKEY.ActionURL.buildURL('ehr', 'cageDetails', null, {room: room}));
                        }

                        win.close();
                    }
                },{
                    text: 'Cancel',
                    handler: function(btn){
                        btn.up('window').close();
                    }
                }]
            }).show();
        }
    }, config);
});